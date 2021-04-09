// SPDX-License-Identifier: MIT

pragma solidity >=0.7.0 <0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/SafeERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";

interface YearnVault is IERC20 {
  function token() external view returns (address);
  function deposit() external returns (uint256);
  function withdraw() external returns (uint256);
}

interface DAI is IERC20 {}

interface USDX is IERC20 {}

interface UniswapRouter {}

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

  function deposit(uint256 amount) external returns (uint256) {
    dai.transferFrom(msg.sender, address(this), amount);
    return dai.balanceOf(address(this));
  }
}
