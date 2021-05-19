// SPDX-License-Identifier: MIT

pragma solidity >=0.7.0 <0.8.0;

import "@openzeppelin/contracts/math/SafeMath.sol";
import "@openzeppelin/contracts/token/ERC20/SafeERC20.sol";
import "./Governed.sol";
import "./IStaking.sol";
import "./IBeneficiaryRegistry.sol";

/** 
 @notice This contract is for submitting beneficiary nomination proposals and beneficiary takedown proposals
*/
contract BeneficiaryNomination is Governed {
  using SafeMath for uint256;
  using SafeERC20 for IERC20;

  IERC20 public immutable POP;
  IStaking staking;
  IBeneficiaryRegistry beneficiaryRegistry;

  /**
   * BNP for Beneficiary Nomination Proposal
   * BTP for Beneficiary Takedown Proposal
   */
  enum ProposalType {BNP, BTP}
  uint256 constant ONE_DAY = 86400; // seconds in 1 day

  enum ProposalStatus {New, ChallengePeriod, Ended, Passed, Failed} // status of the proposal
  enum VoteOption {Yes, No}
  struct Proposal {
    ProposalStatus status;
    address beneficiary;
    mapping(address => bool) voters;
    bytes applicationCid;
    address proposer;
    uint256 startTime;
    uint256 yesCount;
    uint256 noCount;
    uint256 voteCount;
    uint256 bondBalance;
    ProposalType _proposalType;
  }
  Proposal[] public proposals;

  struct ConfigurationOptions {
    uint256 votingPeriod;
    uint256 vetoPeriod;
    uint256 proposalBond;
  }
  ConfigurationOptions public DefaultConfigurations;
  //modifiers
  modifier onlyProposer(uint256 proposalId) {
    require(msg.sender == proposals[proposalId].proposer, "!proposer");
    _;
  }
  modifier validAddress(address _address) {
    require(_address == address(_address), "invalid address");
    _;
  }
  modifier enoughBond(address _address) {
    require(
      POP.balanceOf(_address) >= DefaultConfigurations.proposalBond,
      "!enough bond"
    );
    _;
  }
  event ProposalCreated(
    uint256 indexed proposalId,
    address indexed proposer,
    address indexed beneficiary,
    bytes content
  );
  event Vote(
    uint256 indexed proposalId,
    address indexed voter,
    uint256 indexed weight
  );
  event Finalize(uint256 indexed proposalId);

  //constructor
  constructor(
    IStaking _staking,
    IBeneficiaryRegistry _beneficiaryRegistry,
    IERC20 _pop
  ) Governed(msg.sender) {
    staking = _staking;
    beneficiaryRegistry = _beneficiaryRegistry;
    POP = _pop;
    _setDefaults();
  }

  function _setDefaults() internal {
    DefaultConfigurations.votingPeriod = 2 * ONE_DAY;
    DefaultConfigurations.vetoPeriod = 2 * ONE_DAY;
    DefaultConfigurations.proposalBond = 2000e18;
  }

  function setConfiguration(
    uint256 _votingPeriod,
    uint256 _vetoPeriod,
    uint256 _proposalBond
  ) public onlyGovernance {
    DefaultConfigurations.votingPeriod = _votingPeriod;
    DefaultConfigurations.vetoPeriod = _vetoPeriod;
    DefaultConfigurations.proposalBond = _proposalBond;
  }

  /** 
  @notice creates a beneficiary nomination proposal or a beneficiary takedown proposal
  @dev  used proposals.push() to create an empty proposal Objet and then assiging the values.
  because of an issue in solc that you can not create a memory object from a struct with nested mappings
  @param  _beneficiary address of the beneficiary
  @param  _applicationCid IPFS content hash
  @return proposal id
  */
  function createProposal(
    address _beneficiary,
    bytes memory _applicationCid,
    ProposalType _type
  )
    external
    payable
    validAddress(_beneficiary)
    enoughBond(msg.sender)
    returns (uint256)
  {
    if (_type == ProposalType.BTP) {
      //takedown proposal
      require(
        beneficiaryRegistry.beneficiaryExists(_beneficiary),
        "Beneficiary doesnt exist!"
      );
    } else {
      //nomination proposal
      require(
        !beneficiaryRegistry.beneficiaryExists(_beneficiary),
        "Beneficiary already exists!"
      );
    }
    POP.safeTransferFrom(
      msg.sender,
      address(this),
      DefaultConfigurations.proposalBond
    );
    uint256 proposalId = proposals.length;

    // Create a new proposal
    proposals.push();
    Proposal storage proposal = proposals[proposalId];
    proposal.beneficiary = _beneficiary;
    proposal.applicationCid = _applicationCid;
    proposal.proposer = msg.sender;
    proposal.startTime = block.timestamp;
    proposal._proposalType = _type;
    proposal.bondBalance = DefaultConfigurations.proposalBond;

    emit ProposalCreated(proposalId, msg.sender, _beneficiary, _applicationCid);

    return proposalId;
  }

  /** 
  @notice votes to a specific proposal during the initial voting process
  @param  proposalId id of the proposal which you are going to vote 
  */
  function vote(uint256 proposalId, VoteOption _vote) external {
    _refreshState(proposalId);
    Proposal storage proposal = proposals[proposalId];
    if (_vote == VoteOption.Yes) {
      require(
        proposal.status == ProposalStatus.New,
        "Initial voting period has already finished!"
      );
    }

    require(
      proposal.status == ProposalStatus.New ||
        proposal.status == ProposalStatus.ChallengePeriod,
      "Proposal is no longer in voting period"
    );
    require(
      !proposal.voters[msg.sender],
      "address already voted for the proposal"
    );

    uint256 _voiceCredits = staking.getVoiceCredits(msg.sender);

    require(_voiceCredits > 0, "must have voice credits from staking");

    proposal.voters[msg.sender] = true;
    proposal.voteCount = proposal.voteCount.add(1);
    if (_vote == VoteOption.Yes) {
      proposal.yesCount = proposal.yesCount.add(_voiceCredits);
    } else if (_vote == VoteOption.No) {
      proposal.noCount = proposal.noCount.add(_voiceCredits);
    }
    emit Vote(proposalId, msg.sender, _voiceCredits);
    // Finalize the vote if no votes outnumber yes votes and open voting has ended
    if (
      proposal.status == ProposalStatus.ChallengePeriod &&
      proposal.noCount >= proposal.yesCount
    ) {
      proposal.status = ProposalStatus.Failed;
      emit Finalize(proposalId);
    }
  }

  /** 
  @notice gets the voice credits of an address using the staking contract
  @param  _address address of the voter
  @return _voiceCredits
  */
  function getVoiceCredits(address _address)
    internal
    view
    returns (uint256 _voiceCredits)
  {
    _voiceCredits = staking.getVoiceCredits(_address);

    require(_voiceCredits > 0, "must have voice credits from staking");
    return _voiceCredits;
  }

  /** 
  @notice finalizes the voting process
  @param  proposalId id of the proposal
  */
  function finalize(uint256 proposalId) public onlyGovernance {
    _refreshState(proposalId);
    Proposal storage proposal = proposals[proposalId];
    require(
      proposal.status == ProposalStatus.ChallengePeriod ||
        proposal.status == ProposalStatus.New,
      "Proposal is already finalized"
    );

    if (proposal.yesCount > proposal.noCount) {
      require(
        proposal.status == ProposalStatus.Ended,
        "Veto period has not over yet!"
      );

      proposal.status = ProposalStatus.Passed;
      if (proposal._proposalType == ProposalType.BNP) {
        //nomination proposal
        //register beneficiary using the BeneficiaryRegisty contract
        beneficiaryRegistry.addBeneficiary(
          proposal.beneficiary,
          proposal.applicationCid
        );
      } else {
        //BTP
        //remove beneficiary using BeneficiaryRegistry contract
        beneficiaryRegistry.revokeBeneficiary(proposal.beneficiary);
      }
      // proposers could claim their fund using claimBond function
    } else {
      require(
        proposal.status != ProposalStatus.New,
        "Proposal cannot be finalized until end of initial voting period"
      );

      proposal.status = ProposalStatus.Failed;
      //If the proposal fail, the bond should be kept in the contract.
      emit Finalize(proposalId);
    }
  }

  /** 
  @notice claims bond after a successful proposal voting
  @param  proposalId id of the proposal
  */
  function claimBond(uint256 proposalId) public onlyProposer(proposalId) {
    require(
      proposals[proposalId].status == ProposalStatus.Passed,
      "Proposal failed or is processing!"
    );
    POP.safeTransferFrom(
      address(this),
      msg.sender,
      proposals[proposalId].bondBalance
    );
  }

  /**
@notice returns number of proposals that have been created
@param  proposalId id of the proposal
 */
  function _refreshState(uint256 proposalId) internal {
    Proposal storage proposal = proposals[proposalId];
    if (
      proposal.status == ProposalStatus.Failed ||
      proposal.status == ProposalStatus.Passed
    ) return;

    uint256 _time = block.timestamp;
    uint256 VOTINGPERIOD = DefaultConfigurations.votingPeriod;
    uint256 VETOPERID = DefaultConfigurations.vetoPeriod;
    uint256 totalVotingPeriod = VOTINGPERIOD + VETOPERID;

    if (_time < proposal.startTime.add(VOTINGPERIOD)) {
      proposal.status = ProposalStatus.New;
    } else {
      if (_time < proposal.startTime.add(totalVotingPeriod)) {
        proposal.status = ProposalStatus.ChallengePeriod;
      } else {
        proposal.status = ProposalStatus.Ended;
      }
    }
  }

  /**
@notice returns number of proposals that have been created
 */
  function getNumberOfProposals() external view returns (uint256) {
    return proposals.length;
  }

  /** 
  @notice gets number of votes
  @param  proposalId id of the proposal
  @return number of votes to a proposal
  */
  function getNumberOfVotes(uint256 proposalId)
    external
    view
    returns (uint256)
  {
    return proposals[proposalId].voteCount;
  }

  /** 
  @notice checks if someone has voted to a specific proposal or not
  @param  proposalId id of the proposal
  @param  voter IPFS content hash
  @return true or false
  */
  function isVoted(uint256 proposalId, address voter)
    external
    view
    returns (bool)
  {
    return proposals[proposalId].voters[voter];
  }
}
