// SPDX-License-Identifier: MIT

pragma solidity >=0.7.0 <0.8.0;

interface IBeneficiaryRegistry {
  function beneficiaryExists(address _address) external view returns (bool);

  function addBeneficiary(address _address, bytes calldata applicationCid)
    external;

  function revokeBeneficiary(address _address) external;

  function approveOwner(address _address) external;

  function approveCouncil(address _address) external;

  function revokeApprovedCouncil(address account) external;

  function revokeApprovedOwner(address account) external;
}
