require("@nomiclabs/hardhat-waffle");
const { utils } = require("ethers");

const mockERC20ABI = require('./artifacts/contracts/mocks/MockERC20.sol/MockERC20.json').abi;
const StakingABI = require('./artifacts/contracts/Staking.sol/Staking.json').abi;

task("accounts", "Prints the list of accounts", async () => {
  const accounts = await ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

task("POP:mint", "mint amount for recipient",)
  .addParam("contractaddress", "mock POP contract address")
  .addParam("recipient", "address to receive POP")
  .addParam("amount", "amount to receive")
  .setAction(async (args, hre) => {
    const [signer] = await ethers.getSigners();
    const { contractaddress, recipient, amount } = args;
    const mockPOP = new ethers.Contract(contractaddress, mockERC20ABI, signer);
    const result = await mockPOP.mint(recipient, utils.parseEther(amount));
    console.log("Done: ", result);
});

task("POP:balanceOf", "get balance of POP for address",)
  .addParam("contractaddress", "mock POP contract address")
  .addParam("address", "amount to receive")
  .setAction(async (args, hre) => {
    const [signer] = await ethers.getSigners();
    const { contractaddress, address } = args;
    const mockPOP = new ethers.Contract(contractaddress, mockERC20ABI, signer);
    const result = await mockPOP.balanceOf(address);
    console.log(`Balance of ${address}: `, utils.formatEther(result.toString()));
});

task("staking:getVoiceCredits", "get voice credit balance of address",)
  .addParam("contractaddress", "staking contract address")
  .addParam("address", "address to check balance of")
  .setAction(async (args, hre) => {
    const [signer] = await ethers.getSigners();
    const { contractaddress, address } = args;
    const Staking = new ethers.Contract(contractaddress, StakingABI, signer);
    const result = await Staking.getVoiceCredits(address);
    console.log(`Voice credits of ${address}: `, utils.formatEther(result.toString()));
});



/**
 * @type import('hardhat/config').HardhatUserConfig
 */

const INFURA_API_KEY = "c2bac3aa211441dc964995ef0cdb3629";

const RINKEBY_PRIVATE_KEY =
  "feb505930d1f94fdd7bd140aa7b3e5482c80df0a5d2a0b2d47c0b2ba96816624";

module.exports = {
  networks: {
  hardhat: {
    chainId: 1337
  },
},
  solidity: "0.7.3",
  networks: {
    rinkeby: {
      url: `https://rinkeby.infura.io/v3/${INFURA_API_KEY}`,
      accounts: [`0x${RINKEBY_PRIVATE_KEY}`],
    },
  },
};
