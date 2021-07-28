pragma solidity >=0.7.0 <0.8.0;

import "@openzeppelin/contracts/math/Math.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/SafeERC20.sol";
import "./Governed.sol";

contract RewardsEscrowV2 is Governed, ReentrancyGuard {
  using SafeMath for uint256;
  using SafeERC20 for IERC20;

  /* ========== STATE VARIABLES ========== */
  struct Escrow {
    uint256 start;
    uint256 end;
    uint256 balance;
  }

  IERC20 public immutable POP;
  mapping(bytes32 => Escrow) public escrows;
  mapping(address => bytes32[]) public escrowIds;

  /* ========== EVENTS ========== */
  event Locked(address account, uint256 amount);
  event RewardClaimed(bytes32 vaultId, address account_, uint256 amount);
  event RewardsClaimed(address account_, uint256 amount);
  event EscrowOwnershipTransfered(address prevOwner, address newOwner, bytes32 escrowId)

  /* ========== CONSTRUCTOR ========== */

  constructor(IERC20 _pop, address _governance) Governed(_governance) {
    POP = _pop;
  }

  /* ========== VIEWS ========== */

  /**
   * @notice Returns the vault status
   * @param vaultId_ Bytes32
   */
  function isClaimable(bytes32 escrowId_) external view returns (bool) {
    return
      escrows[escrowId_].start <= block.timestamp &&
      escrows[escrowId_].start != 0;
  }

  /**
   * @notice Returns all vaultIds which an account has/had claims in
   * @param account address
   */
  function getEscrowsByUser(address account)
    external
    view
    returns (bytes32[] memory)
  {
    return escrowIds[account];
  }

  /* ========== MUTATIVE FUNCTIONS ========== */

  /**
   * @notice Initializes a vault for voting claims
   * @param vaultId_ Bytes32
   * @param endTime_ Unix timestamp in seconds after which a vault can be closed
   * @dev There must be enough funds in this contract to support opening another vault
   */
  function lock(address account_, uint256 amount_) external {
    uint256 _now = block.timestamp;
    uint256 _start = _now.add(vestingCliff);
    uint256 _end = _start.add(escrowDuration);

    bytes32 id = keccak256(abi.encodePacked(account_, amount_, _now));

    escrows[id] = Escrow({start: _start, end: _end, balance: amount_});
    escrowIds[account_].push(id);

    emit Locked(_address, _amount);
  }

  /**
   * @notice Claim rewards of a vault
   * @param index_ uint256
   * @dev Uses the vaultId_ at the specified index of userVaults.
   * @dev This function is used when a user only wants to claim a specific vault or if they decide the gas cost of claimRewards are to high for now.
   * @dev (lower cost but also lower reward)
   */
  function claimReward(uint256 index_) external nonReentrant {
    uint256 reward = _claimReward(msg.sender, index_);
    require(reward > 0, "no rewards");

    POP.safeTransfer(msg.sender, reward);

    emit RewardsClaimed(msg.sender, reward);
  }

  /**
   * @notice Claim rewards of a a number of vaults
   * @param indices_ uint256[]
   * @dev Uses the vaultIds at the specified indices of userVaults.
   * @dev This function is used when a user only wants to claim multiple vaults at once (probably most of the time)
   * @dev The array of indices is limited to 19 as we want to prevent gas overflow of looping through too many vaults
   */
  function claimRewards(uint256[] calldata indices_) external nonReentrant {
    require(indices_.length <= 5, "claiming too many vaults");
    uint256 total;

    for (uint256 i = 0; i < indices_.length; i++) {
      total = total.add(_claimReward(msg.sender, indices_[i]));
    }
    require(total > 0, "no rewards");

    POP.safeTransfer(msg.sender, total);

    emit RewardsClaimed(msg.sender, total);
  }

  //TODO Integrate struct to trustless sell escrows?
  function transferEscrowOwnership(address recipient_, bytes32 index_) public {
    bytes32 escrowId = escrowIds[msg.sender][index_];
    escrowIds[recipient_].push(escrowId_);
    delete escrowIds[account_][index_];
    emit EscrowOwnershipTransfered(msg.sender, recipient_, escrowId)
  }

  /* ========== RESTRICTED FUNCTIONS ========== */

  /**
   * @notice Underlying function to calculate the rewards that a user gets and set the vault to claimed
   * @param vaultId_ Bytes32
   * @param index_ uint256
   * @param account_ address
   * @dev We dont want it to error when a vault is empty for the user as this would terminate the entire loop when used in claimRewards()
   */
  function _claimReward(address account_, uint256 index_)
    internal
    returns (uint256)
  {
    Escrow storage escrow = escrows[escrowIds[account_][index_]];
    if (escrow.start <= block.timestamp) {
      uint256 claimable = _getClaimableAmount(escrow);
      if (claimable == escrow.balance) {
        delete escrowIds[account_][index_];
        delete escrow;
      }
      return claimable;
    }
    return 0;
  }

  function _getClaimableAmount(Escrow memory escrow) internal {
    if (escrow.start == 0 || escrow.end == 0) {
      return 0;
    }
    return
      Math.min(
        (escrow.balance.mul(block.timestamp.sub(escrow.start))).div(
          escrow.end.sub(escrow.start)
        ),
        escrow.balance
      );
  }

  /* ========== MODIFIERS ========== */

  /**
   * @notice Modifier to check if a vault exists
   * @param vaultId_ Bytes32
   */
  modifier escrowExists(bytes32 escrowId) {
    require(escrows[escrowId].end > 0, "Uninitialized Escrow slot");
    _;
  }
}
