const { expect } = require('chai');
const { parseEther } = require("ethers/lib/utils");
let owner, nonOwner, governance;
let proposer1,proposer2,beneficiary;
let bn_contract;

const ProposalType = { BNP: 0, BTP: 1};
const ONE_DAY = 86400;
const ipfsHahContent='Qmd3cB3amDwdqqmEbmpbiUHyUgaxad9MrvfPy5WN78V24y';
function parseHexString(str) { 
  var result = [];
  while (str.length >= 2) { 
      result.push(parseInt(str.substring(0, 2), 16));
      str = str.substring(2, str.length);
  }

  return result;
}
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

  before(async function () {
    [
      owner,
      nonOwner,
      proposer1,
      proposer2,
      beneficiary,
      voter1,
      voter2,
      governance,
    ] = await ethers.getSigners();

    MockERC20 = await ethers.getContractFactory("MockERC20");
    this.mockPop = await MockERC20.deploy("TestPOP", "TPOP");
    await this.mockPop.mint(owner.address, parseEther("50"));
    await this.mockPop.mint(beneficiary.address, parseEther("50"));
    await this.mockPop.mint(proposer1.address, parseEther("1500"));
    await this.mockPop.mint(proposer2.address, parseEther("3000"));

    const Staking = await ethers.getContractFactory("Staking");
    this.mockStaking = await waffle.deployMockContract(owner, Staking.interface.format());

    const BeneficiaryRegistry = await ethers.getContractFactory("BeneficiaryRegistry");
    this.mockBeneficiaryRegistry = await waffle.deployMockContract(owner, BeneficiaryRegistry.interface.format());
    const BeneficiaryNomination = await ethers.getContractFactory('BeneficiaryNomination');
    bn_contract = await BeneficiaryNomination.deploy(
        this.mockStaking.address,
        this.mockBeneficiaryRegistry.address,
        this.mockPop.address,
        governance.address,
       );
  });
  describe("defaults", function () {

    it("should set correct proposal defaults", async function() {
  
    const defConfig = await bn_contract.DefaultConfigurations();

      expect(defConfig.votingPeriod).to.equal(2*ONE_DAY);
      expect(defConfig.vetoPeriod).to.equal(2*ONE_DAY);
      expect(defConfig.proposalBond).to.equal(parseEther('2000'))
    });
    it("should set configuration for proposals", async function() {
    await bn_contract.connect(governance).setConfiguration(10*ONE_DAY,10*ONE_DAY,parseEther('3000'));
     const defConfig = await bn_contract.DefaultConfigurations();
     
       expect(defConfig.votingPeriod).to.equal(10*ONE_DAY);
       expect(defConfig.vetoPeriod).to.equal(10*ONE_DAY);
       expect(defConfig.proposalBond).to.equal(parseEther('3000'))
     });
  
  });

  describe("setters", function () {
    it("should prevent non-governance address from updating governance address", async function () {
      await expect(
        bn_contract.setGovernance(nonOwner.address)
      ).to.be.revertedWith("!governance");
    });

    it("should allow governance to set new governance address", async function () {
      await bn_contract.connect(governance).setGovernance(nonOwner.address);
      expect(await bn_contract.governance()).to.equal(nonOwner.address);

      await bn_contract.connect(nonOwner).setGovernance(governance.address);
      expect(await bn_contract.governance()).to.equal(governance.address);
    });
  });

  describe("proposals", function () {

    it("should create proposal with specified attributes", async function() {
      var contentbytes=convertStringToBytes(ipfsHahContent);
   
      await this.mockPop .connect(proposer2).approve(bn_contract.address, parseEther('3000'));
      await bn_contract.connect(proposer2).createProposal(beneficiary.address,contentbytes,ProposalType.BNP);
      const proposal=await bn_contract.proposals(0);
      
      expect(proposal.beneficiary).to.equal(beneficiary.address);
      expect(hex2a(proposal.content)).to.equal(ipfsHahContent);
      expect(proposal.proposer).to.equal(proposer2.address);
      expect(proposal.bondRecipient).to.equal(proposer2.address);
      expect(proposal._proposalType).to.equal(ProposalType.BNP);
    });
    it("should prevent to create proposal with not enough bond", async function () {
      var contentbytes=convertStringToBytes(ipfsHahContent);
      await this.mockPop .connect(proposer1).approve(bn_contract.address, parseEther('1500'));
      await expect(
        bn_contract.connect(proposer1).createProposal(beneficiary.address,contentbytes,ProposalType.BNP)
  
      ).to.be.revertedWith( "!enough bond");
    });
  });

});



