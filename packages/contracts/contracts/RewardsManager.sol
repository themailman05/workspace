// SPDX-License-Identifier: MIT

pragma solidity >=0.7.0 <0.8.0;

import "./IBeneficiaryRegistry.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/cryptography/MerkleProof.sol";

contract RewardsManager is Ownable, ReentrancyGuard {
  using SafeMath for uint256;

  Vault[3] private vaults;
  IERC20 public immutable pop;
  IBeneficiaryRegistry public beneficiaryRegistry;

  enum VaultStatus {Initialized, Open, Closed}

  struct Vault {
    uint256 totalDeposited;
    uint256 currentBalance;
    uint256 unclaimedShare;
    mapping(address => bool) claimed;
    bytes32 merkleRoot;
    uint256 endTime;
    VaultStatus status;
  }

  event VaultInitialized(uint8 vaultId, bytes32 merkleRoot);
  event VaultOpened(uint8 vaultId);
  event VaultClosed(uint8 vaultId);
  event VaultDeposited(uint8 vaultId, uint256 amount);
  event RewardDeposited(address from, uint256 amount);
  event RewardClaimed(uint8 vaultId, address beneficiary, uint256 amount);

  modifier vaultExists(uint8 vaultId_) {
    require(vaultId_ < 3, "Invalid vault id");
    require(vaults[vaultId_].endTime > 0, "Uninitialized vault slot");
    _;
  }

  constructor(address pop_, address beneficiaryRegistry_) {
    pop = IERC20(pop_);
    beneficiaryRegistry = IBeneficiaryRegistry(beneficiaryRegistry_);
  }

  function setBeneficaryRegistry(address beneficiaryRegistry_)
    public
    nonReentrant
    onlyOwner
  {
    beneficiaryRegistry = IBeneficiaryRegistry(beneficiaryRegistry_);
  }

  function initializeVault(
    uint8 vaultId_,
    uint256 endTime_,
    bytes32 merkleRoot_
  ) public nonReentrant onlyOwner {
    require(vaultId_ < 3, "Invalid vault id");
    require(endTime_ > block.timestamp, "Invalid end block");
    require(
      vaults[vaultId_].status != VaultStatus.Open,
      "Vault must not be open"
    );

    delete vaults[vaultId_];
    Vault storage v = vaults[vaultId_];
    v.totalDeposited = 0;
    v.currentBalance = 0;
    v.unclaimedShare = 100 * 10**18;
    v.merkleRoot = merkleRoot_;
    v.endTime = endTime_;
    v.status = VaultStatus.Initialized;

    emit VaultInitialized(vaultId_, merkleRoot_);
  }

  function openVault(uint8 vaultId_)
    public
    nonReentrant
    onlyOwner
    vaultExists(vaultId_)
  {
    require(
      vaults[vaultId_].status == VaultStatus.Initialized,
      "Vault must be initialized"
    );

    vaults[vaultId_].status = VaultStatus.Open;

    emit VaultOpened(vaultId_);
  }

  function closeVault(uint8 vaultId_)
    public
    nonReentrant
    onlyOwner
    vaultExists(vaultId_)
  {
    require(vaults[vaultId_].status == VaultStatus.Open, "Vault must be open");
    require(block.timestamp >= vaults[vaultId_].endTime, "Vault has not ended");

    uint256 _remainingBalance = vaults[vaultId_].currentBalance;
    vaults[vaultId_].currentBalance = 0;
    vaults[vaultId_].status = VaultStatus.Closed;

    _distributeToVaults(_remainingBalance);

    emit VaultClosed(vaultId_);
  }

  function verifyClaim(
    uint8 vaultId_,
    bytes32[] memory proof_,
    address beneficiary_,
    uint256 share_
  ) public view vaultExists(vaultId_) returns (bool) {
    require(msg.sender == beneficiary_, "Sender must be beneficiary");
    require(vaults[vaultId_].status == VaultStatus.Open, "Vault must be open");
    require(
      beneficiaryRegistry.beneficiaryExists(beneficiary_) == true,
      "Beneficiary does not exist"
    );

    return
      MerkleProof.verify(
        proof_,
        vaults[vaultId_].merkleRoot,
        bytes32(keccak256(abi.encodePacked(beneficiary_, share_)))
      );
  }

  function claimReward(
    uint8 vaultId_,
    bytes32[] memory proof_,
    address beneficiary_,
    uint256 share_
  ) public nonReentrant vaultExists(vaultId_) {
    require(
      verifyClaim(vaultId_, proof_, beneficiary_, share_) == true,
      "Invalid claim"
    );
    require(hasClaimed(vaultId_, beneficiary_) == false, "Already claimed");

    uint256 _reward =
      vaults[vaultId_].currentBalance.mul(share_).div(
        vaults[vaultId_].unclaimedShare
      );
    vaults[vaultId_].unclaimedShare = vaults[vaultId_].unclaimedShare.sub(
      share_
    );
    vaults[vaultId_].currentBalance = vaults[vaultId_].currentBalance.sub(
      _reward
    );

    vaults[vaultId_].claimed[beneficiary_] = true;

    pop.transfer(beneficiary_, _reward);

    emit RewardClaimed(vaultId_, beneficiary_, _reward);
  }

  function depositReward(address from_, uint256 amount_) public nonReentrant {
    pop.transferFrom(from_, address(this), amount_);

    _distributeToVaults(amount_);

    emit RewardDeposited(from_, amount_);
  }

  function getVault(uint8 vaultId_)
    public
    view
    vaultExists(vaultId_)
    returns (
      uint256 totalDeposited,
      uint256 currentBalance,
      uint256 unclaimedShare,
      bytes32 merkleRoot,
      uint256 endTime,
      VaultStatus status
    )
  {
    totalDeposited = vaults[vaultId_].totalDeposited;
    currentBalance = vaults[vaultId_].currentBalance;
    unclaimedShare = vaults[vaultId_].unclaimedShare;
    merkleRoot = vaults[vaultId_].merkleRoot;
    endTime = vaults[vaultId_].endTime;
    status = vaults[vaultId_].status;
  }

  function _distributeToVaults(uint256 amount_) internal {
    uint8 _openVaultCount = 0;

    for (uint8 i = 0; i < vaults.length; i++) {
      if (vaults[i].status == VaultStatus.Open) {
        _openVaultCount += 1;
      }
    }

    if (_openVaultCount == 0) {
      pop.transfer(owner(), amount_);
      return;
    }

    //@todo handle dust after div
    uint256 distribution = amount_.div(_openVaultCount);

    for (uint8 _vaultId = 0; _vaultId < vaults.length; _vaultId++) {
      vaults[_vaultId].totalDeposited = vaults[_vaultId].totalDeposited.add(
        distribution
      );
      vaults[_vaultId].currentBalance = vaults[_vaultId].currentBalance.add(
        distribution
      );
      emit VaultDeposited(_vaultId, distribution);
    }
  }

  function hasClaimed(uint8 vaultId_, address beneficiary_)
    public
    view
    vaultExists(vaultId_)
    returns (bool)
  {
    return vaults[vaultId_].claimed[beneficiary_];
  }
}
