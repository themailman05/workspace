pragma solidity >=0.7.0 <0.8.0;

import "@openzeppelin/contracts/math/SafeMath.sol";
import "./IStaking.sol";

contract GrantElections {
    using SafeMath for uint256;

    struct Vote {
        address voter;
        address beneficiary;
        uint256 weight;
    }

    enum ElectionTerm {Monthly, Quarterly, Yearly}
    enum ElectionState {Registration, Voting, Closed}

    struct Election {
        Vote[] votes;
        ElectionTerm electionTerm;
        ElectionState electionState;
        ElectionConfiguration electionConfiguration;
    }

    struct ElectionConfiguration {
        uint8 ranking;
        uint8 awardees;
    }

    // mapping of election terms and beneficiary total votes
    mapping(ElectionTerm => mapping(address => uint256)) beneficiaryVotes;
    mapping(ElectionTerm => Election) elections;
    mapping(ElectionTerm => ElectionConfiguration) electionConfigurations;
    mapping(ElectionTerm => mapping(uint8 => address)) electionRanking;

    IStaking staking;

    constructor(IStaking _staking) {
        staking = _staking;
    }

    function vote(address[] memory _beneficiaries, uint8[] memory _voiceCredits, ElectionTerm _electionTerm) public {
        require(elections[_electionTerm].electionState == ElectionState.Voting, "Election not open for voting");
        require(_voiceCredits.length > 0, "Voice credits are required");
        require(_beneficiaries.length > 0, "Beneficiaries are required");

        uint256 _usedVoiceCredits = 0;
        uint256 _stakedVoiceCredits = staking.getVoiceCredits(msg.sender);

        for (uint8 i = 0; i < _beneficiaries.length; i++) {
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
        require(_usedVoiceCredits <= _stakedVoiceCredits, "Insuficcient voice credits");
    }

    function _recalculateRanking(ElectionTerm _electionTerm, address _beneficiary, uint256 weight) internal {
        // ranking: 100, 50, 20
        // passing: 60
        // ranking: 100, 50, 60
        // ranking: 100, 60, 50
        for (uint8 i = electionConfigurations[_electionTerm].ranking; i >= 0; i--) {
            if (weight > beneficiaryVotes[_electionTerm][electionRanking[_electionTerm][i]]) {

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