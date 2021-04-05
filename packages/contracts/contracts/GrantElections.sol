pragma solidity >=0.7.0 <=0.8.3;
pragma experimental ABIEncoderV2;

import "@openzeppelin/contracts/math/SafeMath.sol";
import "@openzeppelin/contracts/token/ERC20/SafeERC20.sol";
import "./IStaking.sol";
import "./IBeneficiaryRegistry.sol";

contract GrantElections {
  using SafeMath for uint256;
  using SafeERC20 for IERC20;

  IERC20 public immutable POP;
  address public governance;

  struct Vote {
    address voter;
    address beneficiary;
    uint256 weight;
  }

  enum ElectionTerm {Monthly, Quarterly, Yearly}
  enum ElectionState {Registration, Voting, Closed}

  uint256 constant ONE_DAY = 86400; // seconds in 1 day

  struct Election {
    Vote[] votes;
    mapping(address => bool) registeredBeneficiaries;
    address[] registeredBeneficiariesList;
    ElectionTerm electionTerm;
    ElectionState electionState;
    ElectionConfiguration electionConfiguration;
    uint256 startTime;
    bool exists;
  }

  struct ElectionConfiguration {
    uint8 ranking;
    uint8 awardees;
    bool useChainLinkVRF;
    uint256 registrationPeriod;
    uint256 votingPeriod;
    uint256 cooldownPeriod;
    uint256 registrationBond;
    bool registrationBondRequired;
  }

  // mapping of election terms and beneficiary total votes
  Election[3] public elections;
  mapping(ElectionTerm => mapping(address => uint256)) beneficiaryVotes;
  mapping(ElectionTerm => ElectionConfiguration) electionConfigurations;
  mapping(ElectionTerm => mapping(uint8 => address)) electionRanking;

  ElectionConfiguration[3] public electionDefaults;

  IStaking staking;
  IBeneficiaryRegistry beneficiaryRegistry;

  modifier onlyGovernance {
    require(msg.sender == governance, "!governance");
    _;
  }
  modifier validAddress(address _address) {
    require(_address == address(_address), "invalid address");
    _;
  }

  event BeneficiaryRegistered(address _beneficiary, ElectionTerm _term);
  event UserVoted(address _user, ElectionTerm _term);
  event ElectionInitialized(ElectionTerm _term, uint256 _startTime);

  event GovernanceUpdated(
    address indexed _oldAddress,
    address indexed _newAddress
  );

  constructor(
    IStaking _staking,
    IBeneficiaryRegistry _beneficiaryRegistry,
    IERC20 _pop,
    address _governance
  ) {
    staking = _staking;
    beneficiaryRegistry = _beneficiaryRegistry;
    POP = _pop;
    governance = _governance;
    _setDefaults();
  }

  /**
   * @notice sets governance to address provided
   */
  function setGovernance(address _address)
    external
    onlyGovernance
    validAddress(_address)
  {
    address _previousGovernance = governance;
    governance = _address;
    emit GovernanceUpdated(_previousGovernance, _address);
  }

  // todo: mint POP for caller to incentivize calling function
  // todo: use bonds to incentivize callers instead of minting
  function initialize(ElectionTerm _grantTerm) public {
    uint8 _term = uint8(_grantTerm);
    Election storage _election = elections[_term];

    if (_election.exists == true) {
      require(
        _election.electionState == ElectionState.Closed,
        "election not yet closed"
      );
      require(
        _election.electionConfiguration.cooldownPeriod >=
          block.timestamp.sub(_election.startTime),
        "can't start new election, not enough time elapsed since last election"
      );
    }

    delete elections[_term];

    Election storage e = elections[_term];
    e.electionConfiguration = electionDefaults[_term];
    e.electionState = ElectionState.Registration;
    e.electionTerm = _grantTerm;
    e.startTime = block.timestamp;
    e.exists = true;

    emit ElectionInitialized(e.electionTerm, e.startTime);
  }

  function getElectionMetadata(ElectionTerm _grantTerm)
    public
    view
    returns (
      Vote[] memory votes_,
      ElectionTerm term_,
      address[] memory registeredBeneficiaries_,
      ElectionState state_,
      uint8[2] memory awardeesRanking_,
      bool useChainLinkVRF_,
      uint256[3] memory periods_,
      uint256 startTime_
    )
  {
    Election storage e = elections[uint8(_grantTerm)];

    votes_ = e.votes;
    term_ = e.electionTerm;
    registeredBeneficiaries_ = e.registeredBeneficiariesList;
    state_ = e.electionState;
    awardeesRanking_ = [
      e.electionConfiguration.awardees,
      e.electionConfiguration.ranking
    ];
    useChainLinkVRF_ = e.electionConfiguration.useChainLinkVRF;
    periods_ = [
      e.electionConfiguration.cooldownPeriod,
      e.electionConfiguration.registrationPeriod,
      e.electionConfiguration.votingPeriod
    ];
    startTime_ = e.startTime;
  }

  function getRegisteredBeneficiaries(ElectionTerm _term)
    external
    returns (address[] memory)
  {
    return elections[uint8(_term)].registeredBeneficiariesList;
  }

  function toggleRegistrationBondRequirement(ElectionTerm _term)
    external
    onlyGovernance
  {
    electionDefaults[uint8(_term)].registrationBondRequired = !electionDefaults[
      uint8(_term)
    ]
      .registrationBondRequired;
  }

  /**
   * todo: check beneficiary is not registered for another non-closed election
   * todo: check beneficiary is not currently awarded a grant
   * todo: add claimBond function for beneficiary to receive their bond after the election period has closed
   */
  function registerForElection(address _beneficiary, ElectionTerm _grantTerm)
    public
  {
    Election storage _election = elections[uint8(_grantTerm)];

    require(
      _election.electionState == ElectionState.Registration,
      "election not open for registration"
    );
    require(
      beneficiaryRegistry.beneficiaryExists(_beneficiary),
      "address is not eligible for registration"
    );
    _collectRegistrationBond(_election);

    _election.registeredBeneficiaries[_beneficiary] = true;
    _election.registeredBeneficiariesList.push(_beneficiary);

    emit BeneficiaryRegistered(_beneficiary, _grantTerm);
  }

  function _collectRegistrationBond(Election storage _election) internal {
    if (_election.electionConfiguration.registrationBondRequired == true) {
      require(
        POP.balanceOf(msg.sender) >=
          _election.electionConfiguration.registrationBond,
        "insufficient registration bond balance"
      );

      POP.safeTransferFrom(
        msg.sender,
        address(this),
        _election.electionConfiguration.registrationBond
      );
    }
  }

  function _isEligibleBeneficiary(address _beneficiary, ElectionTerm _term)
    public
    view
    returns (bool)
  {
    return
      elections[uint8(_term)].registeredBeneficiaries[_beneficiary] &&
      beneficiaryRegistry.beneficiaryExists(_beneficiary);
  }

  function refreshElectionState(ElectionTerm _electionTerm) public {
    Election storage election = elections[uint8(_electionTerm)];
    if (
      block.timestamp >=
      election
        .startTime
        .add(election.electionConfiguration.registrationPeriod)
        .add(election.electionConfiguration.votingPeriod)
    ) {
      election.electionState = ElectionState.Closed;
    } else if (
      block.timestamp >=
      election.startTime.add(election.electionConfiguration.registrationPeriod)
    ) {
      election.electionState = ElectionState.Voting;
    } else if (block.timestamp >= election.startTime) {
      election.electionState = ElectionState.Registration;
    }
  }

  function vote(
    address[] memory _beneficiaries,
    uint8[] memory _voiceCredits,
    ElectionTerm _electionTerm
  ) public {
    Election storage election = elections[uint8(_electionTerm)];
    require(_voiceCredits.length > 0, "Voice credits are required");
    require(_beneficiaries.length > 0, "Beneficiaries are required");
    refreshElectionState(_electionTerm);
    require(
      election.electionState == ElectionState.Voting,
      "Election not open for voting"
    );

    uint256 _usedVoiceCredits = 0;
    uint256 _stakedVoiceCredits = staking.getVoiceCredits(msg.sender);

    require(_stakedVoiceCredits > 0, "must have voice credits from staking");

    for (uint8 i = 0; i < _beneficiaries.length; i++) {
      // todo: consider skipping iteration instead of throwing since if a beneficiary is removed from the registry during an election, it can prevent votes from being counted
      require(
        _isEligibleBeneficiary(_beneficiaries[i], _electionTerm),
        "ineligible beneficiary"
      );

      _usedVoiceCredits = _usedVoiceCredits.add(_voiceCredits[i]);
      uint256 _sqredVoiceCredits = sqrt(_voiceCredits[i]);

      Vote memory _vote =
        Vote({
          voter: msg.sender,
          beneficiary: _beneficiaries[i],
          weight: _sqredVoiceCredits
        });

      election.votes.push(_vote);
      beneficiaryVotes[_electionTerm][_beneficiaries[i]] = beneficiaryVotes[
        _electionTerm
      ][_beneficiaries[i]]
        .add(_sqredVoiceCredits);
    }
    require(
      _usedVoiceCredits <= _stakedVoiceCredits,
      "Insufficient voice credits"
    );
  }

  function _recalculateRanking(
    ElectionTerm _electionTerm,
    address _beneficiary,
    uint256 weight
  ) internal {
    if (
      weight >
      beneficiaryVotes[_electionTerm][
        electionRanking[_electionTerm][
          electionConfigurations[_electionTerm].ranking - 1
        ]
      ]
    ) {
      // If weight is bigger than the last in the ranking for the election term, take its position
      electionRanking[_electionTerm][
        electionConfigurations[_electionTerm].ranking - 1
      ] = _beneficiary;
    } else {
      // Otherwise, no need to recalculate ranking
      return;
    }

    // traverse inverted ranking
    for (uint8 i = electionConfigurations[_electionTerm].ranking; i > 0; i--) {
      // if the votes are higher than the next one in the ranking, swap them
      if (
        beneficiaryVotes[_electionTerm][electionRanking[_electionTerm][i]] >
        beneficiaryVotes[_electionTerm][electionRanking[_electionTerm][i]] + 1
      ) {
        (
          electionRanking[_electionTerm][i],
          electionRanking[_electionTerm][i + 1]
        ) = (
          electionRanking[_electionTerm][i + 1],
          electionRanking[_electionTerm][i]
        );
      }
    }
  }

  function _setDefaults() internal {
    ElectionConfiguration storage monthlyDefaults =
      electionDefaults[uint8(ElectionTerm.Monthly)];
    monthlyDefaults.awardees = 1;
    monthlyDefaults.ranking = 3;
    monthlyDefaults.useChainLinkVRF = true;
    monthlyDefaults.registrationBondRequired = true;
    monthlyDefaults.registrationBond = 50e18;
    monthlyDefaults.votingPeriod = 7 * ONE_DAY;
    monthlyDefaults.registrationPeriod = 7 * ONE_DAY;
    monthlyDefaults.cooldownPeriod = 21 * ONE_DAY;

    ElectionConfiguration storage quarterlyDefaults =
      electionDefaults[uint8(ElectionTerm.Quarterly)];
    quarterlyDefaults.awardees = 2;
    quarterlyDefaults.ranking = 5;
    quarterlyDefaults.useChainLinkVRF = true;
    quarterlyDefaults.registrationBondRequired = true;
    quarterlyDefaults.registrationBond = 100e18;
    quarterlyDefaults.votingPeriod = 14 * ONE_DAY;
    quarterlyDefaults.registrationPeriod = 14 * ONE_DAY;
    quarterlyDefaults.cooldownPeriod = 83 * ONE_DAY;

    ElectionConfiguration storage yearlyDefaults =
      electionDefaults[uint8(ElectionTerm.Yearly)];
    yearlyDefaults.awardees = 3;
    yearlyDefaults.ranking = 7;
    yearlyDefaults.useChainLinkVRF = true;
    yearlyDefaults.registrationBondRequired = true;
    yearlyDefaults.registrationBond = 1000e18;
    yearlyDefaults.votingPeriod = 30 * ONE_DAY;
    yearlyDefaults.registrationPeriod = 30 * ONE_DAY;
    yearlyDefaults.cooldownPeriod = 358 * ONE_DAY;
  }

  function sqrt(uint256 y) internal pure returns (uint256 z) {
    if (y > 3) {
      z = y;
      uint256 x = y / 2 + 1;
      while (x < z) {
        z = x;
        x = (y / x + x) / 2;
      }
    } else if (y != 0) {
      z = 1;
    }
  }
}
