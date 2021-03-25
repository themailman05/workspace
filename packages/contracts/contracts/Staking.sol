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
  uint256 constant MAX_LOCK_TIME = 604800 * 52 * 4; // 4 years

  IERC20 public immutable POP;
  event StakingDeposited(address _address, uint256 amount);
  event StakingWithdrawn(address _address, uint256 amount);

  constructor(IERC20 _pop) {
    POP = _pop;
  }

  function stake(uint256 amount, uint256 lengthOfTime) external override nonReentrant {
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

    balances[msg.sender].add(amount);

    lockedBalances[msg.sender].push(
      LockedBalance({
        _address: msg.sender,
        _balance: amount,
        _time: lengthOfTime,
        _lockedAt: block.timestamp
      })
    );

    _recalculateVoiceCredits();
    emit StakingDeposited(msg.sender, amount);
  }


  function withdraw(uint256 amount) external override nonReentrant {
    require(amount > 0, "amount must be greater than 0");
    require(balances[msg.sender] > 0, "insufficient balance");
    require(amount <= getWithdrawableBalance());

    withdrawnBalances[msg.sender].add(amount);

    POP.safeTransferFrom(address(this), msg.sender, amount);
    _clearWithdrawnFromLocked(amount);
    _recalculateVoiceCredits();
  }

  function _recalculateVoiceCredits() internal {
    uint256 _voiceCredits = 0;
    for(uint8 i = 0; i < lockedBalances[msg.sender].length; i++) {
      LockedBalance memory _locked = lockedBalances[msg.sender][i];
      _voiceCredits = _voiceCredits.add(_locked._balance.mul(_locked._time).div(MAX_LOCK_TIME));
    }
    voiceCredits[msg.sender] = _voiceCredits;
  }

  function _clearWithdrawnFromLocked(uint256 _amount) internal {
    uint256 _currentTime = block.timestamp;
    for(uint8 i = 0; i < lockedBalances[msg.sender].length; i++) {
      LockedBalance memory _locked = lockedBalances[msg.sender][i];
      if (_locked._lockedAt.add(_locked._time).sub(_currentTime) <= 0) {
        _amount = _amount.sub(_locked._balance);
        if (_amount >= 0) {
          delete lockedBalances[msg.sender][i];
          return;
        }
        if (_amount < 0) {
          _locked._balance = _amount >= 0 ? _amount : -_amount;
          return;
        }
      }
    }
  }

  function getVoiceCredits(address _address) public view override returns (uint256) {
    return voiceCredits[_address];
  }

  function getWithdrawableBalance() public view override returns (uint256) {
    uint256 _withdrawable = 0;
    uint256 _currentTime = block.timestamp;
    for(uint8 i = 0; i < lockedBalances[msg.sender].length; i++) {
      LockedBalance memory _locked = lockedBalances[msg.sender][i];
      if (_locked._lockedAt.add(_locked._time).sub(_currentTime) <= 0) {
        _withdrawable.add(_locked._balance);
      }
    }

    return _withdrawable;
  }
}
