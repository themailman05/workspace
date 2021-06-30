// SPDX-License-Identifier: MIT

pragma solidity >=0.7.0 <0.8.0;

import "@openzeppelin/contracts/math/Math.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/SafeERC20.sol";
import "./IStaking.sol";
import "./Owned.sol";
import "./IRewardsManager.sol";
import "./Defended.sol";

contract Rounding {
  using SafeMath for uint256;

  constructor() {}

  function roundV1(uint256 time) public view returns (uint256) {
    return time.div(1 hours).mul(1 hours);
  }

  function roundV2(uint256 time) public view returns (uint256) {
    uint256 returnValue = time.add(1 hours / 2);
    return returnValue.sub(returnValue.mod(1 hours));
  }
}
