import chai, {expect} from "chai";
import {
  IUniswapV2Pair,
  MockERC20,
  UniswapV2Router02,
  WETH9,
} from "../typechain";
import { Contract } from "@ethersproject/contracts";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { deployContract } from "ethereum-waffle";
import { ethers, waffle } from "hardhat";
import { getContractFactory } from "@nomiclabs/hardhat-ethers/types";
const IUniswapV2Factory = require("../artifacts/@uniswap/v2-core/contracts/interfaces/IUniswapV2Factory.sol/IUniswapV2Factory.json");
const IUniswapV2PairAbi = require("../artifacts/@uniswap/v2-core/contracts/interfaces/IUniswapV2Pair.sol/IUniswapV2Pair.json");
const IUniswapV2Router02 = require("../artifacts/@uniswap/v2-periphery/contracts/interfaces/IUniswapV2Router02.sol/IUniswapV2Router02.json");

const overrides = {
  gasLimit: 9999999,
};

//const waffle = hardhat.waffle
//const ethers = hardhat.ethers

let owner: SignerWithAddress,
  rewarder: SignerWithAddress,
  nonOwner: SignerWithAddress;
let contracts: contracts;
const provider = waffle.provider;

interface contracts {
  POP: MockERC20;
  WETH: WETH9;
  Insurance: Contract;
  UniswapRouter: UniswapV2Router02;
  WETHPair: IUniswapV2Pair;
}

async function deployContracts(owner: SignerWithAddress): Promise<contracts> {
  const POP = (await (
    await (await getContractFactory("mockPOP")).deploy()
  ).deployed()) as MockERC20;

  const WETH = (await (
    await (await getContractFactory("WETH9")).deploy()
  ).deployed()) as WETH9;

  const Insurance = await (
    await (await getContractFactory("mockInsurance")).deploy()
  ).deployed();

  const factoryV2 = await deployContract(owner, IUniswapV2Factory, [
    owner.address,
  ]);

  const UniswapRouter = (await deployContract(
    owner,
    IUniswapV2Router02,
    [factoryV2.address, WETH.address],
    overrides
  )) as UniswapV2Router02;

  await factoryV2.createPair(WETH.address, POP.address);
  const WETHPairAddress = await factoryV2.getPair(WETH.address, POP.address);
  const WETHPair = new Contract(
    WETHPairAddress,
    JSON.stringify(IUniswapV2PairAbi.abi),
    owner
  ) as IUniswapV2Pair;

  return { POP, WETH, Insurance, UniswapRouter, WETHPair };
}

describe("Integration", async function () {
  [owner, rewarder, nonOwner] = await ethers.getSigners();
  const currentBlockNumber = await provider.getBlockNumber();
  const currentTimestamp = await (
    await ethers.provider.getBlock(currentBlockNumber)
  ).timestamp;
  contracts = await deployContracts(owner);
  await contracts.UniswapRouter.addLiquidityETH(
    contracts.POP.address,
    10000,
    10000,
    1,
    owner.address,
    currentTimestamp + 60
  );
  expect(contracts.POP.address).to.equal(contracts.POP.address)
  
  beforeEach(async function () {
    const balance = await contracts.WETH.balanceOf(owner.address);
    console.log(balance.toString());
  });

  describe.only("test", function () {
    it("test", async function () {
      console.log(await contracts.WETHPair.getReserves());
    });
  });
});
