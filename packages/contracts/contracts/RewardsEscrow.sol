pragma solidity >=0.7.0 <0.8.0;

import "./IStaking.sol";
import "./IRewardsEscrow.sol";
import "./Owned.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";
import "@openzeppelin/contracts/math/Math.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/SafeERC20.sol";

/**
 * @title Popcorn Rewards Escrow
 * @notice Vests Token from the Staking contract.
 */
contract RewardsEscrow is IRewardsEscrow, Owned, ReentrancyGuard {
  using SafeMath for uint256;
  using SafeERC20 for IERC20;

  /* ========== STATE VARIABLES ========== */

  struct Escrow {
    uint256 start;
    uint256 end;
    uint256 amount;
  }

  IERC20 public immutable POP;
  IStaking public Staking;
  uint256 public escrowDuration = 30 * 6 days;
  mapping(address => Escrow) public escrowedBalances;
  mapping(address => uint256) public vested;

  /* ========== EVENTS ========== */

  event Claimed(address _address, uint256 claimable);
  event Locked(address _address, uint256 claimable);
  event StakingChanged(IStaking _staking);
  event EscrowDurationChanged(uint256 _escrowDuration);

  /* ========== CONSTRUCTOR ========== */

  constructor(IERC20 _pop) Owned(msg.sender) {
    POP = _pop;
  }

  /* ========== VIEWS ========== */

  function getLocked(address _address) external view returns (uint256) {
    return escrowedBalances[_address].amount;
  }

  function getVested(address _address) public view returns (uint256) {
    uint256 _now = block.timestamp;
    uint256 locked = escrowedBalances[_address].amount;
    uint256 start = escrowedBalances[_address].start;
    uint256 end = escrowedBalances[_address].end;
    if (_now < start) {
      return 0;
    }
    if (start == 0 || end == 0) {
      return 0;
    }
    return Math.min((locked.mul(_now.sub(start))).div(end.sub(start)), locked);
  }

  /* ========== MUTATIVE FUNCTIONS ========== */

  function lock(address _address, uint256 _amount)
    external
    override
    nonReentrant
    updateVested(_address)
  {
    require(msg.sender == address(Staking), "you cant call this function");
    require(_amount > 0, "amount must be greater than 0");
    require(POP.balanceOf(msg.sender) >= _amount, "insufficient balance");

    POP.safeTransferFrom(msg.sender, address(this), _amount);

    uint256 _now = block.timestamp;
    escrowedBalances[_address] = Escrow({
      start: _now,
      end: _now.add(escrowDuration),
      amount: escrowedBalances[_address].amount.add(_amount)
    });
    emit Locked(_address, _amount);
  }

  function claim() external nonReentrant updateVested(msg.sender) {
    uint256 claimable = vested[msg.sender];
    require(claimable > 0, "nothing to claim");
    vested[msg.sender] = 0;
    escrowedBalances[msg.sender].amount = escrowedBalances[msg.sender]
      .amount
      .sub(claimable);
    POP.safeTransfer(msg.sender, claimable);
    emit Claimed(msg.sender, claimable);
  }

  /* ========== RESTRICTED FUNCTIONS ========== */

  function setStaking(IStaking _staking) external onlyOwner {
    require(Staking != _staking, "Same Staking");
    Staking = _staking;
    emit StakingChanged(_staking);
  }

  function updateEscrowDuration(uint256 _escrowDuration) external onlyOwner {
    escrowDuration = _escrowDuration;
    emit EscrowDurationChanged(_escrowDuration);
  }

  /* ========== MODIFIERS ========== */

  modifier updateVested(address _address) {
    vested[_address] = vested[_address].add(getVested(_address));
    _;
  }
}
