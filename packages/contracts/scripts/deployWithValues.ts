import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { ElectionTerm, ProposalType } from "@popcorn/contracts/adapters";
import { getBytes32FromIpfsHash } from "@popcorn/utils";
import bluebird from "bluebird";
import { deployContract } from "ethereum-waffle";
import { Contract, utils } from "ethers";
import { parseEther } from "ethers/lib/utils";
import { ShareType } from "../adapters/GrantElection/GrantElectionAdapter";

const UniswapV2FactoryJSON = require("../artifactsUniswap/UniswapV2Factory.json");
const UniswapV2Router02JSON = require("../artifactsUniswap/UniswapV2Router.json");
const UniswapV2PairJSON = require("../artifactsUniswap/UniswapV2Pair.json");

// This script creates two beneficiaries and one quarterly grant that they are both eligible for. Run this
// Run this instead of the normal deploy.js script

interface Contracts {
  beneficiaryRegistry: Contract;
  mockPop: Contract;
  staking: Contract;
  randomNumberConsumer: Contract;
  grantElections: Contract;
  beneficiaryVaults: Contract;
  rewardsManager: Contract;
  mock3CRV: Contract;
  uniswapFactory: Contract;
  uniswapRouter: Contract;
  uniswapPair: Contract;
  beneficiaryGovernance: Contract;
}

enum Vote {
  Yes,
  No,
}

const SECONDS_IN_DAY = 24 * 60 * 60;

const addressCidMap = {
  "0x70997970C51812dc3A010C7d01b50e0d17dc79C8":
    "QmSzq4gKUk9LhNNCFBVDbkkz26umqu63jx2dXNABBKcgJ9",
  "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC":
    "QmNY4QEKhnreDZHW3yiphXn765im5y8RCGrySKzRoXDPTB",
  "0x90F79bf6EB2c4f870365E785982E1f101E93b906":
    "QmZn2p7xrRxqVGhKAtqjMZSY1Z6pW7A6RD7DiK2xt4nYTB",
  "0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65":
    "QmUW6peidPvHtbH4P7VNUpPdfaJqv7nmURbpgMcnzUbTtY",
  "0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc":
    "QmVAur87rJCyGh2ja1Pg4smAqD6MzXtuTXxWkeCkKYrf3n",
  "0x976EA74026E726554dB657fA54763abd0C3a0aa9":
    "QmNu5LeMyvMkP2sTBZhesXp352ihJUmGTPVeRp42Y9caXJ",
  "0x14dC79964da2C08b23698B3D3cc7Ca32193d9955":
    "QmQ3WQK41BozEznephMEh4cwGsRsFuXjFQRM6himtu5kHq",
  "0x23618e81E3f5cdF7f54C3d65f7FBc0aBf5B21E8f":
    "QmRnnDnHnF8uv1oour3oU9s1GmKNggzdEqMJueZViAvSAa",
  "0xa0Ee7A142d267C1f36714E4a8F75612F20a79720":
    "QmdoFZ6DL49SVmXDBv1zpkCngvr6bU7SUgxLbkh6ZM9L2V",
  "0xBcd4042DE499D14e55001CcbB24a551F3b954096":
    "QmchtjJsFDWNzLj93gPND1WhYUUGKeznNR6ATUeuaW71uq",
  "0x71bE63f3384f5fb98995898A86B02Fb2426c5788":
    "QmYJ8KGfKo5iG8EbxZxvNoWiNuEMM4Hx5ok4paZ1F27G1w",
  "0xFABB0ac9d68B0B445fB7357272Ff202C5651694a":
    "QmTf7c3MaHsBR5rdT5CN3m3yZCuf1XkGxhV81GhJKxempA",
  "0x1CBd3b2770909D4e10f157cABC84C7264073C9Ec":
    "QmfQ2Ffxw5P6NoKkQvkRoN31mAd65Dp2UBfPMdgzCDCDDx",
  "0xdF3e18d64BC6A983f673Ab319CCaE4f1a57C7097":
    "QmVNQeMrLpvnizudP9kZquFSb28CmH9fHddEpdX7wyADxF",
  "0xcd3B766CCDd6AE721141F452C550Ca635964ce71":
    "QmTiSvXRwdGFvPMPtKMurh4FJnzq3bZzws63UuErirSMFq",
  "0x2546BcD3c84621e976D8185a91A922aE77ECEc30":
    "QmSLS4TKBM2M9tXv5CAdFqUQJ9wR8UjjyhtrUxtbRrXE9M",
  "0xbDA5747bFD65F08deb54cb465eB87D40e51B197E":
    "QmaisZuRUE1ndZGSzmvg4Uxr7nsi2ciQ1z9VoDCnpGRADt",
  "0xdD2FD4581271e230360230F9337D5c0430Bf44C0":
    "Qmc4qtSHikeYvy4WScJWXtUeX2g3Qf6fC4xoJaU3fugQwu",
  "0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199":
    "QmcCmaXA3E8nzcBrTejHHjT8svKh6cSTwhKbPNuRyM6uH5",
};

export default async function deploy(ethers): Promise<void> {
  const overrides = {
    gasLimit: 9999999,
  };
  let accounts: SignerWithAddress[];
  let bennies: SignerWithAddress[];
  let contracts: Contracts;
  let treasuryFund: SignerWithAddress;
  let insuranceFund: SignerWithAddress;

  const setSigners = async (): Promise<void> => {
    accounts = await ethers.getSigners();
    bennies = accounts.slice(1, 20);
    treasuryFund = accounts[18];
    insuranceFund = accounts[19];
  };

  const deployContracts = async (): Promise<void> => {
    console.log("deploying contracts ...");

    const beneficiaryRegistry = await (
      await (await ethers.getContractFactory("BeneficiaryRegistry")).deploy()
    ).deployed();

    const mockPop = await (
      await (
        await ethers.getContractFactory("MockERC20")
      ).deploy("TestPOP", "TPOP", 18)
    ).deployed();

    const mock3CRV = await (
      await (
        await ethers.getContractFactory("MockERC20")
      ).deploy("3CURVE", "3CRV", 18)
    ).deployed();

    const WETH = await (
      await (await ethers.getContractFactory("WETH9")).deploy()
    ).deployed();

    const staking = await (
      await (await ethers.getContractFactory("Staking")).deploy(mockPop.address)
    ).deployed();

    const uniswapFactory = await deployContract(
      accounts[0],
      UniswapV2FactoryJSON,
      [accounts[0].address]
    );
    const uniswapRouter = await deployContract(
      accounts[0],
      UniswapV2Router02JSON,
      [uniswapFactory.address, WETH.address],
      overrides
    );

    await uniswapFactory.createPair(mock3CRV.address, mockPop.address);
    const uniswapPairAddress = await uniswapFactory.getPair(
      mock3CRV.address,
      mockPop.address
    );
    const uniswapPair = new Contract(
      uniswapPairAddress,
      JSON.stringify(UniswapV2PairJSON.abi),
      accounts[0]
    );

    const beneficiaryVaults = await (
      await (
        await ethers.getContractFactory("BeneficiaryVaults")
      ).deploy(mockPop.address, beneficiaryRegistry.address)
    ).deployed();

    const rewardsManager = await (
      await (
        await ethers.getContractFactory("RewardsManager")
      ).deploy(
        mockPop.address,
        staking.address,
        treasuryFund.address,
        insuranceFund.address,
        beneficiaryVaults.address,
        uniswapRouter.address
      )
    ).deployed();

    await staking
      .connect(accounts[0])
      .setRewardsManager(rewardsManager.address);

    const randomNumberConsumer = await (
      await (
        await ethers.getContractFactory("RandomNumberConsumer")
      ).deploy(
        process.env.ADDR_CHAINLINK_VRF_COORDINATOR,
        process.env.ADDR_CHAINLINK_LINK_TOKEN,
        process.env.ADDR_CHAINLINK_KEY_HASH
      )
    ).deployed();

    const grantElections = await (
      await (
        await ethers.getContractFactory("GrantElections")
      ).deploy(
        staking.address,
        beneficiaryRegistry.address,
        beneficiaryVaults.address,
        randomNumberConsumer.address,
        mockPop.address,
        accounts[0].address
      )
    ).deployed();

    const beneficiaryGovernance = await (
      await (
        await ethers.getContractFactory("BeneficiaryGovernance")
      ).deploy(
        staking.address,
        beneficiaryRegistry.address,
        mockPop.address,
        accounts[0].address
      )
    ).deployed();

    contracts = {
      beneficiaryRegistry,
      mockPop,
      staking,
      randomNumberConsumer,
      grantElections,
      beneficiaryVaults,
      rewardsManager,
      mock3CRV,
      uniswapFactory,
      uniswapRouter,
      uniswapPair,
      beneficiaryGovernance,
    };
  };

  const giveBeneficiariesETH = async (): Promise<void> => {
    console.log("giving ETH to beneficiaries ...");
    await bluebird.map(
      bennies,
      async (beneficiary: SignerWithAddress) => {
        const balance = await ethers.provider.getBalance(beneficiary.address);
        if (balance.lt(parseEther(".01"))) {
          return accounts[0].sendTransaction({
            to: beneficiary.address,
            value: utils.parseEther(".02"),
          });
        }
      },
      { concurrency: 1 }
    );
  };

  const addBeneficiaryProposals = async (): Promise<void> => {
    console.log("adding beneficiaries proposals...");
    await bluebird.map(
      bennies.slice(0, 3),
      async (beneficiary) => {
        return contracts.beneficiaryGovernance
          .connect(beneficiary)
          .createProposal(
            beneficiary.address,
            getBytes32FromIpfsHash(addressCidMap[beneficiary.address]),
            0,
            { gasLimit: 3000000 }
          );
      },
      { concurrency: 1 }
    );
    console.log("reducing voting period to 0");
    await contracts.beneficiaryGovernance
      .connect(accounts[0])
      .setConfiguration(10, 2 * 86400, parseEther("2000"));

    console.log("adding proposals in veto period");
    await bluebird.map(
      bennies.slice(3, 6),
      async (beneficiary) => {
        return contracts.beneficiaryGovernance
          .connect(beneficiary)
          .createProposal(
            beneficiary.address,
            getBytes32FromIpfsHash(addressCidMap[beneficiary.address]),
            0,
            { gasLimit: 3000000 }
          );
      },
      { concurrency: 1 }
    );
    ethers.provider.send("evm_increaseTime", [10]);
    ethers.provider.send("evm_mine", []);

    console.log("reducing veto period to 0");
    await contracts.beneficiaryGovernance
      .connect(accounts[0])
      .setConfiguration(10, 0, parseEther("2000"));

    console.log("adding proposals in finalization period");
    await bluebird.map(
      bennies.slice(6, 10),
      async (beneficiary) => {
        return contracts.beneficiaryGovernance
          .connect(beneficiary)
          .createProposal(
            beneficiary.address,
            getBytes32FromIpfsHash(addressCidMap[beneficiary.address]),
            0,
            { gasLimit: 3000000 }
          );
      },
      { concurrency: 1 }
    );
    ethers.provider.send("evm_increaseTime", [10]);
    ethers.provider.send("evm_mine", []);
  };

  const addCompletedProposals = async (): Promise<void> => {
    console.log("adding completed nomination proposals...");
    await bluebird.map(
      bennies.slice(0, 6),
      async (beneficiary) => {
        return contracts.beneficiaryGovernance
          .connect(beneficiary)
          .createProposal(
            beneficiary.address,
            getBytes32FromIpfsHash(addressCidMap[beneficiary.address]),
            ProposalType.Nomination,
            { gasLimit: 3000000 }
          );
      },
      { concurrency: 1 }
    );
    console.log("adding completed takedown proposals...");
    await bluebird.map(
      bennies.slice(6, 12),
      async (beneficiary) => {
        return contracts.beneficiaryGovernance
          .connect(beneficiary)
          .createProposal(
            beneficiary.address,
            getBytes32FromIpfsHash(addressCidMap[beneficiary.address]),
            ProposalType.Takedown,
            { gasLimit: 3000000 }
          );
      },
      { concurrency: 1 }
    );
    console.log("voting on nomination proposals");
    await bluebird.map(bennies.slice(0, 6), async (x, i) => {
      await contracts.beneficiaryGovernance
        .connect(bennies[0])
        .vote(i, Vote.Yes);
      await contracts.beneficiaryGovernance
        .connect(bennies[1])
        .vote(i, Vote.Yes);
      await contracts.beneficiaryGovernance
        .connect(bennies[2])
        .vote(i, Vote.No);
    });
    console.log("voting on takedown proposals");
    await bluebird.map(bennies.slice(6, 12), async (x, i) => {
      await contracts.beneficiaryGovernance
        .connect(bennies[0])
        .vote(i + 6, Vote.Yes);
      await contracts.beneficiaryGovernance
        .connect(bennies[1])
        .vote(i + 6, Vote.Yes);
      await contracts.beneficiaryGovernance
        .connect(bennies[2])
        .vote(i + 6, Vote.No);
    });
    ethers.provider.send("evm_increaseTime", [4 * SECONDS_IN_DAY]);
    ethers.provider.send("evm_mine", []);
    console.log("finalise nomination/takedown proposals");
    await bluebird.map(
      bennies.slice(0, 12),
      async (x, i) => {
        await contracts.beneficiaryGovernance.connect(accounts[0]).finalize(i);
      },
      { concurrency: 1 }
    );
  };

  const addVetoProposals = async (): Promise<void> => {
    console.log("adding veto nomination proposals...");
    await bluebird.map(
      bennies.slice(12, 14),
      async (beneficiary) => {
        return contracts.beneficiaryGovernance
          .connect(beneficiary)
          .createProposal(
            beneficiary.address,
            getBytes32FromIpfsHash(addressCidMap[beneficiary.address]),
            ProposalType.Nomination,
            { gasLimit: 3000000 }
          );
      },
      { concurrency: 1 }
    );
    console.log("adding veto takedown proposals...");
    await bluebird.map(
      bennies.slice(14, 16),
      async (beneficiary) => {
        return contracts.beneficiaryGovernance
          .connect(beneficiary)
          .createProposal(
            beneficiary.address,
            getBytes32FromIpfsHash(addressCidMap[beneficiary.address]),
            ProposalType.Takedown,
            { gasLimit: 3000000 }
          );
      },
      { concurrency: 1 }
    );
    console.log("voting on nomination and takedown proposals");
    await bluebird.map(bennies.slice(12, 16), async (x, i) => {
      await contracts.beneficiaryGovernance
        .connect(bennies[0])
        .vote(i + 12, Vote.Yes);
      await contracts.beneficiaryGovernance
        .connect(bennies[1])
        .vote(i + 12, Vote.Yes);
      await contracts.beneficiaryGovernance
        .connect(bennies[2])
        .vote(i + 12, Vote.No);
    });

    ethers.provider.send("evm_increaseTime", [2 * SECONDS_IN_DAY]);
    ethers.provider.send("evm_mine", []);

    await bluebird.map(bennies.slice(12, 16), async (x, i) => {
      await contracts.beneficiaryGovernance
        .connect(bennies[3])
        .vote(i + 12, Vote.No);
      await contracts.beneficiaryGovernance
        .connect(bennies[4])
        .vote(i + 12, Vote.No);
    });
  };

  const addOpenProposals = async (): Promise<void> => {
    console.log("adding veto nomination proposals...");
    await bluebird.map(
      bennies.slice(16, 18),
      async (beneficiary) => {
        return contracts.beneficiaryGovernance
          .connect(beneficiary)
          .createProposal(
            beneficiary.address,
            getBytes32FromIpfsHash(addressCidMap[beneficiary.address]),
            ProposalType.Nomination,
            { gasLimit: 3000000 }
          );
      },
      { concurrency: 1 }
    );
    console.log("adding veto takedown proposals...");
    await bluebird.map(
      bennies.slice(18),
      async (beneficiary) => {
        return contracts.beneficiaryGovernance
          .connect(beneficiary)
          .createProposal(
            beneficiary.address,
            getBytes32FromIpfsHash(addressCidMap[beneficiary.address]),
            ProposalType.Takedown,
            { gasLimit: 3000000 }
          );
      },
      { concurrency: 1 }
    );
    console.log("voting on nomination and takedown proposals");
    await bluebird.map(bennies.slice(16), async (x, i) => {
      await contracts.beneficiaryGovernance
        .connect(bennies[0])
        .vote(i + 16, Vote.Yes);
      await contracts.beneficiaryGovernance
        .connect(bennies[1])
        .vote(i + 16, Vote.Yes);
      await contracts.beneficiaryGovernance
        .connect(bennies[2])
        .vote(i + 16, Vote.No);
    });
  };

  const addBeneficiariesToRegistry = async (
    bennies: SignerWithAddress[]
  ): Promise<void> => {
    console.log("adding beneficiaries to registry ...");
    await bluebird.map(
      bennies,
      async (beneficiary: SignerWithAddress) => {
        return contracts.beneficiaryRegistry.addBeneficiary(
          beneficiary.address,
          getBytes32FromIpfsHash(addressCidMap[beneficiary.address]),
          { gasLimit: 3000000 }
        );
      },
      { concurrency: 1 }
    );
  };

  const mintPOP = async (): Promise<void> => {
    console.log("giving everyone POP (yay!) ...");
    await bluebird.map(
      accounts,
      async (account) => {
        return contracts.mockPop.mint(account.address, parseEther("10000"));
      },
      { concurrency: 1 }
    );
    await bluebird.map(
      accounts,
      async (account) => {
        return contracts.mockPop
          .connect(account)
          .approve(contracts.grantElections.address, parseEther("10000"));
      },
      { concurrency: 1 }
    );
    await bluebird.map(
      accounts,
      async (account) => {
        return contracts.mockPop
          .connect(account)
          .approve(
            contracts.beneficiaryGovernance.address,
            parseEther("10000")
          );
      },
      { concurrency: 1 }
    );
  };

  const prepareUniswap = async (): Promise<void> => {
    console.log("Preparing Uniswap 3CRV-POP Pair...");
    const currentBlock = await ethers.provider.getBlock("latest");
    await contracts.mockPop.mint(accounts[0].address, parseEther("100000"));
    await contracts.mock3CRV.mint(accounts[0].address, parseEther("100000"));
    await contracts.mockPop
      .connect(accounts[0])
      .approve(contracts.uniswapRouter.address, parseEther("100000"));
    await contracts.mock3CRV
      .connect(accounts[0])
      .approve(contracts.uniswapRouter.address, parseEther("100000"));

    await contracts.uniswapRouter.addLiquidity(
      contracts.mockPop.address,
      contracts.mock3CRV.address,
      parseEther("100000"),
      parseEther("100000"),
      parseEther("100000"),
      parseEther("100000"),
      accounts[0].address,
      currentBlock.timestamp + 60
    );
  };

  const fundRewardsManager = async (): Promise<void> => {
    console.log("Funding RewardsManager...");
    await contracts.mockPop.mint(accounts[0].address, parseEther("5000"));
    await contracts.mock3CRV.mint(accounts[0].address, parseEther("10000"));
    await contracts.mockPop
      .connect(accounts[0])
      .transfer(contracts.rewardsManager.address, parseEther("10000"));
    await contracts.mock3CRV
      .connect(accounts[0])
      .transfer(contracts.rewardsManager.address, parseEther("5000"));
  };

  const registerBeneficiariesForElection = async (
    grantTerm,
    bennies
  ): Promise<void> => {
    console.log(`registering beneficiaries for election (${grantTerm}) ...`);
    const electionId = await contracts.grantElections.activeElections(
      grantTerm
    );
    await bluebird.map(
      bennies,
      async (beneficiary: SignerWithAddress) => {
        console.log(`registering ${beneficiary.address}`);
        return contracts.grantElections.registerForElection(
          beneficiary.address,
          electionId,
          { gasLimit: 3000000 }
        );
      },
      { concurrency: 1 }
    );
  };

  const initializeElection = async (
    electionTerm: ElectionTerm,
    beneficiaries: SignerWithAddress[]
  ): Promise<void> => {
    await contracts.grantElections.initialize(electionTerm);
    await registerBeneficiariesForElection(electionTerm, beneficiaries);
  };

  const stakePOP = async (): Promise<void> => {
    console.log("voters are staking POP ...");
    await bluebird.map(accounts, async (voter: SignerWithAddress) => {
      return contracts.staking
        .connect(voter)
        .stake(utils.parseEther("1000"), 86400 * 365 * 4);
    });
  };

  // TODO: Randomise voting
  const voteInElection = async (
    beneficiaries: SignerWithAddress[],
    voters: SignerWithAddress[],
    electionId: number
  ): Promise<void> => {
    await bluebird.map(
      voters,
      async (voter: SignerWithAddress) => {
        return contracts.grantElections.connect(voter).vote(
          beneficiaries.map((benny) => benny.address),
          [
            utils.parseEther("100"),
            utils.parseEther("200"),
            utils.parseEther("300"),
            utils.parseEther("350"),
          ],
          electionId
        );
      },
      { concurrency: 1 }
    );
  };

  const approveForStaking = async (): Promise<void> => {
    console.log("approving all accounts for staking ...");
    await bluebird.map(
      accounts,
      async (account) => {
        return contracts.mockPop
          .connect(account)
          .approve(contracts.staking.address, utils.parseEther("100000000"));
      },
      { concurrency: 1 }
    );
  };

  const logResults = async (): Promise<void> => {
    console.log({
      eligibleButNotRegistered: bennies.slice(18, 20).map((bn) => bn.address),
      contracts: {
        beneficiaryRegistry: contracts.beneficiaryRegistry.address,
        mockPop: contracts.mockPop.address,
        staking: contracts.staking.address,
        randomNumberConsumer: contracts.randomNumberConsumer.address,
        grantElections: contracts.grantElections.address,
      },
    });
    console.log(`
Paste this into your .env file:

ADDR_BENEFICIARY_REGISTRY=${contracts.beneficiaryRegistry.address}
ADDR_POP=${contracts.mockPop.address}
ADDR_STAKING=${contracts.staking.address}
ADDR_RANDOM_NUMBER=${contracts.randomNumberConsumer.address}
ADDR_BENEFICIARY_GOVERNANCE=${contracts.beneficiaryGovernance.address}
ADDR_GOVERNANCE=${accounts[0].address}
ADDR_GRANT_ELECTION=${contracts.grantElections.address}
ADDR_BENEFICIARY_VAULT=${contracts.beneficiaryVaults.address}
ADDR_REWARDS_MANAGER=${contracts.rewardsManager.address}
ADDR_UNISWAP_ROUTER=${contracts.uniswapRouter.address}
ADDR_3CRV=${contracts.mock3CRV.address}
    `);
  };

  await setSigners();
  await giveBeneficiariesETH();
  await deployContracts();
  await addBeneficiariesToRegistry(bennies.slice(6, 12));
  await addBeneficiariesToRegistry(bennies.slice(14, 16));
  await addBeneficiariesToRegistry(bennies.slice(18));
  await mintPOP();
  await approveForStaking();
  //await prepareUniswap();
  //await fundRewardsManager();
  await stakePOP();
  await contracts.beneficiaryRegistry.transferOwnership(
    contracts.beneficiaryGovernance.address
  );
  await addCompletedProposals();
  // Quarterly election completed
  await contracts.grantElections.connect(accounts[0]).setConfiguration(
    ElectionTerm.Quarterly,
    2,
    5,
    false, // VRF
    14 * SECONDS_IN_DAY,
    14 * SECONDS_IN_DAY,
    83 * SECONDS_IN_DAY,
    parseEther("100"),
    true,
    parseEther("2000"),
    true,
    ShareType.EqualWeight
  );
  await initializeElection(ElectionTerm.Quarterly, bennies.slice(0, 6));
  const electionId = await contracts.grantElections.activeElections(
    ElectionTerm.Quarterly
  );
  ethers.provider.send("evm_increaseTime", [14 * SECONDS_IN_DAY]);
  ethers.provider.send("evm_mine", []);
  await contracts.grantElections.refreshElectionState(electionId);
  await voteInElection(bennies.slice(0, 4), accounts.slice(0, 5), electionId);
  // Yearly is in voting period
  await initializeElection(ElectionTerm.Yearly, bennies.slice(0, 6));
  const electionIdYearly = await contracts.grantElections.activeElections(
    ElectionTerm.Yearly
  );
  ethers.provider.send("evm_increaseTime", [30 * SECONDS_IN_DAY]);
  ethers.provider.send("evm_mine", []);
  await contracts.grantElections.refreshElectionState(electionId);
  await contracts.grantElections.refreshElectionState(electionIdYearly);
  await voteInElection(
    bennies.slice(0, 4),
    accounts.slice(0, 5),
    electionIdYearly
  );
  // Monthly in registration phase
  await initializeElection(ElectionTerm.Monthly, bennies.slice(0, 6));
  await addVetoProposals();
  await addOpenProposals();

  await logResults();
}
