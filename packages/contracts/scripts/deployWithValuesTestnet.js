const { parseEther } = require("ethers/lib/utils");
const { GrantElectionAdapter } = require("./helpers/GrantElectionAdapter");
const bluebird = require("bluebird");
const { utils } = require("ethers");
/*const IUniswapV2Router02 = require("@uniswap/v2-periphery/build/IUniswapV2Router02.json");
const BeneficiaryRegistryAbi = require("../artifacts/contracts/BeneficiaryRegistry.sol/BeneficiaryRegistry.json");
const GrantRegistryAbi = require("../artifacts/contracts/GrantRegistry.sol/GrantRegistry.json");
const MockERC20Abi = require("../artifacts/contracts/mocks/MockERC20.sol/MockERC20.json");
const StakingAbi = require("../artifacts/contracts/Staking.sol/Staking.json");
const RandomNumberConsumerAbi = require("../artifacts/contracts/RandomNumberConsumer.sol/RandomNumberConsumer.json");
const GrantElectionsAbi = require("../artifacts/contracts/GrantElections.sol/GrantElections.json");
const TreasuryAbi = require("../artifacts/contracts/mocks/MockTreasury.sol/MockTreasury.json");
const BeneficiaryVaultsAbi = require("../artifacts/contracts/BeneficiaryVaults.sol/BeneficiaryVaults.json");
const InsuranceAbi = require("../artifacts/contracts/mocks/MockInsurance.sol/MockInsurance.json");
const RewardsManagerAbi = require("../artifacts/contracts/RewardsManager.sol/RewardsManager.json");*/

// This script creates two beneficiaries and one quarterly grant that they are both eligible for. Run this
// Run this instead of the normal deploy.js script
async function deployTestnet(ethers) {
  const GrantTerm = { Month: 0, Quarter: 1, Year: 2 };
  const GrantTermMap = { 0: "Monthly", 1: "Quarterly", 2: "Yearly" };

  const setSigners = async () => {
    console.log("set signer ...");
    this.accounts = await ethers.getSigners();
    this.bennies = this.accounts.slice(1, 20);
  };

  const deployContracts = async () => {
    console.log("deploying contracts ...");

    console.log("mockPop")
    const mockPopFactory = await ethers.getContractFactory("MockERC20")
    this.mockPop = await mockPopFactory.deploy("TestPOP", "TPOP");
    console.log("mockPop address", this.mockPop.address);
    console.log(await this.mockPop.deployed())
    console.log("mockPop deployed")

    console.log("beneficiaryRegistry");
    this.beneficiaryRegistry = await (
      await ethers.getContractFactory("BeneficiaryRegistry")
    ).deploy();
    console.log(
      "beneficiaryRegistry address",
      this.beneficiaryRegistry.address
    );
    await this.beneficiaryRegistry.deployed()
    console.log("beneficiaryRegistry deployed")
    
    console.log("grantRegistry");
    this.grantRegistry = await (
      await ethers.getContractFactory("GrantRegistry")
    ).deploy(this.beneficiaryRegistry.address);
    console.log("grantRegistry address", this.grantRegistry.address);
    await this.grantRegistry.deployTransaction.wait(2)

    console.log("staking");
    this.staking = await (
      await ethers.getContractFactory("Staking")
    ).deploy(this.mockPop.address);
    console.log("staking address", this.staking.address);
    await this.staking.deployTransaction.wait(2)


    console.log("randomNumberConsumer");
    this.randomNumberConsumer = await (
      await ethers.getContractFactory("RandomNumberConsumer")
    ).deploy(
      process.env.ADDR_CHAINLINK_VRF_COORDINATOR,
      process.env.ADDR_CHAINLINK_LINK_TOKEN,
      process.env.ADDR_CHAINLINK_KEY_HASH
    );
    console.log(
      "randomNumberConsumer address",
      this.randomNumberConsumer.address
    );
    await this.randomNumberConsumer.deployTransaction.wait(2)


    console.log("grantElections");
    this.grantElections = await (
      await ethers.getContractFactory("GrantElections")
    ).deploy(
      this.staking.address,
      this.beneficiaryRegistry.address,
      this.grantRegistry.address,
      this.randomNumberConsumer.address,
      this.mockPop.address,
      this.accounts[0].address
    );
    console.log("grantElections address", this.grantElections.address);
    await this.grantElections.deployTransaction.wait(2)

    console.log("uniswapRouter");
    this.uniswapRouter = new ethers.Contract(
      process.env.ADDR_UNISWAP_ROUTER,
      IUniswapV2Router02.abi,
      ethers.provider
    );
    console.log("uniswapRouter address", this.uniswapRouter.address);

    console.log("beneficiaryVaults");
    this.beneficiaryVaults = await (
      await ethers.getContractFactory("BeneficiaryVaults")
    ).deploy(this.mockPop.address, this.beneficiaryRegistry.address);
    console.log("beneficiaryVaults address", this.beneficiaryVaults.address);
    await this.beneficiaryVaults.deployTransaction.wait(2)

    console.log("treasury");
    this.treasury = await (
      await ethers.getContractFactory("MockTreasury")
    ).deploy();
    console.log("treasury address", this.treasury.address);
    await this.treasury.deployTransaction.wait(2)


    console.log("insurance");
    this.insurance = await (
      await ethers.getContractFactory("MockInsurance")
    ).deploy();
    console.log("insurance address", this.insurance.address);
    await this.insurance.deployTransaction.wait(2)

    console.log("rewardsManager");
    this.rewardsManager = await (
      await ethers.getContractFactory("RewardsManager")
    ).deploy(
      this.mockPop.address,
      this.staking.address,
      this.treasury.address,
      this.insurance.address,
      this.beneficiaryVaults.address,
      this.uniswapRouter.address
    );
    console.log("rewardsManager address", this.rewardsManager.address);
    await this.rewardsManager.deployTransaction.wait(1)
    logResults();
  };

  /*const connectToContracts = async () => {
    console.log("connect to contracts ...");

    this.mockPop = new ethers.Contract(
      process.env.ADDR_TESTNET_POP,
      MockERC20Abi.abi,
      ethers.provider
    );
    console.log("mockPop address", this.mockPop.address);

    console.log("beneficiaryRegistry");
    this.beneficiaryRegistry = new ethers.Contract(
      process.env.ADDR_TESTNET_BENEFICIARY_REGISTRY,
      BeneficiaryRegistryAbi.abi,
      ethers.provider
    );
    console.log(
      "beneficiaryRegistry address",
      this.beneficiaryRegistry.address
    );

    console.log("grantRegistry");
    this.grantRegistry = new ethers.Contract(
      process.env.ADDR_TESTNET_GRANT_REGISTRY,
      GrantRegistryAbi.abi,
      ethers.provider
    );
    console.log("grantRegistry address", this.grantRegistry.address);

    console.log("staking");
    this.staking = new ethers.Contract(
      process.env.ADDR_TESTNET_STAKING,
      StakingAbi.abi,
      ethers.provider
    );
    console.log("staking address", this.staking.address);

    console.log("randomNumberConsumer");
    this.randomNumberConsumer = new ethers.Contract(
      process.env.ADDR_TESTNET_RANDOM_NUMBER,
      RandomNumberConsumerAbi.abi,
      ethers.provider
    );
    console.log(
      "randomNumberConsumer address",
      this.randomNumberConsumer.address
    );

    console.log("grantElections");
    this.grantElections = new ethers.Contract(
      "0x71EaBAFbc969c8Eb8E37c7664204B69fA4144712",
      GrantElectionsAbi.abi,
      ethers.provider
    );
    console.log("grantElections address", this.grantElections.address)

    console.log("uniswapRouter");
    this.uniswapRouter = new ethers.Contract(
      process.env.ADDR_UNISWAP_ROUTER,
      IUniswapV2Router02.abi,
      ethers.provider
    );
    console.log("uniswapRouter address", this.uniswapRouter.address);

    console.log("beneficiaryVaults");
    this.beneficiaryVaults = new ethers.Contract(
      process.env.ADDR_TESTNET_BENEFICIARY_VAULT,
      BeneficiaryVaultsAbi.abi,
      ethers.provider
    );
    console.log("beneficiaryVaults address", this.beneficiaryVaults.address);

    console.log("treasury");
    this.treasury = new ethers.Contract(
      process.env.ADDR_TESTNET_TREASURY,
      TreasuryAbi.abi,
      ethers.provider
    );
    console.log("treasury address", this.treasury.address);

    console.log("insurance");
    this.insurance = new ethers.Contract(
      process.env.ADDR_TESTNET_INSURANCE,
      InsuranceAbi.abi,
      ethers.provider
    );
    console.log("insurance address", this.insurance.address);

    console.log("rewardsManager");
    this.rewardsManager = new ethers.Contract(
      process.env.ADDR_TESTNET_REWARDS_MANAGER,
      RewardsManagerAbi.abi,
      ethers.provider
    );
    console.log("rewardsManager address", this.rewardsManager.address);

    logResults();
  };*/

  const provideUniswapLiquidity = async () => {
    console.log("providing POP and ETH to uniswap pair ...");
    const blockNumber = await ethers.provider.getBlockNumber();
    const currentBlock = await ethers.provider.getBlock(blockNumber);
    this.popPair = await this.uniswapRouter
      .connect(this.accounts[0])
      .addLiquidityETH(
        this.mockPop.address,
        10000,
        10000,
        1,
        this.accounts[0].address,
        currentBlock.timestamp.add(600)
      );
  };

  const addBeneficiariesToRegistry = async () => {
    console.log("adding beneficiaries to registry ...");
    await bluebird.map(
      this.bennies,
      async (beneficiary) => {
        return this.beneficiaryRegistry.addBeneficiary(
          beneficiary.address,
          ethers.utils.formatBytes32String("1234"),
          { gasLimit: 3000000 }
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
        return this.mockPop
          .connect(this.accounts[0])
          .mint(account.address, parseEther("100000"));
      },
      { concurrency: 1 }
    );
    await bluebird.map(
      this.accounts,
      async (account) => {
        return this.mockPop
          .connect(account)
          .approve(this.grantElections.address, parseEther("10000000"));
      },
      { concurrency: 1 }
    );
  };

  const initializeElectionWithFastVotingEnabled = async (grantTerm) => {
    console.log(
      `initializing ${GrantTermMap[grantTerm]} election with fast voting enabled ...`
    );
    await this.grantElections
      .connect(this.accounts[0])
      .setConfiguration(grantTerm, 10, 10, true, false, 0, 86400 * 30, 10, 100);
    console.log("config set");

    await this.grantElections.connect(this.accounts[0]).initialize(grantTerm);
    console.log("init");
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
    console.log(bennies)
    await bluebird.map(
      bennies,
      async (beneficiary) => {
        console.log(`registering ${beneficiary.address}`);
        return this.grantElections.registerForElection(
          beneficiary.address,
          grantTerm,
          { gasLimit: 3000000 }
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
    //await stakePOP(voters);
    console.log("voters", voters)

    while (
      (await this.staking.getVoiceCredits(voters[voters.length - 1].address)) ==
      0
    ) {
      await new Promise((r) => setTimeout(r, 1000));
      console.log("waiting for vote credits to be ready ...");
    }

    console.log(`${voters.length} voting for ${beneficiaries.length} bennies`);
    console.log("voters are voting in election ...");
    await bluebird.map(
      voters,
      async (voter) => {
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
    await this.grantElections.connect(this.accounts[0]).setConfiguration(
      GrantTerm.Quarter,
      1, // 1 awardee
      3, // 3 qualifying
      true,
      false,
      0,
      120, // secs for voting period
      1, // secs for registration period
      100
    );
    await this.grantElections
      .connect(this.accounts[0])
      .initialize(GrantTerm.Quarter);
    console.log(
      await GrantElectionAdapter(this.grantElections).electionDefaults(
        GrantTerm.Quarter
      )
    );
    await registerBeneficiariesForElection(
      GrantTerm.Quarter,
      this.bennies.slice(7, 14)
    );

    console.log("get metadata");
    console.log(await this.grantElections.getElectionMetadata(2));

    electionMetadata = await GrantElectionAdapter(
      this.grantElections
    ).getElectionMetadata(GrantTerm.Quarter);

    console.log("refreshing election state");
    while (electionMetadata.electionState != 1) {
      await new Promise((r) => setTimeout(r, 1000));
      await this.grantElections
        .connect(this.accounts[0])
        .refreshElectionState(GrantTerm.Quarter);
      electionMetadata = await GrantElectionAdapter(
        this.grantElections
      ).getElectionMetadata(GrantTerm.Quarter);
      console.log("waiting for election to be ready for voting...");
    }

    console.log("accounts",this.accounts)
    console.log("bennies",this.bennies)

    await voteForElection(
      GrantTerm.Quarter,
      this.accounts.slice(5, 8),
      this.bennies.slice(7, 11)
    );

    while (electionMetadata.votes.length < 4) {
      await new Promise((r) => setTimeout(r, 1000));
      electionMetadata = await GrantElectionAdapter(
        this.grantElections
      ).getElectionMetadata(GrantTerm.Quarter);
      console.log("waiting for votes to confirm ...");
    }

    console.log("refreshing election state");
    while (electionMetadata.electionState != 2) {
      await this.grantElections
        .connect(this.accounts[0])
        .refreshElectionState(GrantTerm.Quarter);
      electionMetadata = await GrantElectionAdapter(
        this.grantElections
      ).getElectionMetadata(GrantTerm.Quarter);
      await new Promise((r) => setTimeout(r, 1000));
      console.log("waiting for election to close...");
    }

    await displayElectionMetadata(GrantTerm.Quarter);
  };

  // registration period
  const initializeYearlyElection = async () => {
    console.log("initializing yearly election ...");
    await this.grantElections
      .connect(this.accounts[0])
      .initialize(GrantTerm.Year);
    //await new Promise((r) => setTimeout(r, 20000));
    console.log("registering")
    await registerBeneficiariesForElection(
      GrantTerm.Year,
      this.bennies.slice(14, 18)
    );
    await displayElectionMetadata(GrantTerm.Year);
  };

  const setElectionContractAsGovernanceForGrantRegistry = async () => {
    console.log("setElectionContractAsGovernanceForGrantRegistry ...")
    await this.grantRegistry
      .connect(this.accounts[0])
      .nominateNewGovernance(this.accounts[0].address);
    await this.grantRegistry.connect(this.accounts[0]).acceptGovernance();
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
      eligibleButNotRegistered: this.bennies
        .slice(18, 20)
        .map((bn) => bn.address),
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

ADDR_TESTNET_BENEFICIARY_REGISTRY=${this.beneficiaryRegistry.address}
ADDR_TESTNET_GRANT_REGISTRY=${this.grantRegistry.address}
ADDR_TESTNET_POP=${this.mockPop.address}
ADDR_TESTNET_STAKING=${this.staking.address}
ADDR_TESTNET_RANDOM_NUMBER=${this.randomNumberConsumer.address}
ADDR_TESTNET_GOVERNANCE=${this.accounts[0].address}
ADDR_TESTNET_TREASURY=${this.treasury.address}
ADDR_TESTNET_INSURANCE=${this.insurance.address}
ADDR_TESTNET_BENEFICIARY_VAULT=${this.beneficiaryVaults.address}
ADDR_TESTNET_REWARDS_MANAGER=${this.rewardsManager.address}
ADDR_TESTNET_GRANT_ELECTION=${this.grantElections.address}
    `);
  };
  await setSigners();
  await deployContracts();
  //await connectToContracts();
  await addBeneficiariesToRegistry();
  await mintPOP();
  await provideUniswapLiquidity();
  await approveForStaking();
  await initializeMonthlyElection();
  await initializeQuarterlyElection();
  await initializeYearlyElection();
  await setElectionContractAsGovernanceForGrantRegistry();
  await logResults();
}

module.exports = {
  deployTestnet,
};
