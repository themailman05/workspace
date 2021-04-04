const { expect } = require("chai");
const { parseEther } = require("ethers/lib/utils");
const {
  GrantElectionAdapter,
} = require("../scripts/helpers/GrantElectionAdapter");

let contract, owner, nonOwner, beneficiary;
const GRANT_TERM = { MONTH: 0, QUARTER: 1, YEAR: 2 };
const ElectionState = { Registration: 0, Voting: 1, Closed: 2 };

describe("GrantElections", function () {
  before(async function () {
    [owner, nonOwner, beneficiary] = await ethers.getSigners();

    MockERC20 = await ethers.getContractFactory("MockERC20");
    this.mockPop = await MockERC20.deploy("TestPOP", "TPOP");
    await this.mockPop.mint(owner.address, parseEther("10"));

    const Staking = await ethers.getContractFactory("Staking");
    this.stakingContract = await Staking.deploy(this.mockPop.address);
    await this.stakingContract.deployed();

    const BeneficiaryRegistry = await ethers.getContractFactory(
      "BeneficiaryRegistry"
    );
    this.beneficiaryRegistry = await BeneficiaryRegistry.deploy(); //issue without address?
    await this.beneficiaryRegistry.deployed();

    await this.beneficiaryRegistry.addBeneficiary(
      beneficiary.address,
      ethers.utils.formatBytes32String("Beneficiary Amir")
    );

    const GrantElections = await ethers.getContractFactory("GrantElections");
    this.contract = await GrantElections.deploy(
      this.stakingContract.address,
      this.beneficiaryRegistry.address
    );
    await this.contract.deployed();
  });

  describe("vote", function () {
    it("should require election on voting process", async function () {
      await expect(this.contract.vote([], [], 0)).to.be.revertedWith(
        "Election not open for voting"
      );
    });
  });

  describe("defaults", function() {
    it('should set correct monthly defaults', async function() {
      const monthly = await GrantElectionAdapter(this.contract).electionDefaults(GRANT_TERM.MONTH);
      expect(monthly).to.deep.equal({
        useChainLinkVRF: true,
        ranking: 3,
        awardees: 1,
        registrationPeriod: 7 * 86400,
        votingPeriod: 7 * 86400,
        cooldownPeriod: 21 * 86400,
      });
    });

    it('should set correct quarterly defaults', async function() {
      const quarterly = await GrantElectionAdapter(this.contract).electionDefaults(GRANT_TERM.QUARTER);
      expect(quarterly).to.deep.equal({
        useChainLinkVRF: true,
        ranking: 5,
        awardees: 2,
        registrationPeriod: 14 * 86400,
        votingPeriod: 14 * 86400,
        cooldownPeriod: 83 * 86400,
      });
    })
    it('should set correct yearly defaults', async function() {
      const yearly = await GrantElectionAdapter(this.contract).electionDefaults(GRANT_TERM.YEAR);
      expect(yearly).to.deep.equal({
        useChainLinkVRF: true,
        ranking: 7,
        awardees: 3,
        registrationPeriod: 30 * 86400,
        votingPeriod: 30 * 86400,
        cooldownPeriod: 358 * 86400,
      });
    })
  });

  describe("initialization", function () {
    it("should succesfully initialize an election if one hasn't already been created", async function () {
      await ethers.provider.send("evm_setNextBlockTimestamp", [1625097600]);
      await ethers.provider.send("evm_mine");

      await expect(this.contract.initialize(GRANT_TERM.QUARTER)).to.emit(
        this.contract,
        "ElectionInitialized"
      ).withArgs(GRANT_TERM.QUARTER, 1625097601);
    });

    it("should set correct election metadata", async function() {
      const metadata = await GrantElectionAdapter(
        this.contract
      ).getElectionMetadata(GRANT_TERM.QUARTER);

      expect(metadata).to.deep.equal({
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

    })

    it("should prevent an election from initializing if it isn't closed", async function () {
      await expect(
        this.contract.initialize(GRANT_TERM.QUARTER)
      ).to.be.revertedWith("election not yet closed");
    });
  });

});
