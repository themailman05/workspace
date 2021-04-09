const { parseEther } = require("ethers/lib/utils");
const { GrantElectionAdapter } = require("./helpers/GrantElectionAdapter");
const bluebird = require("bluebird");
const { utils } = require("ethers");

// This script creates two beneficiaries and one quarterly grant that they are both eligible for. Run this
// Run this instead of the normal deploy.js script
async function deploy(ethers) {
  const GrantTerm = { Month: 0, Quarter: 1, Year: 2 };
  const GrantTermMap = { 0: "Monthly", 1: "Quarterly", 2: "Yearly" };

  const setSigners = async () => {
    this.accounts = await ethers.getSigners();
    this.bennies = this.accounts.slice(1, 20);
  };

  const deployContracts = async () => {
    console.log("deploying contracts ...");
    this.beneficiaryRegistry = await (
      await (await ethers.getContractFactory("BeneficiaryRegistry")).deploy()
    ).deployed();
    this.grantRegistry = await (
      await (await ethers.getContractFactory("GrantRegistry")).deploy(
        beneficiaryRegistry.address
      )
    ).deployed();
    this.mockPop = await (
      await (await ethers.getContractFactory("MockERC20")).deploy(
        "TestPOP",
        "TPOP"
      )
    ).deployed();
    this.staking = await (
      await (await ethers.getContractFactory("Staking")).deploy(
        this.mockPop.address
      )
    ).deployed();
    this.grantRegistry = (await (await (await ethers.getContractFactory("GrantRegistry")).deploy(beneficiaryRegistry.address)).deployed());
    this.randomNumberConsumer = (await (await (await ethers.getContractFactory("RandomNumberConsumer")).deploy(
      "0xb3dCcb4Cf7a26f6cf6B120Cf5A73875B7BBc655B",
      "0x01be23585060835e02b77ef475b0cc51aa1e0709",
      "0x2ed0feb3e7fd2022120aa84fab1945545a9f2ffc9076fd6156fa96eaff4c1311",
    )).deployed());
    this.grantElections = await (
      await (await ethers.getContractFactory("GrantElections")).deploy(
        this.staking.address,
        this.beneficiaryRegistry.address,
        this.grantRegistry.address,
      this.randomNumberConsumer.address,
      this.mockPop.address,
        this.accounts[0].address
      )
    ).deployed();
  };

  const addBeneficiariesToRegistry = async () => {
    console.log("adding beneficiaries to registry ...");
    await bluebird.map(
      this.bennies,
      async (beneficiary) => {
        return this.beneficiaryRegistry.addBeneficiary(
          beneficiary.address,
          ethers.utils.formatBytes32String("1234")
        );
      },
      { concurrency: 1 }
    );
  };

  const mintPOP = async () => {
    console.log("giving everyone POP (yay!) ...");
    await bluebird.map(
      this.accounts,
      async (account) => {
        return this.mockPop.mint(account.address, parseEther("10000"));
      },
      { concurrency: 1 }
    );
    await bluebird.map(
      this.accounts,
      async (account) => {
        return this.mockPop
          .connect(account)
          .approve(this.grantElections.address, parseEther("10000"));
      },
      { concurrency: 1 }
    );
  };

  const initializeElectionWithFastVotingEnabled = async (grantTerm) => {
    console.log(
      `initializing ${GrantTermMap[grantTerm]} election with fast voting enabled ...`
    );
    await this.grantElections.setConfiguration(
      grantTerm,
      10,
      10,
      true,
      false,
      0,
      86400 * 30,
      10,
      100
    );
    await this.grantElections.initialize(grantTerm);
    console.log(
      await GrantElectionAdapter(this.grantElections).electionDefaults(
        grantTerm
      )
    );
  };

  const registerBeneficiariesForElection = async (grantTerm, bennies) => {
    console.log(
      `registering beneficiaries for election (${GrantTermMap[grantTerm]}) ...`
    );
    await bluebird.map(
      bennies,
      async (beneficiary) => {
        return this.grantElections.registerForElection(
          beneficiary.address,
          grantTerm
        );
      },
      { concurrency: 1 }
    );
  };
  const displayElectionMetadata = async (grantTerm) => {
    console.log(
      `${GrantTermMap[grantTerm]} metadata: `,
      await GrantElectionAdapter(this.grantElections).getElectionMetadata(
        grantTerm
      )
    );
  };

  // voting active
  const initializeMonthlyElection = async () => {
    await initializeElectionWithFastVotingEnabled(GrantTerm.Month);
    await registerBeneficiariesForElection(
      GrantTerm.Month,
      this.bennies.slice(0, 6)
    );
    await displayElectionMetadata(GrantTerm.Month);
  };

  const stakePOP = async (voters) => {
    console.log('voters are staking POP ...')
    await bluebird.map(voters, async (voter) => {
      return this.staking.connect(voter).stake(utils.parseEther("1000"), 604800 * 52 * 4);
    });
  };

  const voteForElection = async (term, voters, beneficiaries) => {
    await stakePOP(voters);

    console.log(`${voters.length} voting for ${beneficiaries.length} bennies`)
    console.log('voters are voting in election ...');
    await bluebird.map(voters, async (voter) => {
      if (!voter) return;
      return this.grantElections
        .connect(voter)
        .vote(beneficiaries.map((benny) => benny.address), [
          utils.parseEther("100"),
          utils.parseEther("200"),
          utils.parseEther("300"),
          utils.parseEther("400"),
        ], term);
    }, {concurrency: 1});
  };

  // voting completed: to be finalized
  const initializeQuarterlyElection = async () => {
    // set configuration for fast registration & voting
    // register
    // stake POP to vote
    // add some votes
    // refresh election state
    console.log(
      "initializing quarterly election with fast forwarding to closed state ..."
    );
    await this.grantElections.setConfiguration(
      GrantTerm.Quarter,
      3,
      6,
      true,
      false,
      0,
      10,
      10,
      100
    );
    await this.grantElections.initialize(GrantTerm.Quarter);
    console.log(
      await GrantElectionAdapter(this.grantElections).electionDefaults(
        GrantTerm.Quarter
      )
    );
    await registerBeneficiariesForElection(
      GrantTerm.Quarter,
      this.bennies.slice(7, 14)
    );

    console.log("refreshing election state");
    await this.grantElections.refreshElectionState(GrantTerm.Quarter);

    await voteForElection(
      GrantTerm.Quarter,
      this.accounts.slice(5, 8),
      this.bennies.slice(7, 11),
    );

    console.log("refreshing election state");
    await this.grantElections.refreshElectionState(GrantTerm.Quarter);

    await displayElectionMetadata(GrantTerm.Quarter);
  };

  // registration period
  const initializeYearlyElection = async () => {
    console.log("initializing yearly election ...");
    await this.grantElections.initialize(GrantTerm.Year);
    await registerBeneficiariesForElection(
      GrantTerm.Year,
      this.bennies.slice(14, 18)
    );
    await displayElectionMetadata(GrantTerm.Year);
  };

  const approveForStaking = async () => {
    console.log("approving all accounts for staking ...");
    await bluebird.map(
      accounts,
      async (account) => {
        return this.mockPop
          .connect(account)
          .approve(this.staking.address, utils.parseEther("100000000"));
      },
      { concurrency: 1 }
    );
  };

  const logResults = async () => {
    console.log({
      contracts: {
        beneficiaryRegistry: this.beneficiaryRegistry.address,
        grantRegistry: this.grantRegistry.address,
        mockPop: this.mockPop.address,
        staking: this.staking.address,
        randomNumberConsumer: this.randomNumberConsumer.address,
        grantElections: this.grantElections.address,
      }
    });
  };

  await setSigners();
  await deployContracts();
  await addBeneficiariesToRegistry();
  await mintPOP();
  await approveForStaking();
  await initializeMonthlyElection();
  await initializeQuarterlyElection();
  await initializeYearlyElection();
  await logResults();
}

module.exports = {
  deploy,
};
