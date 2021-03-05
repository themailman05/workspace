// SPDX-License-Identifier: MIT

pragma solidity >=0.6.0 <0.8.0;

import "../RewardsManager.sol";

contract MockRewardsManagerV2 is RewardsManager {
  event RewardDeposited2(address from, uint256 amount);

  function depositReward(address from_, uint256 amount_) public override {
    IERC20(pop).transferFrom(from_, address(this), amount_);

    _distributeToVaults(amount_);

    emit RewardDeposited2(from_, amount_);
  }

  function ownershipTest(bool input_) public view onlyOwner returns (bool) {
    return !input_;
  }
}
