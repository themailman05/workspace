const { task } = require("hardhat/config");
const privateSaleABI = require('./artifacts/contracts/PrivateSale.sol/PrivateSale.json').abi;
const mockERC20ABI = require('./artifacts/contracts/mocks/MockERC20.sol/MockERC20.json').abi;
const { parseFixed } = require('@ethersproject/bignumber');

require("dotenv").config();
require("@nomiclabs/hardhat-waffle");

task("accounts", "Prints the list of accounts", async (args, hre) => {
  const accounts = await ethers.getSigners();
  for (const account of accounts) {
    console.log(account.address);
  }
});

task("sale:allow", "Allow address and amount",)
  .addParam("privatesaleaddress", "address of private sale contract")
  .addParam("participant", "address to allow")
  .addParam("amount", "amount to allow for address")
  .setAction(async (args, hre) => {
    const [signer] = await ethers.getSigners();
    const { privatesaleaddress, participant, amount } = args;
    const privateSale = new ethers.Contract(privatesaleaddress, privateSaleABI, signer);
    const result = await privateSale.allowParticipant(participant, parseFixed(amount, 6));
    console.log("Done: ", result);
});

task("POPUSDC:mint", "Allow address and amount",)
  .addParam("contractaddress", "mock usdc contract address")
  .addParam("recipient", "address to receive POPUSDC")
  .addParam("amount", "amount to receive")
  .setAction(async (args, hre) => {
    const [signer] = await ethers.getSigners();
    const { contractaddress, recipient, amount } = args;
    const mockUSDC = new ethers.Contract(contractaddress, mockERC20ABI, signer);
    const result = await mockUSDC.mint(recipient, parseFixed(amount, 6));
    console.log("Done: ", result);
});

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  defaultNetwork: "hardhat",
  solidity: {
    version: "0.7.3",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  networks: {
    rinkeby: {
      url: process.env.RINKEBY_PROVIDER || "",
      accounts: { mnemonic: process.env.RINKEBY_MNEMONIC || "" }
    }
  }
};
