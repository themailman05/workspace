// SPDX-License-Identifier: MIT

pragma solidity >=0.7.0 <0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/SafeERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";

import "hardhat/console.sol";

interface YearnVault is IERC20 {
  function token() external view returns (address);
  function deposit(uint256 amount) external returns (uint256);
  function withdraw(uint256 amount) external returns (uint256);
  function pricePerShare() external view returns (uint256);
}

interface CurveAddressProvider {
  function get_registry() external view returns (address);
}

interface CurveRegistry {
  function get_pool_from_lp_token(address lp_token) external view returns (address);
}

interface CurveDepositZap {
  function add_liquidity(uint256[4] calldata amounts, uint256 min_mint_amounts) external returns (uint256);
  function remove_liquidity_one_coin(uint256 amount, int128 i, uint256 min_underlying_amount) external returns (uint256);
  function calc_withdraw_one_coin(uint256 amount, int128 i) external view returns (uint256);
}

interface DAI is IERC20 {}

interface CrvLPToken is IERC20 {}

contract Pool is ERC20, Ownable {

  using SafeMath for uint256;
  using SafeERC20 for IERC20;

  DAI public dai;
  CrvLPToken public crvLPToken;
  YearnVault public yearnVault;
  CurveDepositZap public curveDepositZap;
  address public rewardsManager;
  address public governance;

  uint256 constant BPS_DENOMINATOR = 10000;
  uint256 constant YEARN_PRECISION = 10e17;
  uint256 constant SECONDS_PER_YEAR = 31556952;

  uint256 public withdrawalFee = 50;
  uint256 public managementFee = 200;
  uint256 public performanceFee = 2000;
  uint256 public deployedAt;
  uint256 public feesUpdatedAt;
  uint256 public poolTokenHWM = 10e17;

  event Deposit(address from, uint256 deposit, uint256 poolTokens);
  event Withdrawal(address to, uint256 amount);
  event WithdrawalFee(address to, uint256 amount);
  event PerformanceFee(uint256 amount);
  event ManagementFee(uint256 amount);
  event WithdrawalFeeChanged(uint256 previousBps, uint256 newBps);
  event ManagementFeeChanged(uint256 previousBps, uint256 newBps);
  event PerformanceFeeChanged(uint256 previousBps, uint256 newBps);

  constructor(
    DAI dai_,
    YearnVault yearnVault_,
    CurveDepositZap curveDepositZap_,
    address rewardsManager_
  ) ERC20("Popcorn DAI Pool", "popDAI") {
    dai = dai_;
    yearnVault = yearnVault_;
    crvLPToken = CrvLPToken(yearnVault.token());
    curveDepositZap = curveDepositZap_;
    rewardsManager = rewardsManager_;
    deployedAt = block.timestamp;
    feesUpdatedAt = block.timestamp;
  }

  function totalValue() external view returns (uint256) {
    return _totalValue();
  }

  function poolTokenValue() external view returns (uint256) {
    return this.valueFor(10 ** this.decimals());
  }

  function valueFor(uint256 poolTokens) external view returns (uint256) {
    uint256 yvShares = _yearnSharesFor(poolTokens);
    uint256 shareValue =_yearnShareValue(yvShares);
    uint256 fee = _calculateWithdrawalFee(shareValue);
    return shareValue - fee;
  }

  function deposit(uint256 amount) external returns (uint256) {
    uint256 poolTokens = _issuePoolTokens(msg.sender, amount);
    emit Deposit(msg.sender, amount, poolTokens);

    dai.transferFrom(msg.sender, address(this), amount);
    uint256 crvLPTokenAmount = _sendToCurve(amount);
    _sendToYearn(crvLPTokenAmount);

    _takeFees();
    _reportPoolTokenHWM();

    return this.balanceOf(msg.sender);
  }

  function withdraw(uint256 amount) external returns (uint256 withdrawalAmount, uint256 feeAmount) {
    assert(amount <= this.balanceOf(msg.sender));

    _takeFees();

    uint256 yvShareWithdrawal = _yearnSharesFor(amount);

    _burnPoolTokens(msg.sender, amount);

    uint256 crvLPTokenAmount = _withdrawFromYearn(yvShareWithdrawal);
    uint256 daiAmount = _withdrawFromCurve(crvLPTokenAmount);

    uint256 fee = _calculateWithdrawalFee(daiAmount);
    uint256 withdrawal = daiAmount - fee;
    _transferWithdrawalFee(fee);
    _transferWithdrawal(withdrawal);

    _reportPoolTokenHWM();

    return (withdrawal, fee);
  }

  function setWithdrawalFee(uint256 withdrawalFee_) public onlyOwner {
    require(withdrawalFee != withdrawalFee_, "Same withdrawalFee");
    uint256 _previousWithdrawalFee = withdrawalFee;
    withdrawalFee = withdrawalFee_;
    emit WithdrawalFeeChanged(_previousWithdrawalFee, withdrawalFee);
  }

  function setManagementFee(uint256 managementFee_) public onlyOwner {
    require(managementFee != managementFee_, "Same managementFee");
    uint256 _previousManagementFee = managementFee;
    managementFee = managementFee_;
    emit ManagementFeeChanged(_previousManagementFee, managementFee);
  }

  function setPerformanceFee(uint256 performanceFee_) public onlyOwner {
    require(performanceFee != performanceFee_, "Same performanceFee");
    uint256 _previousPerformanceFee = performanceFee;
    performanceFee = performanceFee_;
    emit PerformanceFeeChanged(_previousPerformanceFee, performanceFee);
  }

  function takeFees() public {
    _takeFees();
    _reportPoolTokenHWM();
  }

  function _reportPoolTokenHWM() internal {
    if (this.poolTokenValue() > poolTokenHWM) {
      poolTokenHWM = this.poolTokenValue();
    }
  }

  function _issueTokensForFeeAmount(uint256 amount) internal {
    uint256 tokens = amount * this.poolTokenValue() / (10 ** this.decimals());
    _issuePoolTokens(address(this), tokens);
  }

  function _takeManagementFee() internal {
    uint256 period = block.timestamp - feesUpdatedAt;
    uint256 fee = (
      (managementFee * this.totalValue() * period) /
      (SECONDS_PER_YEAR * BPS_DENOMINATOR)
    );
    _issueTokensForFeeAmount(fee);
    emit ManagementFee(fee);
  }

  function _takePerformanceFee() internal {
    int256 gain = int256(this.poolTokenValue()) - int256(poolTokenHWM);
    if (gain > 0) {
      uint256 changeInValuePerToken = uint256(gain);
      uint256 fee = performanceFee * changeInValuePerToken * this.totalSupply() / BPS_DENOMINATOR / 10e17;
      _issueTokensForFeeAmount(fee);
      emit PerformanceFee(fee);
    }
  }

  function _takeFees() internal {
    _takeManagementFee();
    _takePerformanceFee();
    feesUpdatedAt = block.timestamp;
  }

  function _yearnShareValue(uint256 yvShares) internal view returns (uint256) {
    uint256 crvLPTokens = yearnVault.pricePerShare() * yvShares / YEARN_PRECISION;
    return curveDepositZap.calc_withdraw_one_coin(crvLPTokens, 1);
  }

  function _totalValue() internal view returns (uint256) {
    uint256 yvShareBalance = yearnVault.balanceOf(address(this));
    return _yearnShareValue(yvShareBalance);
  }

  function _issuePoolTokens(address to, uint256 amount) internal returns (uint256 issuedAmount) {
    _mint(to, amount);
    return amount;
  }

  function _burnPoolTokens(address from, uint256 amount) internal returns (uint256 burnedAmount) {
    _burn(from, amount);
    return amount;
  }

  function _sendToCurve(uint256 amount) internal returns (uint256 crvLPTokenAmount) {
    dai.approve(address(curveDepositZap), amount);
    uint256[4] memory curveDepositAmounts = [
      0,      // USDX
      amount, // DAI
      0,      // USDC
      0       // USDT
    ];
    return curveDepositZap.add_liquidity(curveDepositAmounts, 0);
  }

  function _sendToYearn(uint256 amount) internal returns (uint256 yvShareAmount) {
    crvLPToken.approve(address(yearnVault), amount);
    return yearnVault.deposit(amount);
  }

  function _poolShareFor(uint256 poolTokenAmount) internal view returns (uint256) {
    if (this.totalSupply() ==  0) {
      return 1 * YEARN_PRECISION;
    }
    return poolTokenAmount * YEARN_PRECISION / this.totalSupply();
  }

  function _yearnSharesFor(uint256 poolTokenAmount) internal view returns (uint256) {
    uint256 yearnBalance = yearnVault.balanceOf(address(this));
    return yearnBalance * _poolShareFor(poolTokenAmount) / YEARN_PRECISION;
  }

  function _withdrawFromYearn(uint256 yvShares) internal returns (uint256) {
    return yearnVault.withdraw(yvShares);
  }

  function _withdrawFromCurve(uint256 crvLPTokenAmount) internal returns (uint256) {
    crvLPToken.approve(address(curveDepositZap), crvLPTokenAmount);
    return curveDepositZap.remove_liquidity_one_coin(crvLPTokenAmount, 1, 0);
  }

  function _calculateWithdrawalFee(uint256 withdrawalAmount) internal view returns (uint256) {
    return withdrawalAmount * withdrawalFee / BPS_DENOMINATOR;
  }

  function _transferWithdrawalFee(uint256 fee) internal {
    _transferDai(rewardsManager, fee);
    emit WithdrawalFee(rewardsManager, fee);
  }

  function _transferWithdrawal(uint256 withdrawal) internal {
    _transferDai(msg.sender, withdrawal);
    emit Withdrawal(msg.sender, withdrawal);
  }

  function _transferDai(address to, uint256 amount) internal {
    dai.approve(address(this), amount);
    dai.transferFrom(address(this), to, amount);
  }
}
