require("dotenv").config();
require("@nomiclabs/hardhat-waffle");

task("accounts", "Prints the list of accounts", async (args, hre) => {
  const accounts = await ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
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
