// SPDX-License-Identifier: MIT

pragma solidity >=0.6.0 <0.8.0;

import "../IStaking.sol";

contract MockStaking is IStaking {
  function stake(uint256 amount, uint256 lengthOfTime) external virtual override {}
  function withdraw(uint256 amount) external virtual override {}
  function getVoiceCredits(address _address) external view virtual override returns (uint256) {}
  function getWithdrawableBalance() external view virtual override returns (uint256) {}
}
