const { expect } = require("chai");
const { waffle } = require("hardhat");
const { parseEther } = require("ethers/lib/utils");
const { merklize, makeElement, generateClaims } = require("../scripts/merkle.js");
const provider = waffle.provider;

describe('Vault', function () {
  const DepositorInitial = parseEther("100");
  const UniswapUSDXInitial = parseEther("100000");
  let MockERC20
  let depositor, governance, treasury

  beforeEach(async function () {
    [depositor, governance, treasury] = await ethers.getSigners();

    MockERC20 = await ethers.getContractFactory("MockERC20");
    this.mockDai = await MockERC20.deploy("DAI", "DAI");
    await this.mockDai.mint(depositor.address, DepositorInitial);

    this.mockUSDX = await MockERC20.deploy("USDX", "USDX");

    MockYearnV2Vault = await ethers.getContractFactory("MockYearnV2Vault");
    this.mockYearnVault = await MockYearnV2Vault.deploy(this.mockUSDX.address);

    MockUniswapRouter = await ethers.getContractFactory("MockUniswapV2Router02");
    this.mockUniswapRouter = await MockUniswapRouter.deploy();
    await this.mockUSDX.mint(this.mockUniswapRouter.address, UniswapUSDXInitial);

    Vault = await ethers.getContractFactory("Vault");
    this.Vault = await Vault.deploy(
      this.mockDai.address,
      this.mockUSDX.address,
      this.mockYearnVault.address,
      this.mockUniswapRouter.address
    );
    await this.Vault.deployed();
  });

  it("should be constructed with correct addresses", async function () {
    expect(await this.Vault.dai()).to.equal(this.mockDai.address);
    expect(await this.Vault.usdx()).to.equal(this.mockUSDX.address);
    expect(await this.Vault.yearnVault()).to.equal(this.mockYearnVault.address);
    expect(await this.Vault.uniswapRouter()).to.equal(this.mockUniswapRouter.address);
  });

  it("has a token name", async function () {
    expect(await this.Vault.name()).to.equal("Popcorn DAI Vault");
  });

  it("has a token symbol", async function () {
    expect(await this.Vault.symbol()).to.equal("popDAI");
  });

  it("uses 18 decimals", async function () {
    expect(await this.Vault.decimals()).to.equal(18);
  });

  describe("deposits", async function () {
    xit("accepts DAI deposits", async function () {
      await this.mockDai.connect(depositor).approve(this.Vault.address, 10);
      await this.Vault.connect(depositor).deposit(10);
      expect(await this.mockDai.connect(depositor).balanceOf(this.Vault.address)).to.equal(10);
    });

    it("reverts unapproved deposits", async function () {
      await expect(this.Vault.connect(depositor).deposit(10)).to.be.revertedWith("transfer amount exceeds allowance");
    });

    it("returns popDAI to depositor", async function () {
      await this.mockDai.connect(depositor).approve(this.Vault.address, 23);
      await this.Vault.connect(depositor).deposit(23);
      expect(await this.Vault.connect(depositor).balanceOf(depositor.address)).to.equal(23);
    });

    it("swaps DAI for USDX", async function () {
      await this.mockDai.connect(depositor).approve(this.Vault.address, 31);
      await this.Vault.connect(depositor).deposit(31);
      expect(await this.mockUSDX.connect(depositor).balanceOf(this.Vault.address)).to.equal(31);
    });
  });

  describe("calculating total assets", async function () {
    it("total assets is DAI balance when Yearn balance is zero", async function () {
      await this.mockDai.mint(this.Vault.address, 17);
      expect(await this.Vault.totalAssets()).to.equal(17);
    });

    xit("total assets is Yearn balance when DAI balance is zero", async function () {
    });

    xit("total assets is sum of Yearn balance and DAI balance", async function () {
    });
  });

});
