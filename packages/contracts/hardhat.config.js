require("@nomiclabs/hardhat-waffle");
const { parseEther } = require("ethers/lib/utils");
const mockERC20ABI = require('./artifacts/contracts/mocks/MockERC20.sol/MockERC20.json').abi;

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
    const result = await mockPOP.mint(recipient, amount);
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
    console.log("Result: ", result.toNumber());
});


/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  networks: {
  hardhat: {
    chainId: 1337
  },
},
  solidity: "0.7.3",
};
