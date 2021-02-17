// SPDX-License-Identifier: MIT

pragma solidity >=0.7.0 <0.8.0;

import "./BeneficiaryRegistry.sol";

contract GrantRegistry {
  address private governance;
  address private council;
  address private beneficiaryRegistry;

  uint8 private grantShareType;
  mapping(uint8 => bool) private grantTermsEnabled;

  uint256 private blocksInADay = 6423;
  uint256 private blocksInAMonth = blocksInADay * 30;
  uint256 private blocksInAQuarter = blocksInAMonth * 3;
  uint256 private blocksInAYear = blocksInADay * 365;

  uint8 constant GRANT_TERM_MONTH = 1;
  uint8 constant GRANT_TERM_QUARTER = 2;
  uint8 constant GRANT_TERM_YEAR = 3;
  uint8 constant GRANT_SHARE_TYPE_EQUAL_WEIGHT = 1;
  uint8 constant GRANT_SHARE_TYPE_DYNAMIC_WEIGHT = 2;

  event GrantCreated(
    uint8 termLength,
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
    uint8 grantTerm;
    uint256 shares; // if grantShareType=GRANT_SHARE_TYPE_DYNAMIC_WEIGHT share will be % of grant
  }

  struct Grant {
    uint256 startBlock;
    uint256 endBlock;
    uint8 termLength;
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
    grantTermsEnabled[GRANT_TERM_QUARTER] = true;
    grantShareType = GRANT_SHARE_TYPE_EQUAL_WEIGHT;
    beneficiaryRegistry = _beneficiaryRegistry;
  }

  function setGovernance(address _address) public validAddress(_address) onlyGovernance {
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
    grantTermsEnabled[GRANT_TERM_MONTH] = false;
    grantTermsEnabled[GRANT_TERM_QUARTER] = false;
    grantTermsEnabled[GRANT_TERM_YEAR] = false;
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
    uint8 termLength,
    address[] calldata beneficiaries,
    uint256[] calldata shares
  ) public onlyGovernance {
    require(grantHasExpired(termLength), "grantIsActive");
    require(grantTermsEnabled[termLength], "termLength disabled");

    BeneficiaryRegistry registry = BeneficiaryRegistry(beneficiaryRegistry);

    address[] memory eligibleBeneficiaries =
      new address[](beneficiaries.length);
    uint256[] memory eligibleBeneficiariesShares =
      new uint256[](beneficiaries.length);

    activeGrants[termLength] = Grant({
      startBlock: block.number,
      endBlock: block.number + getPeriodInBlocksForGrantTerm(termLength),
      termLength: termLength,
      grantShareType: grantShareType,
      awardeesCount: 0
    });

    for (uint256 i = 0; i < beneficiaries.length; i++) {
      if (registry.beneficiaryExists(beneficiaries[i])) {
        eligibleBeneficiaries[i] = beneficiaries[i];
        eligibleBeneficiariesShares[i] = shares[i];
        activeGrants[termLength].awardeesCount++;
        activeAwardees[termLength].push(
          Awardee({
            grantTerm: termLength,
            awardee: beneficiaries[0],
            shares: shares[0]
          })
        );
      }
    }

    emit GrantCreated(
      termLength,
      eligibleBeneficiaries,
      grantShareType,
      eligibleBeneficiariesShares
    );
  }

  function getActiveAwardees(uint8 termLength)
    public
    view
    returns (address[] memory)
  {
    address[] memory ret =
      new address[](activeGrants[termLength].awardeesCount);
    for (uint256 i = 0; i < activeGrants[termLength].awardeesCount; i++) {
      ret[i] = activeAwardees[termLength][i].awardee;
    }
    return ret;
  }

  function getActiveGrant(uint8 termLength)
    public
    view
    returns (uint256[] memory grant)
  {
    uint256[] memory _grant = new uint256[](5);
    _grant[0] = activeGrants[termLength].startBlock;
    _grant[1] = activeGrants[termLength].endBlock;
    _grant[2] = activeGrants[termLength].termLength;
    _grant[3] = activeGrants[termLength].grantShareType;
    _grant[4] = activeGrants[termLength].awardeesCount;
    return _grant;
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

  function grantHasExpired(uint8 termLength) public view returns (bool) {
    return activeGrants[termLength].endBlock < block.number;
  }

  function getPeriodInBlocksForGrantTerm(uint256 termLength)
    internal
    view
    returns (uint256)
  {
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
