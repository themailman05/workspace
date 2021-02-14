// SPDX-License-Identifier: MIT

pragma solidity >=0.7.0 <0.8.0;

import "./BeneficiaryRegistry";

contract GrantFactory {

 address private governance;
 address private council;
 
 uint8 private grantShareType;
 uint[3] private grantTermsEnabled;
 
 
 uint private blocksInADay = 6423;
 uint private blocksInAMonth = blocksInADay * 30;
 uint private blocksInAQuarter = blocksInAMonth * 3;
 uint private blocksInAYear = blocksInADay * 365;
 
 
 uint8 constant GRANT_TERM_MONTH = 1;
 uint8 constant GRANT_TERM_QUARTER = 2;
 uint8 constant GRANT_TERM_YEAR = 3;
 uint8 constant GRANT_SHARE_TYPE_EQUAL_WEIGHT = 1;
 uint8 constant GRANT_SHARE_TYPE_DYNAMIC_WEIGHT = 2;
 
 event GrantCreated(uint8 termLength, address[] awardees, uint8 grantShareType, uint256 shares);
 
 struct Awardee {
   address awardee;
   uint256 share; // if grantShareType=GRANT_SHARE_TYPE_DYNAMIC_WEIGHT share will be % of grant
 }
 
 struct Grant {
    Awardee[] awardees;
    uint startBlock;
    uint endBlock;
    uint termLength;
    uint grantShareType;
 }
 
 mapping(uint8 => Grant) private activeGrants;

 modifier onlyGovernance {
   require(msg.sender == governance, "!governance");
   _;
 }

 modifier onlyCouncil {
   require(msg.sender == council, "!council");
   _;
 }
 
 modifier validAddress(address _address) {
   require(_address == address(_address), "invalid address");
   _;
 }

 constructor() {
   governance = msg.sender;
   council = msg.sender;
   grantTermsEnabled = [GRANT_TERM_QUARTER];
   grantShareType = GRANT_SHARE_TYPE_EQUAL_WEIGHT;
 }

 function setGovernance(address _address) public validAddress(_address) onlyGovernance {
   address previousGovernance = governance;
   governance = _address;
   emit GovernanceUpdated(previousGovernance, _address);
 }

 function setCouncil(address _address) public validAddress(_address)  onlyCouncil {
   address previousCouncil = council;
   council = _address;
   emit CouncilUpdated(previousCouncil, _address);
 }
 
 function setEnabledGrantTerms(uint[] grantTerms) public onlyGovernance {
    grantTermsEnabled = grantTerms;
 }
 
 function setGrantShareType(uint _grantShareType) public onlyGovernance {
     require(_grantShareType == GRANT_SHARE_TYPE_EQUAL_WEIGHT || _grantShareType == GRANT_SHARE_TYPE_DYNAMIC_WEIGHT, "invalid");
     grantShareType = _grantShareType;
 }
 
 function createGrant(uint8 termLength, address[] beneficiaries, uint256[] shares) public onlyGovernance {
  require(grantHasExpired(termLength), 'grantIsActive');
  require(grantTermsEnabled[termLength], 'termLength disabled');
  
  Awardee[] awardees = [];
  address[] eligibleBeneficiaries = [];
  uint256[] eligibleBeneficiariesShares = [];

  for (uint i=0; i<beneficiaries.length; i++) {
    // let's make sure that the beneficiaries are included in the registry before we award them a grant
    if (BeneficiaryRegistry.beneficiaryExists(beneficiaries[i])) {
        eligibleBeneficiaries.push(beneficiaries[i]);
        eligibleBeneficiariesShares.push(shares[i]);
        awardees.push(Awardee({
            awardee: beneficiaries[i],
            shares: shares[i]
        }));
    }
  }
  
  activeGrants[termLength] = Grant({ 
      awardees: awardees, 
      startBlock: block.number, 
      endBlock: block.number + getPeriodInBlocksForGrantTerm(termLength),
      termLength: termLength,
      grantShareType: grantShareType
  });
  
  emit GrantCreated(termLength, eligibleBeneficiaries, grantShareType, eligibleBeneficiariesShares);
 }
 
 function getEligibleBeneficiaries(address[] beneficiaries) internal {
    address[] eligibleBeneficiaries = [];
    for (uint i=0; i<beneficiaries.length; i++) {
        if (BeneficiaryRegistry.beneficiaryExists(beneficiaries[i])) {
            eligibleBeneficiaries.push(beneficiaries[i]);
        }
    }
    return eligibleBeneficiaries;
 }
 
 function getActiveGrant(uint termLength) public view returns (Grant) {
    return activeGrants[termLength];
 }
 
 function grantHasExpired(uint8 termLength) public view returns (bool) {
     if(!activeGrants[termLength]) return true;
     return activeGrants[termLength].endBlock < block.number;
 }
 
 function getPeriodInBlocksForGrantTerm(termLength) internal {
  uint periodInBlocks;
  if (termLength == GRANT_TERM_MONTH) {
    periodInBlocks = blocksInAMonth;
  }
  if (termLength == GRANT_TERM_QUARTER) {
      periodInBlocks = blocksInAQuarter;
  }
  if (termLength == GRANT_TERM_YEAR) {
      periodInBlocks = blocksInAYear;
  }
  return periodInBlocks;
 }
 
}