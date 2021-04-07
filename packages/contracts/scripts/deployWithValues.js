const { parseEther } = require("ethers/lib/utils");
const { GrantElectionAdapter } = require('./helpers/GrantElectionAdapter');
const bluebird = require("bluebird");

// This script creates two beneficiaries and one quarterly grant that they are both eligible for. Run this
// Run this instead of the normal deploy.js script
async function main() {
  
  const GRANT_TERM = { MONTH: 0, QUARTER: 1, YEAR: 2 };
  const GrantTermMap = { 0: 'Monthly', 1: 'Quarterly', 2: 'Yearly'};

  const setSigners = async () => {
    this.accounts = await ethers.getSigners();
    this.bennies = this.accounts.slice(1,10);
  }

  const deployContracts = async () => {
    console.log("deploying contracts ...")
    this.beneficiaryRegistry = (await (await (await ethers.getContractFactory("BeneficiaryRegistry")).deploy()).deployed());
    this.grantRegistry = (await (await (await ethers.getContractFactory("GrantRegistry")).deploy(beneficiaryRegistry.address)).deployed());
    this.mockPop = (await (await (await ethers.getContractFactory("MockERC20")).deploy("TestPOP", "TPOP")).deployed());
    this.staking = (await (await (await ethers.getContractFactory("Staking")).deploy(this.mockPop.address)).deployed());
    this.grantElections = (await (await (await ethers.getContractFactory("GrantElections")).deploy(
      this.staking.address,
      this.beneficiaryRegistry.address,
      this.mockPop.address,
      this.accounts[0].address
    )).deployed());
  }

  const addBeneficiariesToRegistry = async () => {
    console.log("adding beneficiaries to registry ...")
    await bluebird.map(this.bennies, async(beneficiary) => {
      return this.beneficiaryRegistry.addBeneficiary(beneficiary.address, ethers.utils.formatBytes32String('1234'));
    }, {concurrency: 1});
  }

  const mintPOP = async () => {
    console.log("giving everyone POP (yay!) ...")
    await bluebird.map(this.accounts, async(account) => {
      return this.mockPop.mint(account.address, parseEther("1000"));
    });
  }

  const initializeElectionWithFastVotingEnabled = async (grantTerm) => {
    console.log(`initializing ${GrantTermMap[grantTerm]} election with fast voting enabled ...`)
    await this.grantElections.setConfiguration(grantTerm, 10, 10, true, false, 0, 86400 * 30, 60, 100);
    await this.grantElections.initialize(grantTerm);
    console.log(await GrantElectionAdapter(this.grantElections).electionDefaults(grantTerm));
  }

  const registerBeneficiariesForElection = async (grantTerm) => {
    console.log(`registering beneficiaries for election (${GrantTermMap[grantTerm]}) ...`);
    await bluebird.map(this.bennies, async(beneficiary) => {
      return this.grantElections.registerForElection(beneficiary.address, grantTerm);
    }, {concurrency: 1});
  }
  const displayElectionMetadata = async (grantTerm) => {
    console.log(`${GrantTermMap[grantTerm]} metadata: `, await GrantElectionAdapter(this.grantElections).getElectionMetadata(grantTerm));
  }
  

  const logResults = async () => {
    console.log({
      contracts: {
        beneficiaryRegistry: this.beneficiaryRegistry.address,
        grantRegistry: this.grantRegistry.address,
        mockPop: this.mockPop.address,
        staking: this.staking.address,
        elections: this.grantElections.address,
      }
    });
  }

  await setSigners();
  await deployContracts();
  await addBeneficiariesToRegistry();
  await mintPOP();
  await initializeElectionWithFastVotingEnabled(GRANT_TERM.QUARTER);
  await registerBeneficiariesForElection(GRANT_TERM.QUARTER);
  await displayElectionMetadata(GRANT_TERM.QUARTER);
  await logResults();
  
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
