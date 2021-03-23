// SPDX-License-Identifier: MIT

pragma solidity >=0.7.0 <0.8.0;

import "@openzeppelin/contracts/math/SafeMath.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/SafeERC20.sol";
import "./IStaking.sol";

contract Staking is IStaking, Ownable, ReentrancyGuard {
  using SafeMath for uint256;
  using SafeERC20 for IERC20;

  struct LockedBalance {
    address _address;
    uint256 _balance;
    uint256 _time;
    uint256 _lockedAt;
  }

  mapping(address => uint256) balances;
  mapping(address => uint256) voiceCredits;
  mapping(address => LockedBalance[]) lockedBalances;
  mapping(address => uint256) withdrawnBalances;

  uint256 constant SECONDS_IN_A_WEEK = 604800;
  uint256 constant MAX_LOCK_TIME = SECONDS_IN_A_WEEK.mul(52).mul(4);

  IERC20 public immutable POP;
  event StakingDeposited(address _address, uint256 amount);
  event StakingWithdrawn(address _address, uint256 amount);

  function stake(uint256 amount, uint256 lengthOfTime) external nonReentrant {
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

    uint256 _voiceCredits = amount.mul(lengthOfTime).div(MAX_LOCK_TIME);
    voiceCredits[msg.sender].add(_voiceCredits);
    balances[msg.sender].add(amount);

    lockedBalances[msg.sender].push(
      LockedBalance({
        _address: msg.sender,
        _balance: amount,
        _time: lengthOfTime,
        _lockedAt: block.timestamp
      })
    );

    POP.safeTransferFrom(msg.sender, address(this), amount);
    emit StakingDeposited(msg.sender, amount);
  }


  function withdraw(uint256 amount) external nonReentrant {
    require(amount > 0, "amount must be greater than 0");
    require(balances[msg.sender] > 0, "insufficient balance");
    require(_isWithdrawable(amount), "amount not withdrawable");
    uint256 _withdrawableBalance = getWithdrawableBalance();
    require(_withdrawableBalance.add(withdrawnBalance) >= amount);

    withdrawnBalances[msg.sender].add(amount);
    totalLockedBalances[msg.sender].sub(amount);


    POP.safeTransferFrom(address(this), msg.sender, amount);
    _clearWithdrawnFromLocked(amount);
    // todo: recalculate voiceCredits

  }

  function _clearWithdrawnFromLocked(uint256 _amount) internal {
    for(uint8 i = 0; i < lockedBalances[msg.sender].length; i++) {
      _locked = lockedBalances[msg.sender][i];
      if (_locked._lockedAt.add(_locked._time).sub(_currentTime) <= 0) {
        _amount = _amount.sub(_locked._balance);
        if (_amount >= 0) {
          delete lockedBalances[msg.sender][i];
          return;
        }
        if (_amount < 0) {
          _locked._balance = abs(_amount);
          return;
        }
      } 
    }
  }

  function getVoiceCredits(address _address) public view returns (uint256) {
    return voiceCredits[_address];
  }

  function getWithdrawableBalance() public view returns (uint256) {
    uint256 _withdrawable = 0;
    uint256 _currentTime = block.timestamp;
    for(uint8 i = 0; i < lockedBalances[msg.sender].length; i++) {
      _locked = lockedBalances[msg.sender][i];
      if (_locked._lockedAt.add(_locked._time).sub(_currentTime) <= 0) {
        _withdrawable.add(_locked._balance);
      } 
    }

    return _withdrawable;
  }
}
