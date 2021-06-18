import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import {
  BlockLockHelper,
  DefendedHelper,
  MockCurveAddressProvider,
  MockCurveMetapool,
  MockCurveRegistry,
  MockERC20,
  MockYearnV1Vault,
  Pool,
} from "../typechain";
import { expect } from "chai";
import { waffle, ethers } from "hardhat";
import { parseEther } from "ethers/lib/utils";
import { BigNumber } from "ethers";

const provider = waffle.provider;

interface Contracts {
  mock3Crv: MockERC20;
  mockCrvUSDX: MockERC20;
  mockYearnVault: MockYearnV1Vault;
  mockCurveMetapool: MockCurveMetapool;
  mockCurveRegistry: MockCurveRegistry;
  mockCurveAddressProvider: MockCurveAddressProvider;
  pool: Pool;
  blockLockHelper: BlockLockHelper;
  defendedHelper: DefendedHelper;
}

const DepositorInitial = parseEther("100000");
let owner: SignerWithAddress,
  depositor: SignerWithAddress,
  depositor1: SignerWithAddress,
  depositor2: SignerWithAddress,
  depositor3: SignerWithAddress,
  depositor4: SignerWithAddress,
  depositor5: SignerWithAddress,
  rewardsManager: SignerWithAddress;
let contracts: Contracts;

async function deployContracts(): Promise<Contracts> {
  const MockERC20 = await ethers.getContractFactory("MockERC20");
  const mock3Crv = await (
    await MockERC20.deploy("3Crv", "3Crv", 18)
  ).deployed();
  await mock3Crv.mint(depositor.address, DepositorInitial);
  await mock3Crv.mint(depositor1.address, DepositorInitial);
  await mock3Crv.mint(depositor2.address, DepositorInitial);
  await mock3Crv.mint(depositor3.address, DepositorInitial);
  await mock3Crv.mint(depositor4.address, DepositorInitial);
  await mock3Crv.mint(depositor5.address, DepositorInitial);

  const mockCrvUSDX = await (
    await MockERC20.deploy("crvUSDX", "crvUSDX", 18)
  ).deployed();
  const MockYearnV1Vault = await ethers.getContractFactory("MockYearnV1Vault");
  const mockYearnVault = await (
    await MockYearnV1Vault.deploy(mockCrvUSDX.address)
  ).deployed();

  const MockCurveMetapool = await ethers.getContractFactory(
    "MockCurveMetapool"
  );
  const mockCurveMetapool = await (
    await MockCurveMetapool.deploy(mockCrvUSDX.address, mock3Crv.address)
  ).deployed();

  const MockCurveRegistry = await ethers.getContractFactory(
    "MockCurveRegistry"
  );
  const mockCurveRegistry = await (
    await MockCurveRegistry.deploy(mockCurveMetapool.address)
  ).deployed();

  const MockCurveAddressProvider = await ethers.getContractFactory(
    "MockCurveAddressProvider"
  );
  const mockCurveAddressProvider = await (
    await MockCurveAddressProvider.deploy(mockCurveRegistry.address)
  ).deployed();

  const Pool = await ethers.getContractFactory("Pool");
  const pool = await (
    await Pool.deploy(
      mock3Crv.address,
      mockYearnVault.address,
      mockCurveAddressProvider.address,
      rewardsManager.address
    )
  ).deployed();

  const Staking = await ethers.getContractFactory("Staking");
  const mockStaking = await waffle.deployMockContract(
    owner,
    Staking.interface.format() as any
  );

  const DefendedHelper = await ethers.getContractFactory("DefendedHelper");
  const defendedHelper = await (
    await DefendedHelper.deploy(
      mock3Crv.address,
      mockStaking.address,
      pool.address
    )
  ).deployed();

  await mock3Crv.mint(defendedHelper.address, DepositorInitial);

  const BlockLockHelper = await ethers.getContractFactory("BlockLockHelper");
  const blockLockHelper = await (
    await BlockLockHelper.deploy(pool.address, mock3Crv.address)
  ).deployed();

  await pool.approveContractAccess(blockLockHelper.address)

  return {
    mock3Crv,
    mockCrvUSDX,
    mockYearnVault,
    mockCurveMetapool,
    mockCurveRegistry,
    mockCurveAddressProvider,
    pool,
    blockLockHelper,
    defendedHelper,
  };
}

describe("Pool", function () {
  beforeEach(async function () {
    [
      owner,
      depositor,
      depositor1,
      depositor2,
      depositor3,
      depositor4,
      depositor5,
      rewardsManager,
    ] = await ethers.getSigners();
    contracts = await deployContracts();
  });

  describe("constructor", async function () {
    it("should be constructed with correct addresses", async function () {
      expect(await contracts.pool.threeCrv()).to.equal(
        contracts.mock3Crv.address
      );
      expect(await contracts.pool.curveAddressProvider()).to.equal(
        contracts.mockCurveAddressProvider.address
      );
      expect(await contracts.pool.rewardsManager()).to.equal(
        rewardsManager.address
      );
    });
  });
});
