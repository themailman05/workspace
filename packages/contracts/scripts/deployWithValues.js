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
        this.beneficiaryRegistry.address
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
    
    this.randomNumberConsumer = await (
      await (await ethers.getContractFactory("RandomNumberConsumer")).deploy(
        process.env.ADDR_CHAINLINK_VRF_COORDINATOR,
        process.env.ADDR_CHAINLINK_LINK_TOKEN,
        process.env.ADDR_CHAINLINK_KEY_HASH
      )
    ).deployed();

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

    logResults();
  };

  const giveBeneficiariesETH = async () => {
    console.log("giving ETH to beneficiaries ...")
    await bluebird.map(this.bennies, async (beneficiary) => {
      const balance = await ethers.provider.getBalance(beneficiary.address);
      if (balance.isZero()) {
        return this.accounts[0].sendTransaction({ to: beneficiary.address, value: utils.parseEther('.02')});
      }
    }, {concurrency: 1})
  }

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
        console.log(`registering ${beneficiary.address}`);
        return this.grantElections.registerForElection(
          beneficiary.address,
          grantTerm,
          {gasLimit: 150000}
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
    console.log("voters are staking POP ...");
    await bluebird.map(voters, async (voter) => {
      return this.staking
        .connect(voter)
        .stake(utils.parseEther("1000"), 604800 * 52 * 4);
    });
  };

  const voteForElection = async (term, voters, beneficiaries) => {
    await stakePOP(voters);

    while (await this.staking.getVoiceCredits(voters[voters.length - 1].address) == 0) {
      await new Promise(r => setTimeout(r, 1000));
      console.log("waiting for vote credits to be ready ...");
    }

    console.log(`${voters.length} voting for ${beneficiaries.length} bennies`);
    console.log("voters are voting in election ...");
    await bluebird.map(
      voters,
      async (voter) => {
        if (!voter) return;
        return this.grantElections.connect(voter).vote(
          beneficiaries.map((benny) => benny.address),
          [
            utils.parseEther("100"),
            utils.parseEther("200"),
            utils.parseEther("300"),
            utils.parseEther("400"),
          ],
          term
        );
      },
      { concurrency: 1 }
    );
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
      60, // secs for voting period
      1, // secs for registration period
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

    electionMetadata = await GrantElectionAdapter(this.grantElections).getElectionMetadata(
      GrantTerm.Quarter
    )

    console.log("refreshing election state");
    while (electionMetadata.electionState != 1) {
      await this.grantElections.refreshElectionState(GrantTerm.Quarter);
      electionMetadata = await GrantElectionAdapter(this.grantElections).getElectionMetadata(
        GrantTerm.Quarter
      );
      console.log("waiting for election to be ready for voting...");
    }

    await voteForElection(
      GrantTerm.Quarter,
      this.accounts.slice(5, 8),
      this.bennies.slice(7, 11)
    );

    console.log("refreshing election state");
    while (electionMetadata.electionState != 2) {
      await this.grantElections.refreshElectionState(GrantTerm.Quarter);
      electionMetadata = await GrantElectionAdapter(this.grantElections).getElectionMetadata(
        GrantTerm.Quarter
      );
      console.log("waiting for election to close...");
    }

    await displayElectionMetadata(GrantTerm.Quarter);
  };

  // registration period
  const initializeYearlyElection = async () => {
    console.log("initializing yearly election ...");
    await this.grantElections.initialize(GrantTerm.Year);
    await new Promise(r => setTimeout(r, 20000));
    console.log("registerBeneficiariesForElection in ...");
    await registerBeneficiariesForElection(
      GrantTerm.Year,
      this.bennies.slice(14, 18)
    );
    console.log("registerBeneficiariesForElection out ...");
    await displayElectionMetadata(GrantTerm.Year);
  };

  const setElectionContractAsGovernanceForGrantRegistry = async () => {
    await this.grantRegistry.setGovernance(this.accounts[0].address);
  }

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
      eligibleButNotRegistered: this.bennies.slice(18,20).map((bn)=> bn.address),
      contracts: {
        beneficiaryRegistry: this.beneficiaryRegistry.address,
        grantRegistry: this.grantRegistry.address,
        mockPop: this.mockPop.address,
        staking: this.staking.address,
        randomNumberConsumer: this.randomNumberConsumer.address,
        grantElections: this.grantElections.address,
      },
    });
    console.log(`
Paste this into your .env file:

ADDR_BENEFICIARY_REGISTRY=${this.beneficiaryRegistry.address}
ADDR_GRANT_REGISTRY=${this.grantRegistry.address}
ADDR_POP=${this.mockPop.address}
ADDR_STAKING=${this.staking.address}
ADDR_RANDOM_NUMBER=${this.randomNumberConsumer.address}
ADDR_GOVERNANCE=${this.accounts[0].address}
ADDR_GRANT_ELECTION=${this.grantElections.address}
    `);
  };

  await setSigners();
  await giveBeneficiariesETH();
  await deployContracts();
  await addBeneficiariesToRegistry();
  await mintPOP();
  await approveForStaking();
  await initializeMonthlyElection();
  await initializeQuarterlyElection();
  await initializeYearlyElection();
  await setElectionContractAsGovernanceForGrantRegistry();
  await logResults();
}

module.exports = {
  deploy,
};
