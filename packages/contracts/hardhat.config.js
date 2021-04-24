require('../utils/src/envLoader');
require("@nomiclabs/hardhat-waffle");
const { deploy } = require("./scripts/deployWithValues");
const { deployPrivateSale } = require("./scripts/deployPrivateSale");
const { parseFixed, formatFixed } =  require('@ethersproject/bignumber');


const {
  GrantElectionAdapter,
} = require("./scripts/helpers/GrantElectionAdapter");
const { utils } = require("ethers");
const { parseEther } = require("@ethersproject/units");

task("accounts", "Prints the list of accounts", async (args, hre) => {
  const accounts = await ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

task("dev:deploy").setAction(async (args) => {
  await deploy(ethers);
});

task("dev:deployPrivateSale").setAction(async (args, hre) => {
  await deployPrivateSale(ethers, hre);
});

task("elections:getElectionMetadata")
  .addParam("term", "grant term (int)")
  .setAction(async (args) => {
    const [signer] = await ethers.getSigners();
    const contract = new ethers.Contract(
      process.env.ADDR_GRANT_ELECTION,
      require("./artifacts/contracts/GrantElections.sol/GrantElections.json").abi,
      signer
    );
    console.log(
      await GrantElectionAdapter(contract).getElectionMetadata(
        Number(args.term)
      )
    );
  });

task("elections:refreshElectionState")
  .addParam("term", "grant term (int)")
  .setAction(async (args) => {
    const [signer] = await ethers.getSigners();
    const contract = new ethers.Contract(
      process.env.ADDR_GRANT_ELECTION,
      require("./artifacts/contracts/GrantElections.sol/GrantElections.json").abi,
      signer
    );
    await contract.refreshElectionState(Number(args.term));
    console.log(
      await GrantElectionAdapter(contract).getElectionMetadata(
        Number(args.term)
      )
    );
  });

task("POP:mint", "mint amount for recipient")
  .addParam("recipient", "address to receive POP")
  .addParam("amount", "amount to receive")
  .setAction(async (args, hre) => {
    const [signer] = await ethers.getSigners();
    const { recipient, amount } = args;
    const mockPOP = new ethers.Contract(
      process.env.ADDR_POP,
      require("./artifacts/contracts/mocks/MockERC20.sol/MockERC20.json").abi,
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

task("elections:finalize", "finalize a grant election")
  .addParam("term", "election term to end")
  .setAction(async (args, hre) => {
    const [signer] = await ethers.getSigners();
    const { term } = args;
    const GrantElections = new ethers.Contract(
      process.env.ADDR_GRANT_ELECTION,
      require("./artifacts/contracts/GrantElections.sol/GrantElections.json").abi,
      signer
    );
    await GrantElections.finalize(Number(term), { gasLimit: 10000000 });
  });

task("random", "gets a random number")
  .addParam("seed", "the seed")
  .setAction(async (args, hre) => {
    const [signer] = await ethers.getSigners();
    const { seed } = args;
    const RandomNumberConsumer = new ethers.Contract(
      process.env.ADDR_RANDOM_NUMBER,
      require("./artifacts/contracts/RandomNumberConsumer.sol/RandomNumberConsumer.json").abi,
      signer
    );
    await RandomNumberConsumer.getRandomNumber(Number(seed));
    console.log(`Random number ${await RandomNumberConsumer.randomResult()}`);
  });

task("sale:allow", "Allow address and amount")
  .addParam("participant", "address to allow")
  .addParam("amount", "amount to allow for address")
  .setAction(async (args, hre) => {
    const [signer] = await ethers.getSigners();
    const { participant, amount } = args;
    const privateSale = new ethers.Contract(
      process.env.ADDR_PRIVATE_SALE,
      require("./artifacts/contracts/PrivateSale.sol/PrivateSale.json").abi,
      signer
    );
    const result = await privateSale.allowParticipant(
      participant,
      parseFixed(amount, 6)
    );
    console.log("Done: ", result);
  });

  task("sale:setsupply", "set supply amount address and amount")
  .addParam("amount", "amount of supply")
  .setAction(async (args, hre) => {
    const [signer] = await ethers.getSigners();
    const {  amount } = args;
    const privateSale = new ethers.Contract(
      process.env.ADDR_PRIVATE_SALE,
      require("./artifacts/contracts/PrivateSale.sol/PrivateSale.json").abi,
      signer
    );
    const result = await privateSale.setSupply(
      parseEther(amount)
    );
    console.log("Done: ", result);
  });

task("POPUSDC:mint", "Allow address and amount")
  .addParam("recipient", "address to receive POPUSDC")
  .addParam("amount", "amount to receive")
  .setAction(async (args, hre) => {
    const [signer] = await ethers.getSigners();
    const { recipient, amount } = args;
    const mockUSDC = new ethers.Contract(
      process.env.ADDR_USDC,
      require("./artifacts/contracts/mocks/MockERC20.sol/MockERC20.json").abi,
      signer
    );
    const result = await mockUSDC.mint(recipient, parseFixed(amount, 6));
    console.log("Done: ", result);
  });

  task("sale:info", "get private sale info")
  .addOptionalParam("participant", "participant to check")
  .setAction(async (args, hre) => {
    const [signer] = await ethers.getSigners();
    const privateSale = new ethers.Contract(
      process.env.ADDR_PRIVATE_SALE,
      require("./artifacts/contracts/PrivateSale.sol/PrivateSale.json").abi,
      signer
    );
    let participant, allowance;
    if (args.participant) {
      allowance = formatFixed(await privateSale.allowances(args.participant), 6);
      participant = await privateSale.participants(args.participant);
    }

    const info = { 
      treasury: await privateSale.treasury(),
      usdc: await privateSale.usdc(),
      pop: await privateSale.pop(),
      tokenManager: await privateSale.tokenManager(),
      supply: utils.formatEther(await privateSale.supply()),
    }

    
    if (args.participant) {
      console.log("Done: ", {...info, participant, allowance });
    } else {
      console.log("Done: ", { info});
    }
  });

module.exports = {
  solidity: {
    version: "0.7.3",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    mainnet: {
      chainId: 1,
      url: process.env.RPC_URL,
      accounts: [process.env.PRIVATE_KEY]
    },
    hardhat: {
      chainId: +process.env.CHAIN_ID,
    },
    rinkeby: {
      url: process.env.RPC_URL,
      accounts: [process.env.PRIVATE_KEY]
        .concat(
          (process.env.BENEFICIARY_PRIVATE_KEYS &&
            process.env.BENEFICIARY_PRIVATE_KEYS.split(",")) ||
            []
        )
        .concat(
          (process.env.VOTER_PRIVATE_KEY && [process.env.VOTER_PRIVATE_KEY]) ||
            []
        ),
    },
  },
};
