// SPDX-License-Identifier: MIT

pragma solidity >=0.7.0 <0.8.0;

import "@openzeppelin/contracts/math/Math.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/SafeERC20.sol";
import "./IStaking.sol";
import "./Owned.sol";

contract Staking is IStaking, Owned, ReentrancyGuard {
  using SafeMath for uint256;
  using SafeERC20 for IERC20;

  /* ========== STATE VARIABLES ========== */

  struct LockedBalance {
    uint256 _balance;
    uint256 _duration;
    uint256 _end;
  }

  IERC20 public immutable POP;
  uint256 public periodFinish = 0;
  uint256 public rewardRate = 0;
  uint256 public rewardsDuration = 7 days;
  uint256 public lastUpdateTime;
  uint256 public rewardPerTokenStored;
  uint256 private _totalLocked;
  mapping(address => uint256) public voiceCredits;
  mapping(address => uint256) public userRewardPerTokenPaid;
  mapping(address => uint256) public rewards;
  mapping(address => LockedBalance) public lockedBalances;

  uint256 constant SECONDS_IN_A_WEEK = 604800;
  uint256 constant MAX_LOCK_TIME = SECONDS_IN_A_WEEK * 52 * 4; // 4 years

  /* ========== EVENTS ========== */

  event StakingDeposited(address _address, uint256 amount);
  event StakingWithdrawn(address _address, uint256 amount);
  event RewardPaid(address _address, uint256 reward);
  event RewardAdded(uint256 reward);

  /* ========== CONSTRUCTOR ========== */

  constructor(IERC20 _pop) Owned(msg.sender) {
    POP = _pop;
  }

  /* ========== VIEWS ========== */

  function getVoiceCredits(address _address)
    public
    view
    override
    returns (uint256)
  {
    return voiceCredits[_address];
  }

  function getWithdrawableBalance() public view override returns (uint256) {
    uint256 _withdrawable = 0;
    uint256 _currentTime = block.timestamp;
    if (lockedBalances[msg.sender]._end <= _currentTime) {
      _withdrawable = lockedBalances[msg.sender]._balance;
    }
    return _withdrawable;
  }

  function totalLocked() external view returns (uint256) {
    return _totalLocked;
  }

  function balanceOf(address account) external view returns (uint256) {
    return lockedBalances[account]._balance;
  }

  function lastTimeRewardApplicable() public view returns (uint256) {
    return Math.min(block.timestamp, periodFinish);
  }

  function rewardPerToken() public view returns (uint256) {
    if (_totalLocked == 0) {
      return rewardPerTokenStored;
    }
    return
      rewardPerTokenStored.add(
        lastTimeRewardApplicable()
          .sub(lastUpdateTime)
          .mul(rewardRate)
          .mul(1e18)
          .div(_totalLocked)
      );
  }

  function earned(address account) public view returns (uint256) {
    return
      lockedBalances[account]
        ._balance
        .mul(rewardPerToken().sub(userRewardPerTokenPaid[account]))
        .div(1e18)
        .add(rewards[account]);
  }

  function getRewardForDuration() external view returns (uint256) {
    return rewardRate.mul(rewardsDuration);
  }

  /* ========== MUTATIVE FUNCTIONS ========== */

  function stake(uint256 amount, uint256 lengthOfTime)
    external
    override
    nonReentrant
    updateReward(msg.sender)
  {
    require(amount > 0, "amount must be greater than 0");
    require(
      lengthOfTime >= SECONDS_IN_A_WEEK,
      "must lock tokens for at least 1 week"
    );
    require(
      lengthOfTime <= MAX_LOCK_TIME,
      "must lock tokens for less than/equal to  4 year"
    );
    require(POP.balanceOf(msg.sender) >= amount, "insufficient balance");

    POP.safeTransferFrom(msg.sender, address(this), amount);

    _totalLocked = _totalLocked.add(amount);
    _addStakeToLocked(amount, lengthOfTime);
    _recalculateVoiceCredits();
    emit StakingDeposited(msg.sender, amount);
  }

  function withdraw(uint256 amount)
    public
    override
    nonReentrant
    updateReward(msg.sender)
  {
    require(amount > 0, "amount must be greater than 0");
    require(lockedBalances[msg.sender]._balance > 0, "insufficient balance");
    require(amount <= getWithdrawableBalance());

    POP.approve(address(this), amount);
    POP.safeTransferFrom(address(this), msg.sender, amount);

    _totalLocked = _totalLocked.sub(amount);
    _clearWithdrawnFromLocked(amount);
    _recalculateVoiceCredits();
    emit StakingWithdrawn(msg.sender, amount);
  }

  function getReward() public nonReentrant updateReward(msg.sender) {
    uint256 reward = rewards[msg.sender];
    if (reward > 0) {
      rewards[msg.sender] = 0;
      POP.safeTransfer(msg.sender, reward);
      emit RewardPaid(msg.sender, reward);
    }
  }

  function exit(uint256 amount) external {
    withdraw(amount);
    getReward();
  }

  /* ========== RESTRICTED FUNCTIONS ========== */

  // todo: multiply voice credits by 10000 to deal with exponent math
  function _recalculateVoiceCredits() internal {
    voiceCredits[msg.sender] = lockedBalances[msg.sender]
      ._balance
      .mul(lockedBalances[msg.sender]._duration)
      .div(MAX_LOCK_TIME);
  }

  function _addStakeToLocked(uint256 amount, uint256 lengthOfTime) internal {
    uint256 _currentTime = block.timestamp;
    lockedBalances[msg.sender] = LockedBalance({
      _balance: lockedBalances[msg.sender]._balance.add(amount),
      _duration: lengthOfTime,
      _end: _currentTime.add(lengthOfTime)
    });
  }

  function _clearWithdrawnFromLocked(uint256 _amount) internal {
    uint256 _currentTime = block.timestamp;
    if (lockedBalances[msg.sender]._end <= _currentTime) {
      if (_amount == lockedBalances[msg.sender]._balance) {
        delete lockedBalances[msg.sender];
      }
      if (_amount < lockedBalances[msg.sender]._balance) {
        lockedBalances[msg.sender]._balance = lockedBalances[msg.sender]
          ._balance
          .sub(_amount);
      }
    }
  }

  function notifyRewardAmount(uint256 reward)
    external
    onlyOwner
    updateReward(address(0))
  {
    if (block.timestamp >= periodFinish) {
      rewardRate = reward.div(rewardsDuration);
    } else {
      uint256 remaining = periodFinish.sub(block.timestamp);
      uint256 leftover = remaining.mul(rewardRate);
      rewardRate = reward.add(leftover).div(rewardsDuration);
    }

    // Ensure the provided reward amount is not more than the balance in the contract.
    // This keeps the reward rate in the right range, preventing overflows due to
    // very high values of rewardRate in the earned and rewardsPerToken functions;
    // Reward + leftover must be less than 2^256 / 10^18 to avoid overflow.
    uint256 balance = POP.balanceOf(address(this));
    require(
      rewardRate <= balance.div(rewardsDuration),
      "Provided reward too high"
    );

    lastUpdateTime = block.timestamp;
    periodFinish = block.timestamp.add(rewardsDuration);
    emit RewardAdded(reward);
  }

  // End rewards emission earlier
  function updatePeriodFinish(uint256 timestamp)
    external
    onlyOwner
    updateReward(address(0))
  {
    periodFinish = timestamp;
  }

  /* ========== MODIFIERS ========== */

  modifier updateReward(address account) {
    rewardPerTokenStored = rewardPerToken();
    lastUpdateTime = lastTimeRewardApplicable();
    if (account != address(0)) {
      rewards[account] = earned(account);
      userRewardPerTokenPaid[account] = rewardPerTokenStored;
    }
    _;
  }
}
