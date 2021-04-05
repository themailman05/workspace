require("dotenv").config({ path: "../../.env" });
require("@nomiclabs/hardhat-waffle");
const { utils } = require("ethers");

task("accounts", "Prints the list of accounts", async () => {
  const accounts = await ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

task("POP:mint", "mint amount for recipient")
  .addParam("recipient", "address to receive POP")
  .addParam("amount", "amount to receive")
  .setAction(async (args, hre) => {
    const [signer] = await ethers.getSigners();
    const { recipient, amount } = args;
    const abi = require("./artifacts/contracts/mocks/MockERC20.sol/MockERC20.json").abi;
    const mockPOP = new ethers.Contract(
      process.env.ADDR_POP,
      abi,
      signer
    );
    const result = await mockPOP.mint(recipient, utils.parseEther(amount));
    console.log("Done: ", result);
  });

task("POP:balanceOf", "get balance of POP for address")
  .addParam("address", "amount to receive")
  .setAction(async (args, hre) => {
    const [signer] = await ethers.getSigners();
    const { address } = args;
    const mockPOP = new ethers.Contract(
      process.env.ADDR_POP,
      require("./artifacts/contracts/mocks/MockERC20.sol/MockERC20.json").abi,
      signer
    );
    const result = await mockPOP.balanceOf(address);
    console.log(
      `Balance of ${address}: `,
      utils.formatEther(result.toString())
    );
  });

task("staking:getVoiceCredits", "get voice credit balance of address")
  .addParam("address", "address to check balance of")
  .setAction(async (args, hre) => {
    const [signer] = await ethers.getSigners();
    const { address } = args;
    const Staking = new ethers.Contract(
      process.env.ADDR_STAKING,
      require("./artifacts/contracts/Staking.sol/Staking.json").abi,
      signer
    );
    const result = await Staking.getVoiceCredits(address);
    console.log(
      `Voice credits of ${address}: `,
      utils.formatEther(result.toString())
    );
  });

module.exports = {
  networks: {
    hardhat: {
      chainId: +process.env.CHAIN_ID,
    },
  },
  solidity: "0.7.3",
  // networks: {
  //   rinkeby: {
  //     url: process.env.RPC_URL,
  //     accounts: [`0x${process.env.PRIVATE_KEY}`],
  //   },
  // },
};
