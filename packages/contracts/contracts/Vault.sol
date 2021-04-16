// SPDX-License-Identifier: MIT

pragma solidity >=0.7.0 <0.8.0;

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

interface CurveDepositZap {
  function add_liquidity(uint256[4] calldata amounts, uint256 min_mint_amounts) external returns (uint256);
  function remove_liquidity_one_coin(uint256 amount, int128 i, uint256 min_underlying_amount) external returns (uint256);
}

interface DAI is IERC20 {}

interface CrvUSDX is IERC20 {}

contract Vault is ERC20 {

  using SafeMath for uint256;
  using SafeERC20 for IERC20;

  DAI public dai;
  CrvUSDX public crvUsdx;
  YearnVault public yearnVault;
  CurveDepositZap public curveDepositZap;
  address public rewardsManager;

  uint256 WITHDRAWAL_FEE_BPS = 50;

  constructor(
    DAI dai_,
    CrvUSDX crvUsdx_,
    YearnVault yearnVault_,
    CurveDepositZap curveDepositZap_,
    address rewardsManager_
  ) ERC20("Popcorn DAI Vault", "popDAI") {
    dai = dai_;
    crvUsdx = crvUsdx_;
    yearnVault = yearnVault_;
    curveDepositZap = curveDepositZap_;
    rewardsManager = rewardsManager_;
  }

  function totalAssets() external view returns (uint256) {
    uint256 yearnBalance = yearnVault.balanceOf(address(this));
    return yearnVault.pricePerShare() * yearnBalance / 10 ** 18;
  }

  function deposit(uint256 amount) external returns (uint256) {
    _mint(msg.sender, amount);

    dai.transferFrom(msg.sender, address(this), amount);
    dai.approve(address(curveDepositZap), amount);

    uint256[4] memory curveDepositAmounts = [
      0,      // USDX
      amount, // DAI
      0,      // USDC
      0       // USDT
    ];
    curveDepositZap.add_liquidity(curveDepositAmounts, 0);

    crvUsdx.approve(address(yearnVault), amount);
    yearnVault.deposit(amount);

    return this.balanceOf(msg.sender);
  }

  function withdraw(uint256 amount) external returns (uint256) {
    assert(amount <= this.balanceOf(msg.sender));

    uint256 yearnBalance = yearnVault.balanceOf(address(this));
    uint256 share = amount * 10 ** 18 / this.totalSupply();
    uint256 yvUsdxWithdrawal = yearnBalance * share / 10 ** 18;

    _burn(msg.sender, amount);

    uint256 crvUsdxAmount = yearnVault.withdraw(yvUsdxWithdrawal);
    crvUsdx.approve(address(curveDepositZap), crvUsdxAmount);

    uint256 daiAmount = curveDepositZap.remove_liquidity_one_coin(crvUsdxAmount, 1, 0);

    uint256 withdrawalFee = daiAmount * WITHDRAWAL_FEE_BPS / 10000;
    uint256 withdrawalAmount = daiAmount - withdrawalFee;

    dai.approve(address(this), withdrawalFee);
    dai.transferFrom(address(this), rewardsManager, withdrawalFee);

    dai.approve(address(this), withdrawalAmount);
    dai.transferFrom(address(this), msg.sender, withdrawalAmount);
    return withdrawalAmount;
  }

}
