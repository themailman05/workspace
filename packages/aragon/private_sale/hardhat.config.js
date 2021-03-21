require('dotenv').config();
require("@nomiclabs/hardhat-waffle");
require("@tenderly/hardhat-tenderly");

const INFURA_PROJECT_ID = process.env.INFURA_PROJECT_ID;
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const ETHERSCAN = process.env.ETHERSCAN;
const XDAI = process.env.XDAI;
const TENDERLY_USERNAME = process.env.TENDERLY_USERNAME;
const TENDERLY_PROJECT = process.env.TENDERLY_PROJECT



/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  solidity: {
    version: "0.7.0",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    local: {
      url: "http://127.0.0.1:8545",
      forking: {
        url: `https://mainet.infura.io/v3/${INFURA_PROJECT_ID}`,
      },
    },
    rinkeby: {
      url: `https://rinkeby.infura.io/v3/${INFURA_PROJECT_ID}`,
      accounts: [`0x${PRIVATE_KEY}`],
    },
    kovan: {
      url: `https://kovan.infura.io/v3/${INFURA_PROJECT_ID}`,
      accounts: [`0x${PRIVATE_KEY}`],
    },
    goerli: {
      url: `https://goerli.infura.io/v3/${INFURA_PROJECT_ID}`,
      accounts: [`0x${PRIVATE_KEY}`],
    },
    xdai: {
      url: `https://poa-xdai.gateway.pokt.network/v1/${XDAI}`,
      accounts: [`0x${PRIVATE_KEY}`],
    },
  },
  etherscan: {
    apiKey: ETHERSCAN,
  },
  tenderly: {
    username: TENDERLY_USERNAME,
    project: TENDERLY_PROJECT,
  },
};

