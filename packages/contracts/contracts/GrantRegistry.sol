// SPDX-License-Identifier: MIT

pragma solidity >=0.7.0 <0.8.0;

import "./BeneficiaryRegistry.sol";

contract GrantRegistry {
  address private governance;
  address private council;
  address private beneficiaryRegistry;

  uint8 private grantShareType;
  mapping(uint8 => bool) private grantTermsEnabled;

  enum GrantTerm {MONTH, QUARTER, YEAR}
  uint256 constant SECONDS_IN_A_MONTH = 2592000;
  uint256 constant SECONDS_IN_A_QUARTER = 7776000;
  uint256 constant SECONDS_IN_A_YEAR = 31104000;

  uint8 constant GRANT_SHARE_TYPE_EQUAL_WEIGHT = 1;
  uint8 constant GRANT_SHARE_TYPE_DYNAMIC_WEIGHT = 2;

  event GrantCreated(
    GrantTerm grantTerm,
    address[] awardees,
    uint8 grantShareType,
    uint256[] shares
  );
  event GovernanceUpdated(
    address indexed _oldAddress,
    address indexed _newAddress
  );
  event CouncilUpdated(
    address indexed _oldAddress,
    address indexed _newAddress
  );

  struct Awardee {
    address awardee;
    GrantTerm grantTerm;
    uint256 shares; // if grantShareType=GRANT_SHARE_TYPE_DYNAMIC_WEIGHT share will be % of grant
  }

  struct Grant {
    uint256 startTime;
    uint256 endTime;
    GrantTerm grantTerm;
    uint8 grantShareType;
    uint8 awardeesCount;
  }

  mapping(uint8 => Grant) private activeGrants;
  mapping(uint8 => Awardee[]) private activeAwardees;
  mapping(uint8 => uint8) private activeAwardeesCount;

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
    grantTermsEnabled[uint8(GrantTerm.QUARTER)] = true;
    grantShareType = GRANT_SHARE_TYPE_EQUAL_WEIGHT;
    beneficiaryRegistry = _beneficiaryRegistry;
  }

  function setGovernance(address _address)
    public
    validAddress(_address)
    onlyGovernance
  {
    address previousGovernance = governance;
    governance = _address;
    emit GovernanceUpdated(previousGovernance, _address);
  }

  function setCouncil(address _address)
    public
    validAddress(_address)
    onlyCouncil
  {
    address previousCouncil = council;
    council = _address;
    emit CouncilUpdated(previousCouncil, _address);
  }

  function setEnabledGrantTerms(uint8[] calldata grantTerms)
    public
    onlyGovernance
  {
    disableAllGrantTerms(); // reset grant terms
    for (uint256 i = 0; i < grantTerms.length; i++) {
      grantTermsEnabled[grantTerms[i]] = true;
    }
  }

  function disableAllGrantTerms() internal {
    grantTermsEnabled[uint8(GrantTerm.MONTH)] = false;
    grantTermsEnabled[uint8(GrantTerm.QUARTER)] = false;
    grantTermsEnabled[uint8(GrantTerm.YEAR)] = false;
  }

  function setGrantShareType(uint8 _grantShareType) public onlyGovernance {
    require(
      _grantShareType == GRANT_SHARE_TYPE_EQUAL_WEIGHT ||
        _grantShareType == GRANT_SHARE_TYPE_DYNAMIC_WEIGHT,
      "invalid"
    );
    grantShareType = _grantShareType;
  }

  /**
   * todo: redesign to avoid loop and use claimGrant which accepts 1 beneficiary and looks up latest election to verify eligibility
   */
  function createGrant(
    GrantTerm grantTerm,
    address[] calldata beneficiaries,
    uint256[] calldata shares
  ) public onlyGovernance {
    require(grantHasExpired(grantTerm), "grantIsActive");
    require(grantTermsEnabled[uint8(grantTerm)], "grantTerm disabled");

    BeneficiaryRegistry registry = BeneficiaryRegistry(beneficiaryRegistry);

    address[] memory eligibleBeneficiaries =
      new address[](beneficiaries.length);
    uint256[] memory eligibleBeneficiariesShares =
      new uint256[](beneficiaries.length);

    activeGrants[uint8(grantTerm)] = Grant({
      startTime: block.timestamp,
      endTime: block.timestamp + getPeriodInSecondsForGrantTerm(grantTerm),
      grantTerm: grantTerm,
      grantShareType: grantShareType,
      awardeesCount: 0
    });

    for (uint256 i = 0; i < beneficiaries.length; i++) {
      if (registry.beneficiaryExists(beneficiaries[i])) {
        eligibleBeneficiaries[i] = beneficiaries[i];
        eligibleBeneficiariesShares[i] = shares[i];
        activeGrants[uint8(grantTerm)].awardeesCount++;
        activeAwardees[uint8(grantTerm)].push(
          Awardee({
            grantTerm: grantTerm,
            awardee: beneficiaries[0],
            shares: shares[0]
          })
        );
      }
    }

    emit GrantCreated(
      grantTerm,
      eligibleBeneficiaries,
      grantShareType,
      eligibleBeneficiariesShares
    );
  }

  function getActiveAwardees(GrantTerm grantTerm)
    public
    view
    returns (address[] memory)
  {
    address[] memory ret =
      new address[](activeGrants[uint8(grantTerm)].awardeesCount);
    for (uint256 i = 0; i < activeGrants[uint8(grantTerm)].awardeesCount; i++) {
      ret[i] = activeAwardees[uint8(grantTerm)][i].awardee;
    }
    return ret;
  }

  function getActiveGrant(GrantTerm grantTerm_)
    public
    view
    returns (
      uint256,
      uint256,
      GrantTerm,
      uint8,
      uint8
    )
  {
    uint8 _index = uint8(grantTerm_);
    return (
      activeGrants[_index].startTime,
      activeGrants[_index].endTime,
      activeGrants[_index].grantTerm,
      activeGrants[_index].grantShareType,
      activeGrants[_index].awardeesCount
    );
  }

  function getEligibleBeneficiaries(address[] memory beneficiaries)
    internal
    view
    returns (address[] memory _eligibleBeneficiaries)
  {
    address[] memory eligibleBeneficiaries =
      new address[](beneficiaries.length);
    BeneficiaryRegistry registry = BeneficiaryRegistry(beneficiaryRegistry);
    for (uint256 i = 0; i < beneficiaries.length; i++) {
      if (registry.beneficiaryExists(beneficiaries[i])) {
        eligibleBeneficiaries[i] = beneficiaries[i];
      }
    }
    return eligibleBeneficiaries;
  }

  function grantHasExpired(GrantTerm grantTerm) public view returns (bool) {
    return activeGrants[uint8(grantTerm)].endTime < block.timestamp;
  }

  function getPeriodInSecondsForGrantTerm(GrantTerm grantTerm)
    internal
    pure
    returns (uint256 periodInSeconds)
  {
    if (grantTerm == GrantTerm.MONTH) {
      periodInSeconds = SECONDS_IN_A_MONTH;
    }
    if (grantTerm == GrantTerm.QUARTER) {
      periodInSeconds = SECONDS_IN_A_QUARTER;
    }
    if (grantTerm == GrantTerm.YEAR) {
      periodInSeconds = SECONDS_IN_A_YEAR;
    }
  }
}
