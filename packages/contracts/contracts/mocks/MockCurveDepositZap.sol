// SPDX-License-Identifier: MIT

pragma solidity >=0.6.0 <0.8.0;

import "./MockERC20.sol";

contract MockCurveDepositZap {

  MockERC20 lpToken;
  MockERC20 dai;

  constructor(address lpToken_, address dai_)  {
    lpToken = MockERC20(lpToken_);
    dai = MockERC20(dai_);
  }

  function add_liquidity(
    uint256[4] calldata amounts,
    uint256 min_mint_amounts
  ) external returns (uint256) {
    dai.transferFrom(msg.sender, address(this), amounts[1]);
    assert(amounts[1]  > min_mint_amounts);
    lpToken.mint(msg.sender, amounts[1]);
  }
}
