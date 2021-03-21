require('dotenv').config();

/**
 * Checklist:
 * 1. have you set the correct schedule to use below? test/team/earlyBackers_1/earlyBackers_2/foundation
 * 2. is the environment file correct?
 * 3. is the BATCH_VEST_ADDR correct?
 * 4. Are the recipients correct?
 */


/**
 * set configuration here
 * 
 */

const SCHEDULE = 'earlyBackers_1'; // test / team / earlyBackers_1 / earlyBackers_2 / foundation
const BATCH_VEST_ADDR = process.env.A_BATCH_VEST;
const RECIPIENTS = [
  ["0x34Fc290da8437dfb3249bf4f4B2ba3836D16Bc69", 500000],
  ["0xED9c5B6255004142e8bf8479803A895E8098EF25", 350000],
  ["0x4Cb6Bcf2Fef72966d3ee94F7368AE0d0A2Ea59Cf", 145186],
  ["0x51771112D43326f9Cb1b97bE4aa74e71Dd6Ed100", 500000],
  ["0x9244b5cAb2Be0a570fA0AA73b4a55C910d4A7209", 350000],
  ["0x28B71e95df5433fD57D8e88E89E1ddeA8653ACB6", 100000],
  ["0x298749E23a3cABc3ac1482A8347f6F705412667F", 101642],
  ["0xbEb7762f3eF3e838d4FA2EBeddbD1e278A430704", 149927]
];


/**
 * start requires
 */

const hre = require('hardhat');
const { toWei, chunkArray } = require("./helpers/helpers");
const vestingSchedules = require('./schedules');

/**
 * end requires
 */


const provider = new hre.ethers.getDefaultProvider(
  process.env.INFURA_WSS,
);
const wallet = new hre.ethers.Wallet(process.env.PRIVATE_KEY, provider);

const BatchVestContract = {
  abi: require('../artifacts/contracts/BatchVest.sol/BatchVest.json').abi,
  address: BATCH_VEST_ADDR,
};



const vestAirdrop = async (batchVest) => {
  const { start, cliff, vesting } = vestingSchedules[SCHEDULE];
  const tranche = chunkArray(RECIPIENTS, 40);

  while (tranche.length > 0) {
    const chunk = tranche.pop();
    console.log("vesting:", chunk);
    const tx = await batchVest.vest(
      chunk.map((user) => user[0]),
      chunk.map((user) => toWei(user[1])),
      start,
      cliff,
      vesting,
      true,
      { gasLimit: 2000000 },
    );
    console.log(`
			vested to ${chunk.length} addresses
			batches remaining: ${tranche.length}
		`);
    tx.wait(1);
  }
};

const validate = () => {
  if (!process.env.A_BATCH_VEST) {
    throw "MUST DEFINE DEPLOYED BATCH VEST ADDRESS"
  }
}


async function main() {
  validate();
  const BatchVest = await new hre.ethers.Contract(
    BatchVestContract.address,
    BatchVestContract.abi,
    wallet,
  );
  console.log('connected to:', BatchVest.address);

  await vestAirdrop(BatchVest);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
