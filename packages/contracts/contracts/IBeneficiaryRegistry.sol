// SPDX-License-Identifier: MIT

pragma solidity >=0.7.0 <0.8.0;

interface IBeneficiaryRegistry {
  function beneficiaryExists(address _address) external view returns (bool);
}
