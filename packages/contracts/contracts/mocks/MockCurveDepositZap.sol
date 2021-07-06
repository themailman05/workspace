// SPDX-License-Identifier: MIT

pragma solidity >=0.6.0 <0.8.0;

import "./MockERC20.sol";

import "hardhat/console.sol";

contract MockCurveDepositZap {
  MockERC20 token;
  MockERC20 lpToken;
  MockERC20 dai;
  MockERC20 usdc;
  MockERC20 usdt;
  uint256 withdrawalSlippageBps = 10;

  uint256 BPS_DENOMINATOR = 10000;

  constructor(
    address token_,
    address lpToken_,
    address dai_,
    address usdc_,
    address usdt_
  ) {
    token = MockERC20(token_);
    lpToken = MockERC20(lpToken_);
    dai = MockERC20(dai_);
    usdc = MockERC20(usdc_);
    usdt = MockERC20(usdt_);
  }

  function add_liquidity(
    address pool,
    uint256[4] calldata amounts,
    uint256 min_mint_amounts
  ) external returns (uint256) {
    dai.transferFrom(msg.sender, address(this), amounts[1]);
    assert(amounts[1] > min_mint_amounts);
    lpToken.mint(msg.sender, amounts[1]);
    return amounts[1];
  }

  function remove_liquidity_one_coin(
    address pool,
    uint256 amount,
    int128 i,
    uint256 min_underlying_amount,
    address receiver
  ) external returns (uint256) {
    lpToken.transferFrom(msg.sender, address(this), amount);

    uint256 slippage = (amount * withdrawalSlippageBps) / 10000;
    uint256 transferOut = amount - slippage;

    usdc.approve(address(this), transferOut);
    usdc.mint(address(this), transferOut);
    usdc.transferFrom(address(this), receiver, transferOut);
    return transferOut;
  }

  function calc_withdraw_one_coin(uint256 amount, int128 i)
    external
    view
    returns (uint256)
  {
    uint256 slippage = (amount * withdrawalSlippageBps) / 10000;
    uint256 transferOut = amount - slippage;
    return transferOut;
  }

  // Test helpers

  function setWithdrawalSlippage(uint256 withdrawalSlippageBps_) external {
    withdrawalSlippageBps = withdrawalSlippageBps_;
  }
}
