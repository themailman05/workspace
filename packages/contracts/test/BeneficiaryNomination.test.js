const { expect } = require('chai');
const { parseEther } = require("ethers/lib/utils");
let owner, nonOwner, governance;
let bn_contract;

const ProposalType = { BNP: 0, BTP: 1};
const ONE_DAY = 86400;

describe('BeneficiaryNomination', function () {

  before(async function () {
    [
      owner,
      nonOwner,
      voter1,
      voter2,
      governance,
    ] = await ethers.getSigners();

    MockERC20 = await ethers.getContractFactory("MockERC20");
    this.mockPop = await MockERC20.deploy("TestPOP", "TPOP");
    await this.mockPop.mint(owner.address, parseEther("50"));
 
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

      console.log(defConfig.proposalBond);
      expect(defConfig.votingPeriod).to.equal(2*ONE_DAY);
      expect(defConfig.vetoPeriod).to.equal(2*ONE_DAY);
      expect(defConfig.proposalBond).to.equal(parseEther('2000'))
    });
    it("should set configuration for proposals", async function() {
    await bn_contract.connect(governance).setConfiguration(10,10,3000);
     const defConfig = await bn_contract.DefaultConfigurations();
     
       expect(defConfig.votingPeriod).to.equal(10);
       expect(defConfig.vetoPeriod).to.equal(10);
       expect(defConfig.proposalBond).to.equal(3000)
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

});

