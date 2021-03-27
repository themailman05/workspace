require('dotenv').config();
const hre = require('hardhat');
const date = require('date.js');
const web3 = require('web3');

const tokenManager = { address: process.env.A_TOKEN_MANAGER };

async function main() {
  const BatchVest = await hre.ethers.getContractFactory('BatchVest');
  const batchVest = await BatchVest.deploy(tokenManager.address);
  await batchVest.deployed();
  console.log('batchVest deployed to:', batchVest.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
