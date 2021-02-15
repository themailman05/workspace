// SPDX-License-Identifier: MIT

pragma solidity >=0.7.0 <0.8.0;

import "./BeneficiaryRegistry.sol";

contract GrantRegistry {

 address private governance;
 address private council;
 address private beneficiaryRegistry;
 
 uint8 private grantShareType;
 mapping(uint8 => bool) private grantTermsEnabled;
 
 
 uint private blocksInADay = 6423;
 uint private blocksInAMonth = blocksInADay * 30;
 uint private blocksInAQuarter = blocksInAMonth * 3;
 uint private blocksInAYear = blocksInADay * 365;
 
 
 uint8 constant GRANT_TERM_MONTH = 1;
 uint8 constant GRANT_TERM_QUARTER = 2;
 uint8 constant GRANT_TERM_YEAR = 3;
 uint8 constant GRANT_SHARE_TYPE_EQUAL_WEIGHT = 1;
 uint8 constant GRANT_SHARE_TYPE_DYNAMIC_WEIGHT = 2;
 
 event GrantCreated(uint8 termLength, address[] awardees, uint8 grantShareType, bytes32 shares);
  event GovernanceUpdated(address indexed _oldAddress, address indexed _newAddress);
 event CouncilUpdated(address indexed _oldAddress, address indexed _newAddress);

 struct Awardee {
   address awardee;
   uint256 shares; // if grantShareType=GRANT_SHARE_TYPE_DYNAMIC_WEIGHT share will be % of grant
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

 constructor(address _beneficiaryRegistry) {
   governance = msg.sender;
   council = msg.sender;
   grantTermsEnabled[GRANT_TERM_QUARTER] = true;
   grantShareType = GRANT_SHARE_TYPE_EQUAL_WEIGHT;
   beneficiaryRegistry = _beneficiaryRegistry;
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
 
 function setEnabledGrantTerms(uint8[] calldata grantTerms) public onlyGovernance {
    disableAllGrantTerms(); // reset grant terms
    for (uint i=0; i<grantTerms.length; i++) {
      grantTermsEnabled[grantTerms[i]] = true;
    }
 }

 function disableAllGrantTerms() internal {
   grantTermsEnabled[GRANT_TERM_MONTH] = false;
   grantTermsEnabled[GRANT_TERM_QUARTER] = false;
   grantTermsEnabled[GRANT_TERM_YEAR] = false;
 }
 
 function setGrantShareType(uint8 _grantShareType) public onlyGovernance {
     require(_grantShareType == GRANT_SHARE_TYPE_EQUAL_WEIGHT || _grantShareType == GRANT_SHARE_TYPE_DYNAMIC_WEIGHT, "invalid");
     grantShareType = _grantShareType;
 }
 
 function createGrant(uint8 termLength, address[] calldata beneficiaries, uint256[] calldata shares) public onlyGovernance {
  require(grantHasExpired(termLength), 'grantIsActive');
  require(grantTermsEnabled[termLength], 'termLength disabled');
  
  BeneficiaryRegistry registry = BeneficiaryRegistry(beneficiaryRegistry);
  Awardee[] storage awardees;
  address[] storage eligibleBeneficiaries;
  uint256[] storage eligibleBeneficiariesShares;

  for (uint i=0; i<beneficiaries.length; i++) {
    // let's make sure that the beneficiaries are included in the registry before we award them a grant
    if (registry.beneficiaryExists(beneficiaries[i])) {
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
  
  emit GrantCreated(termLength, eligibleBeneficiaries, grantShareType, keccak256(abi.encodePacked(eligibleBeneficiariesShares)));
 }
 
 function getEligibleBeneficiaries(address[] memory beneficiaries) internal view returns (address[] memory _eligibleBeneficiaries){
    address[] memory eligibleBeneficiaries = new address[](beneficiaries.length);
    BeneficiaryRegistry registry = BeneficiaryRegistry(beneficiaryRegistry);
    for (uint i=0; i<beneficiaries.length; i++) {
        if (registry.beneficiaryExists(beneficiaries[i])) {
            eligibleBeneficiaries[i] = beneficiaries[i];
        }
    }
    return eligibleBeneficiaries;
 }
 
 function grantHasExpired(uint8 termLength) public view returns (bool) {
     return activeGrants[termLength].endBlock < block.number;
 }
 
 function getPeriodInBlocksForGrantTerm(uint256 termLength) internal view returns (uint256) {
  uint256 periodInBlocks;
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