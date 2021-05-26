import { expect } from "chai";
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
import { parseEther } from "@ethersproject/units";
const UniswapV2FactoryJSON = require("../artifactsUniswap/UniswapV2Factory.json");
const UniswapV2Router02JSON = require("../artifactsUniswap/UniswapV2Router.json");
const UniswapV2PairJSON = require("../artifactsUniswap/UniswapV2Pair.json");


const overrides = {
  gasLimit: 9999999,
};

let owner: SignerWithAddress,
  rewarder: SignerWithAddress,
  nonOwner: SignerWithAddress;
let contracts: contracts;
const provider = waffle.provider;

interface contracts {
  POP: MockERC20;
  WETH: WETH9;
  //Insurance: Contract;
  UniswapRouter: UniswapV2Router02;
  WETHPair: IUniswapV2Pair;
}

async function deployContracts(owner: SignerWithAddress): Promise<contracts> {
  const mockERC20Factory = await ethers.getContractFactory("MockERC20");
  const POP = (await mockERC20Factory.deploy("TestPOP", "TPOP")) as MockERC20;

  const WETH = (await (
    await (await ethers.getContractFactory("WETH9")).deploy()
  ).deployed()) as WETH9;
  /*const Insurance = await (
    await (await ethers.getContractFactory("mockInsurance")).deploy()
  ).deployed();

  const Treasury = await (
    await (await ethers.getContractFactory("mockTreasury")).deploy()
  ).deployed();*/

  const factoryV2 = await deployContract(owner, UniswapV2FactoryJSON,[owner.address]);

  const UniswapRouter = (await deployContract(
    owner,
    UniswapV2Router02JSON,
    [factoryV2.address, WETH.address],
    overrides
  )) as UniswapV2Router02;

  await factoryV2.createPair(WETH.address, POP.address);
  const WETHPairAddress = await factoryV2.getPair(WETH.address, POP.address);
  const WETHPair = new Contract(
    WETHPairAddress,
    JSON.stringify(UniswapV2PairJSON.abi),
    owner
  ) as IUniswapV2Pair;
  return { POP, WETH, UniswapRouter, WETHPair };
}

describe("Integration", function () {
  before(async function () {
    [owner, rewarder, nonOwner] = await ethers.getSigners();
    const currentBlockNumber = await provider.getBlockNumber();
    const currentTimestamp = await (
      await ethers.provider.getBlock(currentBlockNumber)
    ).timestamp;
    contracts = await deployContracts(owner);
    await contracts.POP.mint(owner.address, parseEther("10000"));
    await contracts.POP.connect(owner).approve(contracts.UniswapRouter.address, parseEther("10000"))
    await contracts.UniswapRouter.addLiquidityETH(
      contracts.POP.address,
      parseEther("100"),
      parseEther("100"),
      parseEther("1"),
      owner.address,
      currentTimestamp + 60,
      {...overrides, value:parseEther("1")}
    );
  });

  beforeEach(async function () {
    const balance = await contracts.WETH.balanceOf(owner.address);
    console.log(balance.toString());
  });

  describe("test", function () {
    it("test", async function () {
      console.log(await contracts.WETHPair.getReserves());
    });
  });
});

describe("Token", function () {
  let accounts: SignerWithAddress[];

  beforeEach(async function () {
    accounts = await ethers.getSigners();
  });

  it("should do something right", async function () {
    expect(0).to.equal(0);
  });
});
