// SPDX-License-Identifier: MIT

pragma solidity >=0.6.0 <0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MockUniswapV2Router02 {

  function swapExactTokensForTokens(
    uint256 amountIn,
    uint256 amountOutMin,
    address[] calldata path,
    address to,
    uint256 deadline
  ) external returns (uint[] memory amounts) {
    ERC20 inToken = ERC20(path[0]);
    inToken.transferFrom(to, address(this), amountIn);
    ERC20 outToken = ERC20(path[1]);
    outToken.transfer(to, amountIn);
  }

}
