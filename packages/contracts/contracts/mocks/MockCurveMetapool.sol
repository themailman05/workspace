// SPDX-License-Identifier: MIT

pragma solidity >=0.6.0 <0.8.0;

contract MockCurveMetapool {

  uint256 virtualPrice = 1e18;

  function get_virtual_price() external view returns (uint256) {
    return virtualPrice;
  }

  // Test helpers

  function setVirtualPrice(uint256 virtualPrice_) external {
    virtualPrice = virtualPrice_;
  }


}
