const { expect } = require("chai");
const { parseEther } = require("ethers/lib/utils");
const {
  GrantElectionAdapter,
} = require("../scripts/helpers/GrantElectionAdapter");

let owner, nonOwner, beneficiary, governance;
const GRANT_TERM = { MONTH: 0, QUARTER: 1, YEAR: 2 };
const ElectionState = { Registration: 0, Voting: 1, Closed: 2 };
const registrationBondMonth = parseEther('50');

describe("GrantElections", function () {
  before(async function () {
    [
      owner,
      nonOwner,
      beneficiary,
      beneficiary2,
      beneficiary3,
      beneficiary4,
      beneficiary5,
      governance,
    ] = await ethers.getSigners();

    MockERC20 = await ethers.getContractFactory("MockERC20");
    this.mockPop = await MockERC20.deploy("TestPOP", "TPOP");
    await this.mockPop.mint(owner.address, parseEther("50"));
    await this.mockPop.mint(beneficiary.address, parseEther("50"));
    await this.mockPop.mint(beneficiary2.address, parseEther("50"));
    await this.mockPop.mint(beneficiary3.address, parseEther("50"));
    await this.mockPop.mint(beneficiary4.address, parseEther("50"));
    await this.mockPop.mint(beneficiary5.address, parseEther("50"));

    const Staking = await ethers.getContractFactory("Staking");
    this.mockStaking = await waffle.deployMockContract(owner, Staking.interface.format());

    const BeneficiaryRegistry = await ethers.getContractFactory("BeneficiaryRegistry");
    this.mockBeneficiaryRegistry = await waffle.deployMockContract(owner, BeneficiaryRegistry.interface.format());

    const GrantElections = await ethers.getContractFactory('GrantElections');
    this.contract = await GrantElections.deploy(
        this.mockStaking.address,
        this.mockBeneficiaryRegistry.address,
        this.mockPop.address,
        governance.address,
       );
    await this.contract.initialize(GRANT_TERM.MONTH);
  });

  describe("defaults", function () {
    it("should set correct monthly defaults", async function () {
      const monthly = await GrantElectionAdapter(
        this.contract
      ).electionDefaults(GRANT_TERM.MONTH);
      expect(monthly).to.deep.equal({
        useChainLinkVRF: true,
        ranking: 3,
        awardees: 1,
        registrationPeriod: 7 * 86400,
        votingPeriod: 7 * 86400,
        cooldownPeriod: 21 * 86400,
      });
    });

    it("should set correct quarterly defaults", async function () {
      const quarterly = await GrantElectionAdapter(
        this.contract
      ).electionDefaults(GRANT_TERM.QUARTER);
      expect(quarterly).to.deep.equal({
        useChainLinkVRF: true,
        ranking: 5,
        awardees: 2,
        registrationPeriod: 14 * 86400,
        votingPeriod: 14 * 86400,
        cooldownPeriod: 83 * 86400,
      });
    });
    it("should set correct yearly defaults", async function () {
      const yearly = await GrantElectionAdapter(this.contract).electionDefaults(
        GRANT_TERM.YEAR
      );
      expect(yearly).to.deep.equal({
        useChainLinkVRF: true,
        ranking: 7,
        awardees: 3,
        registrationPeriod: 30 * 86400,
        votingPeriod: 30 * 86400,
        cooldownPeriod: 358 * 86400,
      });
    });
  });


  describe("initialization", function () {
    it("should successfully initialize an election if one hasn't already been created", async function () {
      await ethers.provider.send("evm_setNextBlockTimestamp", [1625097600]);
      await ethers.provider.send("evm_mine");

      await expect(this.contract.initialize(GRANT_TERM.QUARTER))
        .to.emit(this.contract, "ElectionInitialized")
        .withArgs(GRANT_TERM.QUARTER, 1625097601);
    });

    it("should set correct election metadata", async function () {
      const metadata = await GrantElectionAdapter(
        this.contract
      ).getElectionMetadata(GRANT_TERM.QUARTER);

      expect(metadata).to.deep.equal({
        votes: [],
        electionTerm: GRANT_TERM.QUARTER,
        registeredBeneficiaries: [],
        electionState: ElectionState.Registration,
        configuration: {
          awardees: 2,
          ranking: 5,
        },
        useChainlinkVRF: true,
        periods: {
          cooldownPeriod: 83 * 86400, // 83 days
          registrationPeriod: 14 * 86400, // 14 days
          votingPeriod: 14 * 86400, // 14 days
        },
        startTime: 1625097601,
      });
    });

    it("should prevent an election from initializing if it isn't closed", async function () {
      await expect(
        this.contract.initialize(GRANT_TERM.QUARTER)
      ).to.be.revertedWith("election not yet closed");
    });
  });

  describe("voting", function () {
    beforeEach(async function () {
      const Staking = await ethers.getContractFactory("Staking");
      this.mockStaking = await waffle.deployMockContract(owner, Staking.interface.format());

      const BeneficiaryRegistry = await ethers.getContractFactory("BeneficiaryRegistry");
      this.mockBeneficiaryRegistry = await waffle.deployMockContract(owner, BeneficiaryRegistry.interface.format());

      MockERC20 = await ethers.getContractFactory("MockERC20");
      this.mockPop = await MockERC20.deploy("TestPOP", "TPOP");
      await this.mockPop.mint(beneficiary.address, parseEther("50"));

      const GrantElections = await ethers.getContractFactory('GrantElections');
      this.contract = await GrantElections.deploy(
          this.mockStaking.address,
          this.mockBeneficiaryRegistry.address,
          this.mockPop.address,
          governance.address,
         );
      await this.contract.deployed();
    });

    it("should require voice credits", async function () {
      await expect(this.contract.vote([], [], GRANT_TERM.MONTH)).to.be.revertedWith(
        "Voice credits are required"
      );
    });

    it("should require beneficiaries", async function () {
      await expect(this.contract.vote([], [1], GRANT_TERM.MONTH)).to.be.revertedWith(
        "Beneficiaries are required"
      );
    });

    it("should require election open for voting", async function () {
      await this.contract.initialize(GRANT_TERM.MONTH);
      await expect(
        this.contract.vote([beneficiary.address], [1], GRANT_TERM.MONTH)
      ).to.be.revertedWith("Election not open for voting");
    });

    it("should require staked voice credits", async function () {
      await this.contract.initialize(GRANT_TERM.MONTH);
      ethers.provider.send("evm_increaseTime", [7 * 86400]);
      ethers.provider.send("evm_mine");
      await this.mockStaking.mock.getVoiceCredits.returns(0);
      await expect(
        this.contract.vote([beneficiary.address], [1], GRANT_TERM.MONTH)
      ).to.be.revertedWith("must have voice credits from staking");
    });

    it("should require eligible beneficiary", async function () {
      await this.contract.initialize(GRANT_TERM.MONTH);
      ethers.provider.send("evm_increaseTime", [7 * 86400]);
      ethers.provider.send("evm_mine");
      await this.mockStaking.mock.getVoiceCredits.returns(10);
      await expect(
        this.contract.vote([beneficiary.address], [1], GRANT_TERM.MONTH)
      ).to.be.revertedWith("ineligible beneficiary");
    });

    it("should vote successfully", async function () {
      await this.contract.initialize(GRANT_TERM.MONTH);
      ethers.provider.send("evm_increaseTime", [7 * 86400]);
      ethers.provider.send("evm_mine");

      await this.mockPop.connect(beneficiary).approve(this.contract.address, registrationBondMonth);
      await this.mockStaking.mock.getVoiceCredits.returns(10);
      await this.mockBeneficiaryRegistry.mock.beneficiaryExists.returns(true);
      await this.contract.connect(beneficiary).registerForElection(beneficiary.address, GRANT_TERM.MONTH);
      await this.contract.vote([beneficiary.address], [5], GRANT_TERM.MONTH);
      const metadata = await GrantElectionAdapter(
        this.contract
      ).getElectionMetadata(GRANT_TERM.MONTH);
      expect(metadata["votes"]).deep.to.eq([
        {
          voter: owner.address,
          beneficiary: beneficiary.address,
          weight: Math.round(Math.sqrt(5)),
        }
      ]);
    });
  });

  describe("getCurrentRanking", function () {
    beforeEach(async function () {
      const Staking = await ethers.getContractFactory("Staking");
      this.mockStaking = await waffle.deployMockContract(owner, Staking.interface.format());

      const BeneficiaryRegistry = await ethers.getContractFactory("BeneficiaryRegistry");
      this.mockBeneficiaryRegistry = await waffle.deployMockContract(owner, BeneficiaryRegistry.interface.format());

      const GrantElections = await ethers.getContractFactory('GrantElections');
      this.contract = await GrantElections.deploy(
        this.mockStaking.address,
        this.mockBeneficiaryRegistry.address,
        this.mockPop.address,
        governance.address,
      );
      await this.contract.deployed();
    });

    it("return current ranking", async function () {
      await this.contract.initialize(GRANT_TERM.MONTH);
      ethers.provider.send("evm_increaseTime", [7 * 86400]);
      ethers.provider.send("evm_mine");
      await this.mockBeneficiaryRegistry.mock.beneficiaryExists.returns(true);
      await this.mockPop.connect(beneficiary).approve(this.contract.address, registrationBondMonth);
      await this.contract.connect(beneficiary).registerForElection(beneficiary.address, GRANT_TERM.MONTH);
      await this.mockPop.connect(beneficiary2).approve(this.contract.address, registrationBondMonth);
      await this.contract.connect(beneficiary2).registerForElection(beneficiary2.address, GRANT_TERM.MONTH);
      await this.mockPop.connect(beneficiary3).approve(this.contract.address, registrationBondMonth);
      await this.contract.connect(beneficiary3).registerForElection(beneficiary3.address, GRANT_TERM.MONTH);
      await this.mockPop.connect(beneficiary4).approve(this.contract.address, registrationBondMonth);
      await this.contract.connect(beneficiary4).registerForElection(beneficiary4.address, GRANT_TERM.MONTH);
      await this.mockPop.connect(beneficiary5).approve(this.contract.address, registrationBondMonth);
      await this.contract.connect(beneficiary5).registerForElection(beneficiary5.address, GRANT_TERM.MONTH);
      await this.mockStaking.mock.getVoiceCredits.returns(1000);
      await this.contract.vote([beneficiary.address], [50], GRANT_TERM.MONTH);
      expect(await this.contract.getCurrentRanking(GRANT_TERM.MONTH)).deep.to.eq(
        [
          beneficiary.address,
          '0x0000000000000000000000000000000000000000',
          '0x0000000000000000000000000000000000000000',
        ]
      );
      await this.contract.vote([beneficiary2.address], [100], GRANT_TERM.MONTH);
      expect(await this.contract.getCurrentRanking(GRANT_TERM.MONTH)).deep.to.eq(
        [
          beneficiary2.address,
          beneficiary.address,
          '0x0000000000000000000000000000000000000000',
        ]
      );
      await this.contract.vote([beneficiary3.address], [70], GRANT_TERM.MONTH);
      expect(await this.contract.getCurrentRanking(GRANT_TERM.MONTH)).deep.to.eq(
        [
          beneficiary2.address,
          beneficiary3.address,
          beneficiary.address,
        ]
      );
      await this.contract.vote([beneficiary4.address], [100], GRANT_TERM.MONTH);
      expect(await this.contract.getCurrentRanking(GRANT_TERM.MONTH)).deep.to.eq(
        [
          beneficiary2.address,
          beneficiary4.address,
          beneficiary3.address,
        ]
      );
      await this.contract.vote([beneficiary5.address], [10], GRANT_TERM.MONTH);
      expect(await this.contract.getCurrentRanking(GRANT_TERM.MONTH)).deep.to.eq(
        [
          beneficiary2.address,
          beneficiary4.address,
          beneficiary3.address,
        ]
      );
    });
  });
});
