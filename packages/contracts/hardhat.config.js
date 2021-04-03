require("@nomiclabs/hardhat-waffle");

task("accounts", "Prints the list of accounts", async () => {
  const accounts = await ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

/**
 * @type import('hardhat/config').HardhatUserConfig
 */

const INFURA_API_KEY = "c2bac3aa211441dc964995ef0cdb3629";

const RINKEBY_PRIVATE_KEY =
  "feb505930d1f94fdd7bd140aa7b3e5482c80df0a5d2a0b2d47c0b2ba96816624";

module.exports = {
  solidity: "0.7.3",
  networks: {
    rinkeby: {
      url: `https://rinkeby.infura.io/v3/${INFURA_API_KEY}`,
      accounts: [`0x${RINKEBY_PRIVATE_KEY}`],
    },
  },
};
