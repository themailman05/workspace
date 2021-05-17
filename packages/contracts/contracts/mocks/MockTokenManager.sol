// SPDX-License-Identifier: MIT

pragma solidity >=0.6.0 <0.8.0;

import "../ITokenManager.sol";

contract MockTokenManager is ITokenManager {
  function assignVested(
      address _receiver,
      uint256 _amount,
      uint64 _start,
      uint64 _cliff,
      uint64 _vested,
      bool _revokable
  ) external override returns (uint256) {
    return _amount;
  }
}
