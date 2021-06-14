pragma solidity >=0.7.0 <0.8.0;

import "@openzeppelin/contracts/math/Math.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/SafeERC20.sol";
import "./Governed.sol";

contract RewardParticipation is Governed, ReentrancyGuard {
  using SafeMath for uint256;
  using SafeERC20 for IERC20;

  /* ========== STATE VARIABLES ========== */
  uint128 immutable VAULT_INIT = 0;
  uint128 immutable VAULT_OPEN = 1;

  struct Vault {
    uint128 status; // 0 - init, 1 - open
    uint256 endTime;
    uint256 unclaimedShares;
    uint256 tokenBalance;
    mapping(address => uint256) shareBalances;
  }

  IERC20 public immutable POP;
  uint256 public rewardBudget;
  uint256 public totalVaultedBalance;
  mapping(bytes32 => Vault) public vaults;
  mapping(address => bytes32[]) public rewardedVaults;

  /* ========== EVENTS ========== */
  event RewardBudgetChanged(uint256 amount);
  event VaultInitialized(bytes32 vaultId);
  event VaultOpened(bytes32 vaultId);
  event VaultClosed(bytes32 vaultId);
  event RewardClaimed(bytes32 vaultId, address account_, uint256 amount);
  event RewardsClaimed(address account_, uint256 amount);
  event SharesAdded(bytes32 vaultId_, address account_, uint256 shares_);

  /* ========== CONSTRUCTOR ========== */

  constructor(IERC20 _pop, address _governance) Governed(_governance) {
    POP = _pop;
  }

  /* ========== VIEWS ========== */

  function hasClaim(bytes32 vaultId_, address beneficiary_)
    public
    view
    vaultExists(vaultId_)
    returns (bool)
  {
    return vaults[vaultId_].shareBalances[beneficiary_] > 0;
  }

  function getVaultStatus(bytes32 vaultId_) external view returns (uint128) {
    return vaults[vaultId_].status;
  }

  /* ========== MUTATIVE FUNCTIONS ========== */

  /**
   * @notice Initializes a vault for voting claims
   * @param vaultId_ Bytes32
   * @param endTime_ Unix timestamp in seconds after which a vault can be closed
   * @dev There must be enough funds in this contract to support opening another vault
   */
  function _initializeVault(bytes32 vaultId_, uint256 endTime_)
    internal
    returns (bytes32)
  {
    require(vaults[vaultId_].endTime == 0, "Vault must not exist");
    require(endTime_ > block.timestamp, "end must be in the future");
    require(
      POP.balanceOf(address(this)) >= rewardBudget,
      "not enough funds for vault"
    );

    vaults[vaultId_].status = VAULT_INIT;
    vaults[vaultId_].endTime = endTime_;
    vaults[vaultId_].tokenBalance = rewardBudget;

    totalVaultedBalance = totalVaultedBalance.add(rewardBudget);

    emit VaultInitialized(vaultId_);
    return vaultId_;
  }

  /**
   * @notice Open a vault it can receive rewards and accept claims
   * @dev Vault must be in an initialized state
   * @param vaultId_ Vault ID in bytes32
   */
  function _openVault(bytes32 vaultId_) internal vaultExists(vaultId_) {
    require(vaults[vaultId_].status == VAULT_INIT, "Vault must be initialized");
    require(
      vaults[vaultId_].endTime <= block.timestamp,
      "wait till endTime is over"
    );

    vaults[vaultId_].status = VAULT_OPEN;

    emit VaultOpened(vaultId_);
  }

  function _addShares(
    bytes32 vaultId_,
    address account_,
    uint256 shares_
  ) internal vaultExists(vaultId_) {
    require(vaults[vaultId_].status == VAULT_INIT, "Vault must be initialized");
    vaults[vaultId_].unclaimedShares = vaults[vaultId_].unclaimedShares.add(
      shares_
    );
    vaults[vaultId_].shareBalances[account_] = shares_;

    rewardedVaults[account_].push(vaultId_);

    emit SharesAdded(vaultId_, account_, shares_);
  }

  function claimRewards() external nonReentrant {
    uint256 numEntries = _numRewardedVaults(msg.sender);
    uint256 total;
    for (uint256 i = 0; i < numEntries; i++) {
      bytes32 vaultId = rewardedVaults[msg.sender][i];
      if (vaults[vaultId].status == VAULT_OPEN) {
        uint256 shares = vaults[vaultId].shareBalances[msg.sender];
        uint256 reward =
          vaults[vaultId].tokenBalance.mul(shares).div(
            vaults[vaultId].unclaimedShares
          );
        total = total.add(reward);
        vaults[vaultId].tokenBalance = vaults[vaultId].tokenBalance.sub(reward);
        vaults[vaultId].unclaimedShares = vaults[vaultId].unclaimedShares.sub(
          shares
        );
      }
    }

    require(total > 0, "No rewards");

    totalVaultedBalance = totalVaultedBalance.sub(total);
    delete rewardedVaults[msg.sender];

    POP.safeTransfer(msg.sender, total);

    emit RewardsClaimed(msg.sender, total);
  }

  function _numRewardedVaults(address account_)
    internal
    view
    returns (uint256)
  {
    return rewardedVaults[account_].length;
  }

  /* ========== RESTRICTED FUNCTIONS ========== */

  function setRewardsBudget(uint256 amount) external onlyGovernance {
    require(amount > 0, "must be larger 0");
    rewardBudget = amount;
    emit RewardBudgetChanged(amount);
  }

  /* ========== MODIFIERS ========== */

  modifier vaultExists(bytes32 vaultId_) {
    require(vaults[vaultId_].endTime > 0, "Uninitialized vault slot");
    _;
  }
}
