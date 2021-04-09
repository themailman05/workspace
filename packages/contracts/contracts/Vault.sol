// SPDX-License-Identifier: MIT

pragma solidity >=0.7.0 <0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/SafeERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";

interface YearnVault is IERC20 {
  function token() external view returns (address);
  function deposit(uint256 amount) external returns (uint256);
  function withdraw() external returns (uint256);
  function pricePerShare() external view returns (uint256);
}

interface UniswapRouter {
  function swapExactTokensForTokens(
    uint256 amountIn,
    uint256 amountOutMin,
    address[] calldata path,
    address to,
    uint256 deadline
  ) external returns (uint[] memory amounts);
}

interface DAI is IERC20 {}

interface USDX is IERC20 {}

contract Vault is ERC20 {

  using SafeMath for uint256;
  using SafeERC20 for IERC20;

  DAI public dai;
  USDX public usdx;
  YearnVault public yearnVault;
  UniswapRouter public uniswapRouter;

  constructor(
    DAI dai_,
    USDX usdx_,
    YearnVault yearnVault_,
    UniswapRouter uniswapRouter_
  ) ERC20("Popcorn DAI Vault", "popDAI") {
    dai = dai_;
    usdx = usdx_;
    yearnVault = yearnVault_;
    uniswapRouter = uniswapRouter_;
  }

  function totalAssets() external view returns (uint256) {
    uint256 daiBalance = dai.balanceOf(address(this));
    uint256 yearnBalance = yearnVault.balanceOf(address(this));
    uint256 yearnValue = yearnVault.pricePerShare() * yearnBalance;
    return daiBalance + yearnValue;
  }

  function deposit(uint256 amount) external returns (uint256) {
    _mint(msg.sender, amount);

    dai.transferFrom(msg.sender, address(this), amount);
    dai.approve(address(uniswapRouter), amount);

    address[] memory path = new address[](2);
    path[0] = address(dai);
    path[1] = address(usdx);

    uniswapRouter.swapExactTokensForTokens(
      amount,
      0,
      path,
      address(this),
      block.timestamp + 10 minutes
    );

    usdx.approve(address(yearnVault), amount);
    yearnVault.deposit(amount);

    return dai.balanceOf(address(this));
  }

}
