// SPDX-License-Identifier: MIT

pragma solidity >=0.7.0 <0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/SafeERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "./Defended.sol";
import "./Interfaces/Cooperations/YearnVault.sol";
import "./Interfaces/Cooperations/CurveContracts.sol";

contract BatchSetInteraction is
  ERC20,
  Ownable,
  ReentrancyGuard,
  Pausable,
  Defended
{
  using SafeMath for uint256;
  using SafeERC20 for ThreeCrv;
  using SafeERC20 for CrvLPToken;
  using SafeERC20 for YearnVault;

  /* ========== STATE VARIABLES ========== */

  ThreeCrv public threeCrv;
  CrvLPToken public crvLPToken;
  YearnVault public yearnVault;
  CurveAddressProvider public curveAddressProvider;
  CurveRegistry public curveRegistry;
  CurveMetapool public curveMetapool;
  address public rewardsManager;

  uint256 constant BPS_DENOMINATOR = 10_000;
  uint256 constant SECONDS_PER_YEAR = 31_556_952;

  uint256 public withdrawalFee = 50;
  uint256 public managementFee = 200;
  uint256 public performanceFee = 2000;
  uint256 public poolTokenHWM = 1e18;
  uint256 public feesUpdatedAt;
  mapping(address => uint256) public blockLocks;

  /* ========== EVENTS ========== */

  event Deposit(address indexed from, uint256 deposit, uint256 poolTokens);
  event Withdrawal(address indexed to, uint256 amount);
  event WithdrawalFee(address indexed to, uint256 amount);
  event PerformanceFee(uint256 amount);
  event ManagementFee(uint256 amount);
  event WithdrawalFeeChanged(uint256 previousBps, uint256 newBps);
  event ManagementFeeChanged(uint256 previousBps, uint256 newBps);
  event PerformanceFeeChanged(uint256 previousBps, uint256 newBps);

  /* ========== CONSTRUCTOR ========== */

  constructor(
    address threeCrv_,
    address curveAddressProvider_,
  ) {
    require(address(threeCrv_) != address(0));
    require(address(curveAddressProvider_) != address(0));
 
    threeCrv = ThreeCrv(threeCrv_);
    curveAddressProvider = CurveAddressProvider(curveAddressProvider_);
    curveRegistry = CurveRegistry(curveAddressProvider.get_registry());
  }

  /* ========== VIEWS ========== */

  /* ========== MUTATIVE FUNCTIONS ========== */

  function deposit(uint256 amount)
    external
    defend
    nonReentrant
    whenNotPaused
    blockLocked
    returns (uint256)
  {
    require(amount <= threeCrv.balanceOf(msg.sender), "Insufficient balance");
    _lockForBlock(msg.sender);
    _takeFees();

    uint256 poolTokens = _issuePoolTokensForAmount(msg.sender, amount);
    emit Deposit(msg.sender, amount, poolTokens);

    threeCrv.safeTransferFrom(msg.sender, address(this), amount);
    uint256 crvLPTokenAmount = _sendToCurve(amount);
    _sendToYearn(crvLPTokenAmount);

    _reportPoolTokenHWM();
    return balanceOf(msg.sender);
  }

  function withdraw(uint256 amount)
    external
    nonReentrant
    blockLocked
    returns (uint256, uint256)
  {
    require(amount <= balanceOf(msg.sender), "Insufficient pool token balance");

    _lockForBlock(msg.sender);
    _takeFees();

    uint256 threeCrvAmount = _withdrawPoolTokens(msg.sender, amount);
    uint256 fee = _calculateWithdrawalFee(threeCrvAmount);
    uint256 withdrawal = threeCrvAmount.sub(fee);

    _transferWithdrawalFee(fee);
    _transferWithdrawal(withdrawal);

    _reportPoolTokenHWM();

    return (withdrawal, fee);
  }

  function takeFees() external nonReentrant {
    _takeFees();
    _reportPoolTokenHWM();
  }

  /* ========== RESTRICTED FUNCTIONS ========== */

  function _yearnShareValue(uint256 yvShares) internal view returns (uint256) {
    uint256 crvLPTokens = yearnVault.getPricePerFullShare().mul(yvShares).div(
      1e18
    );
    uint256 virtualPrice = curveMetapool.get_virtual_price();
    return crvLPTokens.mul(virtualPrice).div(1e18);
  }

  function _transferWithdrawal(uint256 withdrawal) internal {
    _transferThreeCrv(msg.sender, withdrawal);
    emit Withdrawal(msg.sender, withdrawal);
  }

  function _transferThreeCrv(address to, uint256 amount) internal {
    threeCrv.safeIncreaseAllowance(address(this), amount);
    threeCrv.safeTransferFrom(address(this), to, amount);
  }

  function _sendToCurve(uint256 amount) internal returns (uint256) {
    threeCrv.safeIncreaseAllowance(address(curveMetapool), amount);
    uint256[2] memory curveDepositAmounts = [
      0, // USDX
      amount // 3Crv
    ];
    return curveMetapool.add_liquidity(curveDepositAmounts, 0);
  }

  function _crvBalance() internal view returns (uint256) {
    return crvLPToken.balanceOf(address(this));
  }

  function _withdrawFromCurve(uint256 crvLPTokenAmount)
    internal
    returns (uint256)
  {
    crvLPToken.safeIncreaseAllowance(address(curveMetapool), crvLPTokenAmount);
    return curveMetapool.remove_liquidity_one_coin(crvLPTokenAmount, 1, 0);
  }

  function _sendToYearn(uint256 amount) internal returns (uint256) {
    crvLPToken.safeIncreaseAllowance(address(yearnVault), amount);
    uint256 yearnBalanceBefore = _yearnBalance();
    yearnVault.deposit(amount);
    uint256 yearnBalanceAfter = _yearnBalance();
    return yearnBalanceAfter.sub(yearnBalanceBefore);
  }

  function _yearnBalance() internal view returns (uint256) {
    return yearnVault.balanceOf(address(this));
  }

  function _withdrawFromYearn(uint256 yvShares) internal returns (uint256) {
    uint256 crvBalanceBefore = _crvBalance();
    yearnVault.withdraw(yvShares);
    uint256 crvBalanceAfter = _crvBalance();
    return crvBalanceAfter.sub(crvBalanceBefore);
  }

  /* ========== SETTER ========== */

  /* ========== MODIFIER ========== */

  modifier blockLocked() {
    require(blockLocks[msg.sender] < block.number, "Locked until next block");
    _;
  }
}
