pragma solidity >=0.7.0 <= 0.8.2;

import "@openzeppelin/contracts/math/SafeMath.sol";
import "./IStaking.sol";
import "./IBeneficiaryRegistry.sol";

contract GrantElections {
    using SafeMath for uint256;

    struct Vote {
        address voter;
        address beneficiary;
        uint256 weight;
    }

    enum ElectionTerm {Monthly, Quarterly, Yearly}
    enum ElectionState {Registration, Voting, Closed}

    uint8 constant ONE_DAY = 86400; // seconds in 1 day

    struct Election {
        Vote[] votes;
        mapping(address => bool) registeredBeneficiaries;
        ElectionTerm electionTerm;
        ElectionState electionState;
        ElectionConfiguration electionConfiguration;
        uint256 startTime;
    }

    struct ElectionConfiguration {
        uint8 ranking;
        uint8 awardees;
        uint256 cooldownPeriod;
    }

    // mapping of election terms and beneficiary total votes
    Election[3] private elections;
    mapping(ElectionTerm => mapping(address => uint256)) beneficiaryVotes;
    mapping(ElectionTerm => ElectionConfiguration) electionConfigurations;
    mapping(ElectionTerm => mapping(uint8 => address)) electionRanking;

    ElectionConfiguration[3] private electionDefaults;  

    IStaking staking;
    IBeneficiaryRegistry beneficiaryRegistry;

    event BeneficiaryRegistered(address _beneficiary, ElectionTerm _term);

    constructor(IStaking _staking, IBeneficiaryRegistry _beneficiaryRegistry) {
        staking = _staking;
        beneficiaryRegistry = _beneficiaryRegistry;

        _setDefaults();
    }

    function _setDefaults() internal {
        ElectionConfiguration storage monthlyDefaults = electionDefaults[uint(ElectionTerm.Monthly)];
        monthlyDefaults.awardees = 1;
        monthlyDefaults.ranking = 3;
        monthlyDefaults.cooldownPeriod = 21 * ONE_DAY; 

        ElectionConfiguration storage quarterlyDefaults = electionDefaults[uint(ElectionTerm.Quarterly)];
        quarterlyDefaults.awardees = 2;
        quarterlyDefaults.ranking = 5;
        quarterlyDefaults.cooldownPeriod = 83 * ONE_DAY; 

        ElectionConfiguration storage yearlyDefaults = electionDefaults[uint(ElectionTerm.Yearly)];
        yearlyDefaults.awardees = 3;
        yearlyDefaults.ranking = 7;
        yearlyDefaults.cooldownPeriod = 358 * ONE_DAY;
    }

    // todo: mint POP for caller to incentivize calling function
    function initialize(ElectionTerm _grantTerm) public {
        uint8 _term = uint8(_grantTerm);
        Election _election = elections[_term];
        require(!_election || _election.electionState == ElectionState.Closed, "election can't be started yet");

        if (_election && _election.electionState == ElectionState.Closed) {
            require(
                _election.electionConfiguration.cooldownPeriod >= block.timestamp.sub(_election.startTime), 
                "can't start new election, not enough time elapsed since last election"
            );
        }

        delete election[_term];

        Election storage e = election[_term];
        e.electionConfiguration = electionDefaults[_term];
        e.electionState = ElectionState.Registration;
        e.electionTerm = _term;
        e.startTime = block.timestamp;
    }

    // todo: use POP for bond
    function registerForElection(address memory _beneficiary, ElectionTerm _term) public {
        require(elections[_term].electionState == ElectionState.Registration, "election not open for registration");
        require(beneficiaryRegistry.beneficiaryExists(_beneficiary), "address is not eligible for registration");

        elections[_term].registeredBeneficiaries[_beneficiary] = true;

        emit BeneficiaryRegistered(_beneficiary, _term);
    }

    function _isRegisteredBeneficiary(address memory _beneficiary, ElectionTerm _term) view public returns (bool) {
        return elections[_term].registeredBeneficiaries[_beneficiary];
    }

    function vote(address[] memory _beneficiaries, uint8[] memory _voiceCredits, ElectionTerm _electionTerm) public {
        require(elections[_electionTerm].electionState == ElectionState.Voting, "Election not open for voting");
        require(_voiceCredits.length > 0, "Voice credits are required");
        require(_beneficiaries.length > 0, "Beneficiaries are required");

        uint256 _usedVoiceCredits = 0;
        uint256 _stakedVoiceCredits = staking.getVoiceCredits(msg.sender);

        require(_stakedVoiceCredits > 0, "must have voice credits from staking");

        for (uint8 i = 0; i < _beneficiaries.length; i++) {

            require(_isRegisteredBeneficiary(_beneficiaries[i], _electionTerm), "ineligible beneficiary");

            _usedVoiceCredits = _usedVoiceCredits.add(_voiceCredits[i]);
            uint256 _sqredVoiceCredits = sqrt(_voiceCredits[i]);

            Vote memory _vote = Vote({
               voter: msg.sender,
               beneficiary: _beneficiaries[i],
               weight: _sqredVoiceCredits
            });

            elections[_electionTerm].votes.push(_vote);
            beneficiaryVotes[_electionTerm][_beneficiaries[i]] = beneficiaryVotes[_electionTerm][_beneficiaries[i]].add(_sqredVoiceCredits);
        }
        require(_usedVoiceCredits <= _stakedVoiceCredits, "Insufficient voice credits");
    }

    function _recalculateRanking(ElectionTerm _electionTerm, address _beneficiary, uint256 weight) internal {
        if (weight > beneficiaryVotes[_electionTerm][electionRanking[_electionTerm][electionConfigurations[_electionTerm].ranking - 1]]) {
            // If weight is bigger than the last in the ranking for the election term, take its position
            electionRanking[_electionTerm][electionConfigurations[_electionTerm].ranking - 1] = _beneficiary;
        } else {
            // Otherwise, no need to recalculate ranking
            return;
        }

        // traverse inverted ranking
        for (uint8 i = electionConfigurations[_electionTerm].ranking; i > 0; i--) {
            // if the votes are higher than the next one in the ranking, swap them
            if (beneficiaryVotes[_electionTerm][electionRanking[_electionTerm][i]] > beneficiaryVotes[_electionTerm][electionRanking[_electionTerm][i]] + 1) {
                (electionRanking[_electionTerm][i], electionRanking[_electionTerm][i+1]) = (electionRanking[_electionTerm][i+1], electionRanking[_electionTerm][i]);
            }
        }
    }

    function sqrt(uint y) internal pure returns (uint z) {
        if (y > 3) {
            z = y;
            uint x = y / 2 + 1;
            while (x < z) {
                z = x;
                x = (y / x + x) / 2;
            }
        } else if (y != 0) {
            z = 1;
        }
    }
}