// SPDX-License-Identifier: MIT

pragma solidity >=0.7.0 <0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/cryptography/MerkleProof.sol";

contract RewardsManager is Ownable {
  using SafeMath for uint256;

  Vault[3] private vaults;
  address public immutable pop;

  enum VaultStatus {Pending, Open, Closed}

  struct Vault {
    uint256 balance;
    bytes32 merkleRoot;
    uint256 endBlock;
    VaultStatus status;
  }

  event VaultAssigned(uint8 vaultId, bytes32 merkleRoot);
  event VaultOpened(uint8 vaultId);
  event VaultClosed(uint8 vaultId);
  event VaultDeposited(uint8 vaultId, uint256 amount);

  modifier validVault(uint8 vaultId_) {
    require(vaultId_ < 3, "Invalid vault Id");
    _;
  }

  constructor(address pop_) {
    pop = pop_;
  }

  function assignVault(
    uint8 vaultId_,
    uint256 endBlock_,
    bytes32 merkleRoot_
  ) public onlyOwner validVault(vaultId_) {
    require(
      vaults[vaultId_].status != VaultStatus.Open,
      "Vault must not be open"
    );

    vaults[vaultId_] = Vault({
      balance: 0,
      merkleRoot: merkleRoot_,
      endBlock: endBlock_,
      status: VaultStatus.Pending
    });

    emit VaultAssigned(vaultId_, merkleRoot_);
  }

  function openVault(uint8 vaultId_) public onlyOwner validVault(vaultId_) {
    require(
      vaults[vaultId_].status == VaultStatus.Pending,
      "Vault must be pending"
    );

    vaults[vaultId_].status = VaultStatus.Open;

    emit VaultOpened(vaultId_);
  }

  function closeVault(uint8 vaultId_) public onlyOwner validVault(vaultId_) {
    require(vaults[vaultId_].status == VaultStatus.Open, "Vault must be open");

    uint256 _remainingBalance = vaults[vaultId_].balance;
    vaults[vaultId_].balance = 0;
    vaults[vaultId_].status = VaultStatus.Closed;

    _distribute(_remainingBalance);

    emit VaultClosed(vaultId_);
  }

  function verifyReward(
    uint8 vaultId_,
    bytes32[] memory proof_,
    address beneficiary_,
    uint256 share_
  ) public view validVault(vaultId_) returns (bool) {
    require(vaults[vaultId_].status == VaultStatus.Open, "Vault must be open");
    return
      MerkleProof.verify(
        proof_,
        vaults[vaultId_].merkleRoot,
        bytes32(keccak256(abi.encodePacked(beneficiary_, share_)))
      );
  }

  function _distribute(uint256 amount_) internal {
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
      vaults[_vaultId].balance += distribution;
      emit VaultDeposited(_vaultId, distribution);
    }
  }
}
