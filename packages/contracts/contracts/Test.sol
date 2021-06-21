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

contract Test {
  using SafeMath for uint256;
  using SafeERC20 for IERC20;

  enum ElectionTerm {Monthly, Quarterly, Yearly}

  string[] public test = ["yes", "no", "maybe"];

  /* ========== STATE VARIABLES ========== */
  constructor() {}

  function getTest(ElectionTerm _grantTerm)
    external
    view
    returns (string memory)
  {
    return test[_grantTerm];
  }
}
