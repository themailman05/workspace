// SPDX-License-Identifier: MIT

pragma solidity >=0.7.0 <0.8.0;

import "./IBeneficiaryRegistry.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/cryptography/MerkleProof.sol";

contract RewardsManager is Ownable {
  using SafeMath for uint256;

  Vault[3] private vaults;
  address public immutable pop;

  enum VaultStatus {Initialized, Open, Closed}

  struct Vault {
    uint256 totalDeposited;
    uint256 currentBalance;
    uint256 unclaimedShare;
    mapping(address => bool) claimed;
    bytes32 merkleRoot;
    uint256 endBlock;
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
    require(vaults[vaultId_].endBlock > 0, "Uninitialized vault slot");
    _;
  }

  constructor(address pop_) {
    pop = pop_;
  }

  function initializeVault(
    uint8 vaultId_,
    uint256 endBlock_,
    bytes32 merkleRoot_
  ) public onlyOwner {
    require(vaultId_ < 3, "Invalid vault id");
    require(endBlock_ > block.number, "Invalid end block");
    require(
      vaults[vaultId_].status != VaultStatus.Open,
      "Vault must not be open"
    );

    delete vaults[vaultId_];
    Vault storage v = vaults[vaultId_];
    v.totalDeposited = 0;
    v.currentBalance = 0;
    v.unclaimedShare = 100;
    v.merkleRoot = merkleRoot_;
    v.endBlock = endBlock_;
    v.status = VaultStatus.Initialized;

    emit VaultInitialized(vaultId_, merkleRoot_);
  }

  function openVault(uint8 vaultId_) public onlyOwner vaultExists(vaultId_) {
    require(
      vaults[vaultId_].status == VaultStatus.Initialized,
      "Vault must be initialized"
    );

    vaults[vaultId_].status = VaultStatus.Open;

    emit VaultOpened(vaultId_);
  }

  function closeVault(uint8 vaultId_) public onlyOwner vaultExists(vaultId_) {
    require(vaults[vaultId_].status == VaultStatus.Open, "Vault must be open");
    require(block.number > vaults[vaultId_].endBlock, "Vault has not ended");

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
    //@todo validate beneficiary exists in registry
    require(vaults[vaultId_].status == VaultStatus.Open, "Vault must be open");
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
  ) public vaultExists(vaultId_) {
    require(
      verifyClaim(vaultId_, proof_, beneficiary_, share_) == true,
      "Invalid claim"
    );
    require(vaults[vaultId_].claimed[beneficiary_] == false, "Already claimed");

    uint256 _reward = vaults[vaultId_].totalDeposited.mul(share_).div(100);
    vaults[vaultId_].unclaimedShare = vaults[vaultId_].unclaimedShare.sub(
      share_
    );
    vaults[vaultId_].currentBalance = vaults[vaultId_].currentBalance.sub(
      _reward
    );

    vaults[vaultId_].claimed[beneficiary_] = true;

    IERC20(pop).transfer(beneficiary_, _reward);

    emit RewardClaimed(vaultId_, beneficiary_, _reward);
  }

  function depositReward(address from_, uint256 amount_) public {
    IERC20(pop).transferFrom(from_, address(this), amount_);

    //@todo calculate reward splits to various targets
    uint256 _amountToVault = amount_;

    _distributeToVaults(_amountToVault);

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
      uint256 endBlock,
      VaultStatus status
    )
  {
    totalDeposited = vaults[vaultId_].totalDeposited;
    currentBalance = vaults[vaultId_].currentBalance;
    unclaimedShare = vaults[vaultId_].unclaimedShare;
    merkleRoot = vaults[vaultId_].merkleRoot;
    endBlock = vaults[vaultId_].endBlock;
    status = vaults[vaultId_].status;
  }

  function _distributeToVaults(uint256 amount_) internal {
    uint8 _openVaultCount = 0;

    for (uint8 i = 0; i < vaults.length; i++) {
      if (vaults[i].status == VaultStatus.Open) {
        _openVaultCount += 1;
      }
    }

    require(_openVaultCount > 0, "No open vaults");

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
}
