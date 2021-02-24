const { expect } = require("chai");
const { waffle } = require("hardhat");
const { merklize, makeElement, generateClaims } = require("../scripts/merkle.js");
const provider = waffle.provider;

describe('RewardsManager', function () {
  const VaultStatus = { "Initialized": 0, "Open": 1, "Closed": 2 };
  let owner, beneficiary1, beneficiary2;
  let claims, merkleTree, merkleRoot;

  beforeEach(async function () {
    [owner, beneficiary1, beneficiary2] = await ethers.getSigners();

    let MockERC20 = await ethers.getContractFactory("MockERC20");
    this.pop = await MockERC20.deploy("TestPOP", "TPOP");
    await this.pop.mint(owner.address, "100000000000");

    let RewardsManager = await ethers.getContractFactory("RewardsManager");
    this.rewards = await RewardsManager.deploy(this.pop.address);

    claims = generateClaims(await provider.listAccounts());
    merkleTree = merklize(claims);
    merkleRoot = "0x" + merkleTree.getRoot().toString("hex");
  });

  it("should be constructed with POP token", async function () {
    expect(await this.rewards.pop()).to.equal(this.pop.address);
  });

  it("reverts deposit with no transfer approval", async function () {
    await expect(this.rewards.depositReward(100)).to.be.revertedWith("ERC20: transfer amount exceeds allowance");
  });

  it("reverts deposit with no open vaults", async function () {
    await this.pop.approve(this.rewards.address, 100);
    await expect(this.rewards.depositReward(100)).to.be.revertedWith("No open vaults");
  });

  it("reverts when trying to get uninitialized vault", async function () {
    await expect(this.rewards.getVault(0)).to.be.revertedWith("Uninitialized vault slot");
  });

  it("reverts when trying to get invalid vault", async function () {
    await expect(this.rewards.getVault(4)).to.be.revertedWith("Invalid vault id");
  });

  it("reverts when trying to initialize an invalid vault id", async function () {
    const currentBlock = (await provider.getBlock("latest")).number;
    await expect(this.rewards.initializeVault(4, currentBlock + 1, merkleRoot)).to.be.revertedWith("Invalid vault id");
  });

  it("reverts when trying to initialize an invalid end block", async function () {
    const currentBlock = (await provider.getBlock("latest")).number;
    await expect(this.rewards.initializeVault(0, currentBlock, merkleRoot)).to.be.revertedWith("Invalid end block");
  });

  describe("vault is initialized", function () {
    beforeEach(async function () {
      currentBlock = (await provider.getBlock("latest")).number;
      endBlock = currentBlock + 100;
      await this.rewards.initializeVault(0, endBlock, merkleRoot);
    });

    it("vault has expected values", async function () {
      let vaultData = await this.rewards.getVault(0);
      expect(vaultData.balance, 0);
      expect(vaultData.unclaimedShare, 100);
      expect(vaultData.merkleRoot, merkleRoot);
      expect(vaultData.endBlock, endBlock);
      expect(vaultData.status, VaultStatus.Initialized);
    });
  });
});
