// SPDX-License-Identifier: MIT

pragma solidity >=0.7.0 <0.8.0;

contract BeneficiaryRegistry {

 address private governance;
 address private council;
 
 struct Beneficiary {
   bytes applicationCid; // ipfs address of application
   uint listPointer;
 }
 
 event BeneficiaryAdded(address indexed _address, bytes indexed _applicationCid);
 event BeneficiaryRevoked(address indexed _address);
 event GovernanceUpdated(address indexed _oldAddress, address indexed _newAddress);
 event CouncilUpdated(address indexed _oldAddress, address indexed _newAddress);


 mapping(address => Beneficiary) private beneficiariesMap;
 address[] private beneficiariesList;

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
 }

 function setGovernance(address _address) external validAddress(_address) onlyGovernance {
   address previousGovernance = governance;
   governance = _address;
   emit GovernanceUpdated(previousGovernance, _address);
 }

 function setCouncil(address _address) external validAddress(_address)  onlyCouncil {
   address previousCouncil = council;
   council = _address;
   emit CouncilUpdated(previousCouncil, _address);
 }

 function addBeneficiary(address _address, bytes calldata applicationCid) external onlyGovernance {
   require(_address == address(_address), "invalid address");
   require(applicationCid.length > 0, "!application");
   require(!beneficiaryExists(_address), "exists");
   
   beneficiariesList.push(_address);
   beneficiariesMap[_address] = Beneficiary({ 
       applicationCid: applicationCid,
       listPointer: beneficiariesList.length -1
    });
    
   emit BeneficiaryAdded(_address, applicationCid);
 }


 function revokeBeneficiary(address _address) external onlyCouncil {
   require(beneficiaryExists(_address), "exists");
   delete beneficiariesList[beneficiariesMap[_address].listPointer];
   delete beneficiariesMap[_address];
   emit BeneficiaryRevoked(_address);
 }

 function beneficiaryExists(address _address) public view returns (bool) {
   if(beneficiariesList.length == 0) return false;
   return beneficiariesList[beneficiariesMap[_address].listPointer] == _address;
 }
 
 function getBeneficiary(address _address) public view returns(bytes memory) {
     return beneficiariesMap[_address].applicationCid;
 }
 
}