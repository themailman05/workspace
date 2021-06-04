// SPDX-License-Identifier: MIT

pragma solidity >=0.6.0 <0.8.0;

import "./MockERC20.sol";

contract MockCurveMetapool {
  MockERC20 lpToken;
  MockERC20 threeCrv;
  uint256 virtualPrice = 1e18;
  uint256 baseVirtualPrice = 1e18;

  uint256 withdrawalSlippageBps = 10;
  uint256 depositSlippageBps = 0;

  uint256 BPS_DENOMINATOR = 10000;

  constructor(address lpToken_, address threeCrv_) {
    lpToken = MockERC20(lpToken_);
    threeCrv = MockERC20(threeCrv_);
  }

  function get_virtual_price() external view returns (uint256) {
    return virtualPrice;
  }

  function add_liquidity(uint256[2] calldata amounts, uint256 min_mint_amounts)
    external
    returns (uint256)
  {
    threeCrv.transferFrom(msg.sender, address(this), amounts[1]);
    assert(amounts[1] > min_mint_amounts);
    uint256 slippage = (amounts[1] * depositSlippageBps) / 10000;
    uint256 amountWithSlippage = amounts[1] - slippage;
    uint256 lpTokenAmount = baseVirtualPrice  * 1e18 / virtualPrice * amountWithSlippage / 1e18;
    lpToken.mint(msg.sender, lpTokenAmount);
    return lpTokenAmount;
  }

  function remove_liquidity_one_coin(
    uint256 amount,
    int128 i,
    uint256 min_underlying_amount
  ) external returns (uint256) {
    lpToken.transferFrom(msg.sender, address(this), amount);

    uint256 slippage = (amount * withdrawalSlippageBps) / 10000;
    uint256 transferOut = amount - slippage;

    threeCrv.approve(address(this), transferOut);
    threeCrv.mint(address(this), transferOut);
    threeCrv.transferFrom(address(this), msg.sender, transferOut);
    return transferOut;
  }

  // Test helpers

  function setVirtualPrice(uint256 virtualPrice_) external {
    virtualPrice = virtualPrice_;
  }
  
  function setBaseVirtualPrice(uint256 baseVirtualPrice_) external {
    baseVirtualPrice = baseVirtualPrice_;
  }

  function setWithdrawalSlippage(uint256 withdrawalSlippageBps_) external {
    withdrawalSlippageBps = withdrawalSlippageBps_;
  }
}
