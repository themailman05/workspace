const { expect } = require("chai");
const { parseEther } = require("ethers/lib/utils");
const {
  GrantElectionAdapter,
} = require("../scripts/helpers/GrantElectionAdapter");



let owner, nonOwner, beneficiary, governance;
const GRANT_TERM = { MONTH: 0, QUARTER: 1, YEAR: 2 };
const ONE_DAY = 86400;
const ElectionState = { Registration: 0, Voting: 1, Closed: 2 };
const registrationBondMonth = parseEther('50');
const registrationBondQuarter = parseEther('100');

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
      voter1,
      voter2,
      voter3,
      voter4,
      voter5,
      voter6,
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

    const GrantRegistry = await ethers.getContractFactory("GrantRegistry");
    this.mockGrantRegistry = await waffle.deployMockContract(owner, GrantRegistry.interface.format());

    const RandomNumberConsumer = await ethers.getContractFactory("RandomNumberConsumer");
    this.mockRandomNumberConsumer = await waffle.deployMockContract(owner, RandomNumberConsumer.interface.format());

    const GrantElections = await ethers.getContractFactory('GrantElections');
    this.contract = await GrantElections.deploy(
        this.mockStaking.address,
        this.mockBeneficiaryRegistry.address,
        this.mockGrantRegistry.address,
        this.mockRandomNumberConsumer.address,
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
        registrationBondRequired: true,
        registrationBond: parseEther('50'),
        useChainLinkVRF: true,
        ranking: 3,
        awardees: 1,
        registrationPeriod: 7 * ONE_DAY,
        votingPeriod: 7 * ONE_DAY,
        cooldownPeriod: 21 * ONE_DAY,
      });
    });

    it("should set correct quarterly defaults", async function () {
      const quarterly = await GrantElectionAdapter(
        this.contract
      ).electionDefaults(GRANT_TERM.QUARTER);
      expect(quarterly).to.deep.equal({
        registrationBondRequired: true,
        registrationBond: parseEther('100'),
        useChainLinkVRF: true,
        ranking: 5,
        awardees: 2,
        registrationPeriod: 14 * ONE_DAY,
        votingPeriod: 14 * ONE_DAY,
        cooldownPeriod: 83 * ONE_DAY,
      });
    });
    it("should set correct yearly defaults", async function () {
      const yearly = await GrantElectionAdapter(this.contract).electionDefaults(
        GRANT_TERM.YEAR
      );
      expect(yearly).to.deep.equal({
        registrationBondRequired: true,
        registrationBond: parseEther('1000'),
        useChainLinkVRF: true,
        ranking: 7,
        awardees: 3,
        registrationPeriod: 30 * ONE_DAY,
        votingPeriod: 30 * ONE_DAY,
        cooldownPeriod: 358 * ONE_DAY,
      });
    });

    it("should set configuration for grant elections", async function() {
      await this.contract.connect(governance).setConfiguration(GRANT_TERM.QUARTER, 10, 15, false, false, 0, 100, 100, 100);
      const quarter = await GrantElectionAdapter(this.contract).electionDefaults(
        GRANT_TERM.QUARTER
      );
      expect(quarter).to.deep.equal({
        useChainLinkVRF: false,
        ranking: 15,
        awardees: 10,
        registrationBond: parseEther('0'),
        registrationBondRequired: false,
        registrationPeriod: 100,
        votingPeriod: 100,
        cooldownPeriod: 100,
      });
    });
  });

  describe("setters", function () {
    it("should prevent non-governance address from updating governance address", async function () {
      await expect(
        this.contract.setGovernance(nonOwner.address)
      ).to.be.revertedWith("!governance");
    });

    it("should allow governance to set new governance address", async function () {
      await this.contract.connect(governance).setGovernance(nonOwner.address);
      expect(await this.contract.governance()).to.equal(nonOwner.address);

      await this.contract.connect(nonOwner).setGovernance(governance.address);
      expect(await this.contract.governance()).to.equal(governance.address);
    });
  });

  describe("registration", function () {
    beforeEach(async function () {
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

      const GrantElections = await ethers.getContractFactory("GrantElections");
      this.contract = await GrantElections.deploy(
        this.mockStaking.address,
        this.mockBeneficiaryRegistry.address,
        this.mockGrantRegistry.address,
        this.mockRandomNumberConsumer.address,
        this.mockPop.address,
        governance.address
      );
      await this.contract.deployed();
    });

    it("should allow beneficiary to register for election with no bond when bond disabled", async function () {
      await this.mockBeneficiaryRegistry.mock.beneficiaryExists.returns(true);
      await this.contract
        .connect(governance)
        .toggleRegistrationBondRequirement(GRANT_TERM.YEAR);
      await this.contract.initialize(GRANT_TERM.YEAR);
      await this.contract.registerForElection(
        beneficiary.address,
        GRANT_TERM.YEAR
      );
      const metadata = await GrantElectionAdapter(
        this.contract
      ).getElectionMetadata(GRANT_TERM.YEAR);
      expect(metadata).to.deep.contains({
        registeredBeneficiaries: [beneficiary.address],
      });
    });

    it("should prevent beneficiary to register for election without a bond", async function () {
      await this.mockBeneficiaryRegistry.mock.beneficiaryExists.returns(true);
      await this.contract.initialize(GRANT_TERM.YEAR);
      await expect(
        this.contract.registerForElection(beneficiary.address, GRANT_TERM.YEAR)
      ).to.be.revertedWith("insufficient registration bond balance");
    });

    it("should allow beneficiary to register for election with a bond", async function () {
      await this.mockBeneficiaryRegistry.mock.beneficiaryExists.returns(true);
      await this.contract.initialize(GRANT_TERM.YEAR);
      await this.mockPop.mint(beneficiary2.address, parseEther('1000'));
      await this.mockPop
        .connect(beneficiary2)
        .approve(this.contract.address, parseEther('1000'));

      await this.contract
        .connect(beneficiary2)
        .registerForElection(beneficiary2.address, GRANT_TERM.YEAR);

      const metadata = await GrantElectionAdapter(
        this.contract
      ).getElectionMetadata(GRANT_TERM.YEAR);

      expect(metadata).to.deep.contains({
        registeredBeneficiaries: [beneficiary2.address],
      });

      const bennies = await this.contract.getRegisteredBeneficiaries(GRANT_TERM.YEAR);
      expect(bennies).to.deep.equal([beneficiary2.address]);

    });

    it ('should transfer POP to election contract on registration', async function() {
      await this.mockBeneficiaryRegistry.mock.beneficiaryExists.returns(true);
      await this.contract.initialize(GRANT_TERM.YEAR);
      await this.mockPop.mint(beneficiary2.address, parseEther('1000'));
      await this.mockPop
        .connect(beneficiary2)
        .approve(this.contract.address, parseEther('1000'));

      await this.contract
        .connect(beneficiary2)
        .registerForElection(beneficiary2.address, GRANT_TERM.YEAR);

      const popBalanceForElection = await this.mockPop.balanceOf(this.contract.address);
      expect(popBalanceForElection).to.equal(parseEther('1000'));
    });
  });

  describe("initialization", function () {
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

      const GrantElections = await ethers.getContractFactory("GrantElections");
      this.contract = await GrantElections.deploy(
        this.mockStaking.address,
        this.mockBeneficiaryRegistry.address,
        this.mockGrantRegistry.address,
        this.mockRandomNumberConsumer.address,
        this.mockPop.address,
        governance.address
      );
      await this.contract.deployed();
    })
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
        registrationBond: parseEther("100"),
        registrationBondRequired: true,
        configuration: {
          awardees: 2,
          ranking: 5,
        },
        useChainlinkVRF: true,
        periods: {
          cooldownPeriod: 83 * ONE_DAY, // 83 days
          registrationPeriod: 14 * ONE_DAY, // 14 days
          votingPeriod: 14 * ONE_DAY, // 14 days
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

      const GrantElections = await ethers.getContractFactory("GrantElections");
      this.contract = await GrantElections.deploy(
        this.mockStaking.address,
        this.mockBeneficiaryRegistry.address,
        this.mockGrantRegistry.address,
        this.mockRandomNumberConsumer.address,
        this.mockPop.address,
        governance.address
      );
      await this.contract.deployed();
    });

    it("should require voice credits", async function () {
      await expect(
        this.contract.vote([], [], GRANT_TERM.MONTH)
      ).to.be.revertedWith("Voice credits are required");
    });

    it("should require beneficiaries", async function () {
      await expect(
        this.contract.vote([], [1], GRANT_TERM.MONTH)
      ).to.be.revertedWith("Beneficiaries are required");
    });

    it("should require election open for voting", async function () {
      await this.contract.initialize(GRANT_TERM.MONTH);
      await expect(
        this.contract.vote([beneficiary.address], [1], GRANT_TERM.MONTH)
      ).to.be.revertedWith("Election not open for voting");
    });

    it("should require staked voice credits", async function () {
      await this.contract.initialize(GRANT_TERM.MONTH);
      ethers.provider.send("evm_increaseTime", [7 * ONE_DAY]);
      ethers.provider.send("evm_mine");
      await this.mockStaking.mock.getVoiceCredits.returns(0);
      await expect(
        this.contract.vote([beneficiary.address], [1], GRANT_TERM.MONTH)
      ).to.be.revertedWith("must have voice credits from staking");
    });

    it("should require eligible beneficiary", async function () {
      await this.contract.initialize(GRANT_TERM.MONTH);
      ethers.provider.send("evm_increaseTime", [7 * ONE_DAY]);
      ethers.provider.send("evm_mine");
      await this.mockStaking.mock.getVoiceCredits.returns(10);
      await expect(
        this.contract.vote([beneficiary.address], [1], GRANT_TERM.MONTH)
      ).to.be.revertedWith("ineligible beneficiary");
    });

    it("should vote successfully", async function () {
      await this.contract.initialize(GRANT_TERM.MONTH);
      ethers.provider.send("evm_increaseTime", [7 * ONE_DAY]);
      ethers.provider.send("evm_mine");

      await this.mockPop
        .connect(beneficiary)
        .approve(this.contract.address, registrationBondMonth);

      await this.mockStaking.mock.getVoiceCredits.returns(10);
      await this.mockBeneficiaryRegistry.mock.beneficiaryExists.returns(true);
      await this.contract
        .connect(beneficiary)
        .registerForElection(beneficiary.address, GRANT_TERM.MONTH);
      await this.contract.vote([beneficiary.address], [5], GRANT_TERM.MONTH);
      const metadata = await GrantElectionAdapter(
        this.contract
      ).getElectionMetadata(GRANT_TERM.MONTH);
      expect(metadata["votes"]).deep.to.eq([
        {
          voter: owner.address,
          beneficiary: beneficiary.address,
          weight: Math.round(Math.sqrt(5)),
        },
      ]);

    });

    it("should not allow to vote twice for same address and grant term", async function () {
      await this.contract.initialize(GRANT_TERM.MONTH);
      ethers.provider.send("evm_increaseTime", [7 * ONE_DAY]);
      ethers.provider.send("evm_mine");
      await this.mockPop.connect(beneficiary).approve(this.contract.address, registrationBondMonth);
      await this.mockStaking.mock.getVoiceCredits.returns(10);
      await this.mockBeneficiaryRegistry.mock.beneficiaryExists.returns(true);
      await this.contract.connect(beneficiary).registerForElection(beneficiary.address, GRANT_TERM.MONTH);
      await this.contract.vote([beneficiary.address], [5], GRANT_TERM.MONTH);
      await expect(
        this.contract.vote([beneficiary.address], [1], GRANT_TERM.MONTH)
      ).to.be.revertedWith("address already voted for election term");
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
        this.mockGrantRegistry.address,
        this.mockRandomNumberConsumer.address,
        this.mockPop.address,
        governance.address,
      );
      await this.contract.deployed();
    });

    it("return current ranking", async function () {
      await this.contract.initialize(GRANT_TERM.MONTH);
      ethers.provider.send("evm_increaseTime", [7 * ONE_DAY]);
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
      await this.contract.connect(voter1).vote([beneficiary.address], [50], GRANT_TERM.MONTH);
      expect(await this.contract.getCurrentRanking(GRANT_TERM.MONTH)).deep.to.eq(
        [
          beneficiary.address,
          '0x0000000000000000000000000000000000000000',
          '0x0000000000000000000000000000000000000000',
        ]
      );
      await this.contract.connect(voter2).vote([beneficiary2.address], [100], GRANT_TERM.MONTH);
      expect(await this.contract.getCurrentRanking(GRANT_TERM.MONTH)).deep.to.eq(
        [
          beneficiary2.address,
          beneficiary.address,
          '0x0000000000000000000000000000000000000000',
        ]
      );
      await this.contract.connect(voter3).vote([beneficiary3.address], [70], GRANT_TERM.MONTH);
      expect(await this.contract.getCurrentRanking(GRANT_TERM.MONTH)).deep.to.eq(
        [
          beneficiary2.address,
          beneficiary3.address,
          beneficiary.address,
        ]
      );
      await this.contract.connect(voter4).vote([beneficiary4.address], [100], GRANT_TERM.MONTH);
      expect(await this.contract.getCurrentRanking(GRANT_TERM.MONTH)).deep.to.eq(
        [
          beneficiary2.address,
          beneficiary4.address,
          beneficiary3.address,
        ]
      );
      await this.contract.connect(voter5).vote([beneficiary5.address], [10], GRANT_TERM.MONTH);
      expect(await this.contract.getCurrentRanking(GRANT_TERM.MONTH)).deep.to.eq(
        [
          beneficiary2.address,
          beneficiary4.address,
          beneficiary3.address,
        ]
      );
      await this.contract.connect(voter6).vote(
        [beneficiary4.address, beneficiary5.address, beneficiary3.address],
        [10, 200, 20],
        GRANT_TERM.MONTH,
      );
      expect(await this.contract.getCurrentRanking(GRANT_TERM.MONTH)).deep.to.eq(
        [
          beneficiary5.address,
          beneficiary4.address,
          beneficiary2.address,
        ]
      );
    });
  });

  describe("finalization", function () {
    beforeEach(async function () {
      const Staking = await ethers.getContractFactory("Staking");
      this.mockStaking = await waffle.deployMockContract(owner, Staking.interface.format());

      const BeneficiaryRegistry = await ethers.getContractFactory("BeneficiaryRegistry");
      this.mockBeneficiaryRegistry = await waffle.deployMockContract(owner, BeneficiaryRegistry.interface.format());

      await this.mockPop.mint(owner.address, parseEther("100"));
      await this.mockPop.mint(beneficiary.address, parseEther("100"));
      await this.mockPop.mint(beneficiary2.address, parseEther("100"));
      await this.mockPop.mint(beneficiary3.address, parseEther("100"));
      await this.mockPop.mint(beneficiary4.address, parseEther("100"));
      await this.mockPop.mint(beneficiary5.address, parseEther("100"));

      const GrantElections = await ethers.getContractFactory('GrantElections');
      this.contract = await GrantElections.deploy(
        this.mockStaking.address,
        this.mockBeneficiaryRegistry.address,
        this.mockGrantRegistry.address,
        this.mockRandomNumberConsumer.address,
        this.mockPop.address,
        governance.address,
      );
      await this.contract.deployed();
    });

    it("require election closed", async function () {
      await expect(
        this.contract.finalize(GRANT_TERM.MONTH)
      ).to.be.revertedWith("election not yet closed");
    });

    it("require not finalized", async function () {
      await this.contract.initialize(GRANT_TERM.MONTH);
      ethers.provider.send("evm_increaseTime", [30 * ONE_DAY]);
      ethers.provider.send("evm_mine");
      await this.contract.refreshElectionState(GRANT_TERM.MONTH);
      await this.mockGrantRegistry.mock.createGrant.returns();
      await this.mockRandomNumberConsumer.mock.getRandomNumber.returns();
      await this.mockRandomNumberConsumer.mock.randomResult.returns(123);
      await this.contract.finalize(GRANT_TERM.MONTH);
      await expect(
        this.contract.finalize(GRANT_TERM.MONTH)
      ).to.be.revertedWith("election already finalized");
    });

    it("finalizes an election with randomization", async function () {
      await this.contract.initialize(GRANT_TERM.QUARTER);
      // voting
      await this.mockBeneficiaryRegistry.mock.beneficiaryExists.returns(true);
      await this.mockPop.connect(beneficiary).approve(this.contract.address, registrationBondQuarter);
      await this.contract.connect(beneficiary).registerForElection(beneficiary.address, GRANT_TERM.QUARTER);
      await this.mockPop.connect(beneficiary2).approve(this.contract.address, registrationBondQuarter);
      await this.contract.connect(beneficiary2).registerForElection(beneficiary2.address, GRANT_TERM.QUARTER);
      await this.mockPop.connect(beneficiary3).approve(this.contract.address, registrationBondQuarter);
      await this.contract.connect(beneficiary3).registerForElection(beneficiary3.address, GRANT_TERM.QUARTER);
      await this.mockPop.connect(beneficiary4).approve(this.contract.address, registrationBondQuarter);
      await this.contract.connect(beneficiary4).registerForElection(beneficiary4.address, GRANT_TERM.QUARTER);
      await this.mockPop.connect(beneficiary5).approve(this.contract.address, registrationBondQuarter);
      await this.contract.connect(beneficiary5).registerForElection(beneficiary5.address, GRANT_TERM.QUARTER);
      await this.mockStaking.mock.getVoiceCredits.returns(1000);
      ethers.provider.send("evm_increaseTime", [14 * ONE_DAY]);
      ethers.provider.send("evm_mine");
      await this.contract.connect(voter1).vote([beneficiary.address], [10], GRANT_TERM.QUARTER);
      await this.contract.connect(voter2).vote([beneficiary2.address], [20], GRANT_TERM.QUARTER);
      await this.contract.connect(voter3).vote([beneficiary3.address], [30], GRANT_TERM.QUARTER);
      await this.contract.connect(voter4).vote([beneficiary4.address], [40], GRANT_TERM.QUARTER);
      await this.contract.connect(voter5).vote([beneficiary5.address], [50], GRANT_TERM.QUARTER);
      // finalization
      ethers.provider.send("evm_increaseTime", [30 * ONE_DAY]);
      ethers.provider.send("evm_mine");
      await this.contract.refreshElectionState(GRANT_TERM.QUARTER);
      await this.mockGrantRegistry.mock.createGrant.returns();
      await this.mockRandomNumberConsumer.mock.getRandomNumber.returns();
      await this.mockRandomNumberConsumer.mock.randomResult.returns(2893);
      expect(await this.contract.finalize(GRANT_TERM.QUARTER))
        .to.emit(this.contract, "GrantCreated")
        .withArgs(
          GRANT_TERM.QUARTER,
          [beneficiary2.address, beneficiary3.address],
          [parseEther("50"), parseEther("50")],
        );
    });

    it("finalizes an election without randomization", async function () {
      await this.contract.connect(governance).setConfiguration(
        GRANT_TERM.QUARTER, 2, 5, false, false, 0, 14 * ONE_DAY, 14 *ONE_DAY, 83* ONE_DAY
      );
      await this.contract.initialize(GRANT_TERM.QUARTER);
      // voting
      await this.mockBeneficiaryRegistry.mock.beneficiaryExists.returns(true);
      await this.mockPop.connect(beneficiary).approve(this.contract.address, registrationBondQuarter);
      await this.contract.connect(beneficiary).registerForElection(beneficiary.address, GRANT_TERM.QUARTER);
      await this.mockPop.connect(beneficiary2).approve(this.contract.address, registrationBondQuarter);
      await this.contract.connect(beneficiary2).registerForElection(beneficiary2.address, GRANT_TERM.QUARTER);
      await this.mockPop.connect(beneficiary3).approve(this.contract.address, registrationBondQuarter);
      await this.contract.connect(beneficiary3).registerForElection(beneficiary3.address, GRANT_TERM.QUARTER);
      await this.mockPop.connect(beneficiary4).approve(this.contract.address, registrationBondQuarter);
      await this.contract.connect(beneficiary4).registerForElection(beneficiary4.address, GRANT_TERM.QUARTER);
      await this.mockPop.connect(beneficiary5).approve(this.contract.address, registrationBondQuarter);
      await this.contract.connect(beneficiary5).registerForElection(beneficiary5.address, GRANT_TERM.QUARTER);
      await this.mockStaking.mock.getVoiceCredits.returns(1000);
      ethers.provider.send("evm_increaseTime", [14 * ONE_DAY]);
      ethers.provider.send("evm_mine");
      await this.contract.connect(voter1).vote([beneficiary.address], [10], GRANT_TERM.QUARTER);
      await this.contract.connect(voter2).vote([beneficiary2.address], [40], GRANT_TERM.QUARTER);
      await this.contract.connect(voter3).vote([beneficiary3.address], [30], GRANT_TERM.QUARTER);
      await this.contract.connect(voter4).vote([beneficiary4.address], [50], GRANT_TERM.QUARTER);
      await this.contract.connect(voter5).vote([beneficiary5.address], [10], GRANT_TERM.QUARTER);
      // finalization
      ethers.provider.send("evm_increaseTime", [30 * ONE_DAY]);
      ethers.provider.send("evm_mine");
      await this.contract.refreshElectionState(GRANT_TERM.QUARTER);
      await this.mockGrantRegistry.mock.createGrant.returns();
      expect(await this.contract.finalize(GRANT_TERM.QUARTER))
        .to.emit(this.contract, "GrantCreated")
        .withArgs(
          GRANT_TERM.QUARTER,
          [beneficiary4.address, beneficiary2.address],
          [parseEther("50"), parseEther("50")],
        );
    });
   });
});
