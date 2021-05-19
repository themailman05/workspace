const { expect } = require('chai');
const { parseEther } = require("ethers/lib/utils");
let owner, nonOwner;
let proposer1,proposer2,proposer3,beneficiary;
let bn_contract;

const ProposalType = { BNP: 0, BTP: 1};
const Vote = { Yes: 0, No: 1};
const ProposalStatus= {New:0, ChallengePeriod:1, Ended:2, Passed:3, Failed:4};
const ONE_DAY = 86400;
const ipfsHahContent='Qmd3cB3amDwdqqmEbmpbiUHyUgaxad9MrvfPy5WN78V24y';

function convertStringToBytes(str) {
  var bytes = []; // char codes
  var bytesv2 = []; // char codes
  for (var i = 0; i < str.length; ++i) {
    var code = str.charCodeAt(i);
    
    bytes = bytes.concat([code]);
    
    bytesv2 = bytesv2.concat([code & 0xff, code / 256 >>> 0]);
  }
  return bytes;
}
function hex2a(hexx) {
  var hex = hexx.toString();//force conversion
  if (hex.substring(0,2)=="0x")
  hex=hex.substring(2,hex.length);
  var str = '';
  for (var i = 0; (i < hex.length && hex.substr(i, 2) !== '00'); i += 2)
      str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
  return str;
}
describe('BeneficiaryNomination', function () {

  const PROPOSALID = 0;
  before(async function () {
    [
      owner,
      nonOwner,
      proposer1,
      proposer2,
      proposer3,
      beneficiary,
      voter1,
      voter2,
    ] = await ethers.getSigners();

    MockERC20 = await ethers.getContractFactory("MockERC20");
    this.mockPop = await MockERC20.deploy("TestPOP", "TPOP");
    await this.mockPop.mint(owner.address, parseEther("50"));
    await this.mockPop.mint(beneficiary.address, parseEther("50"));
    await this.mockPop.mint(proposer1.address, parseEther("1500"));
    await this.mockPop.mint(proposer2.address, parseEther("3000"));
    await this.mockPop.mint(proposer3.address, parseEther("3000"));
    const Staking = await ethers.getContractFactory("Staking");
    this.mockStaking = await waffle.deployMockContract(owner, Staking.interface.format());

    const BeneficiaryRegistry = await ethers.getContractFactory("BeneficiaryRegistry");
    this.mockBeneficiaryRegistry = await waffle.deployMockContract(owner, BeneficiaryRegistry.interface.format());
    const BeneficiaryNomination = await ethers.getContractFactory('BeneficiaryNomination');
    bn_contract = await BeneficiaryNomination.deploy(
        this.mockStaking.address,
        this.mockBeneficiaryRegistry.address,
        this.mockPop.address
       );
       await bn_contract.deployed();
  });
  describe("defaults", function () {

    it("should set correct proposal defaults", async function() {
  
    const defConfig = await bn_contract.DefaultConfigurations();

      expect(defConfig.votingPeriod).to.equal(2*ONE_DAY);
      expect(defConfig.vetoPeriod).to.equal(2*ONE_DAY);
      expect(defConfig.proposalBond).to.equal(parseEther('2000'))
    });
    it("should set configuration for proposals", async function() {
    await bn_contract.connect(owner).setConfiguration(10*ONE_DAY,10*ONE_DAY,parseEther('3000'));
     const defConfig = await bn_contract.DefaultConfigurations();
     
       expect(defConfig.votingPeriod).to.equal(10*ONE_DAY);
       expect(defConfig.vetoPeriod).to.equal(10*ONE_DAY);
       expect(defConfig.proposalBond).to.equal(parseEther('3000'))
     });
  
  });

  describe("proposals", function () {

    it("should create BNP proposal with specified attributes", async function() {
      await this.mockBeneficiaryRegistry.mock.beneficiaryExists.returns(false);
      var contentbytes=convertStringToBytes(ipfsHahContent);
   
      await this.mockPop .connect(proposer2).approve(bn_contract.address, parseEther('3000'));
      await bn_contract.connect(proposer2).createProposal(beneficiary.address,contentbytes,ProposalType.BNP);
      const proposal=await bn_contract.proposals(PROPOSALID);
      
      expect(proposal.beneficiary).to.equal(beneficiary.address);
      expect(hex2a(proposal.applicationCid)).to.equal(ipfsHahContent);
      expect(proposal.proposer).to.equal(proposer2.address);
      expect(proposal._proposalType).to.equal(ProposalType.BNP);
      expect(proposal.voteCount).to.equal(0);
      expect(proposal.status).to.equal(ProposalStatus.New);
      expect(await bn_contract.getNumberOfProposals()).to.equal(1);
    });
    it("should prevent to create proposal with not enough bond", async function () {
      var contentbytes=convertStringToBytes(ipfsHahContent);
      await this.mockPop.connect(proposer1).approve(bn_contract.address, parseEther('1500'));
      await expect(
        bn_contract.connect(proposer1).createProposal(beneficiary.address,contentbytes,ProposalType.BNP)
  
      ).to.be.revertedWith( "!enough bond");
    });
    it("should prevent to create a BNP proposal for an existing beneficiary", async function () {
      await this.mockBeneficiaryRegistry.mock.beneficiaryExists.returns(true);
      var contentbytes=convertStringToBytes(ipfsHahContent);
      await this.mockPop.connect(proposer3).approve(bn_contract.address, parseEther('3000'));
      await expect(
        bn_contract.connect(proposer3).createProposal(beneficiary.address,contentbytes,ProposalType.BNP)
  
      ).to.be.revertedWith( "Beneficiary already exists!");
    });
  });
  describe("voting", function () {
    before(async function () {
      const Staking = await ethers.getContractFactory("Staking");
      this.mockStaking = await waffle.deployMockContract(
        owner,
        Staking.interface.format()
      );

      const BeneficiaryRegistry = await ethers.getContractFactory(
        "BeneficiaryRegistry"
      );
      this.mockBeneficiaryRegistry = await waffle.deployMockContract(
        owner,
        BeneficiaryRegistry.interface.format()
      );

      MockERC20 = await ethers.getContractFactory("MockERC20");
      this.mockPop = await MockERC20.deploy("TestPOP", "TPOP");
      await this.mockPop.mint(beneficiary.address, parseEther("50"));
      await this.mockPop.mint(proposer1.address, parseEther("2500"));
      await this.mockPop.mint(voter1.address, parseEther("50"));
      const BeneficiaryNomination = await ethers.getContractFactory("BeneficiaryNomination");
      bn_contract = await BeneficiaryNomination.deploy(
        this.mockStaking.address,
        this.mockBeneficiaryRegistry.address,
        this.mockPop.address
      );
      await bn_contract.deployed();
      // create a BNP proposal
      var contentbytes=convertStringToBytes(ipfsHahContent);
      await this.mockBeneficiaryRegistry.mock.beneficiaryExists.returns(false);
      await this.mockPop.connect(proposer1).approve(bn_contract.address, parseEther('2500'));
      await bn_contract.connect(proposer1).createProposal(beneficiary.address,contentbytes,ProposalType.BNP);
    });
    it("should prevent to vote without voice credits", async function() {
      await this.mockStaking.mock.getVoiceCredits.returns(0);
      await expect(bn_contract.connect(voter1).vote(PROPOSALID,Vote.Yes)).to.be.revertedWith( "must have voice credits from staking");
    });
    it("should vote yes to a newly created proposal", async function() {
      const voiceCredits=100;
      
      await this.mockStaking.mock.getVoiceCredits.returns(voiceCredits);
      
      await bn_contract.connect(voter1).vote(PROPOSALID,Vote.Yes);
      const proposal=await bn_contract.proposals(PROPOSALID);

      expect(proposal.noCount).to.equal(0);
      expect(proposal.voteCount).to.equal(1);
      expect(proposal.yesCount).to.equal(voiceCredits);
      expect(await bn_contract.isVoted(PROPOSALID,voter1.address)).to.equal(true);

    });
    
  });
});



