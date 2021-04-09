const { expect } = require("chai");
const { waffle } = require("hardhat");
const { parseEther } = require("ethers/lib/utils");
const { merklize, makeElement, generateClaims } = require("../scripts/merkle.js");
const provider = waffle.provider;

describe('Vault', function () {
  const DepositorInitial = parseEther("100");
  let MockERC20
  let depositor, governance, treasury

  beforeEach(async function () {
    [depositor, governance, treasury] = await ethers.getSigners();

    MockERC20 = await ethers.getContractFactory("MockERC20");
    this.mockDai = await MockERC20.deploy("DAI", "DAI");
    await this.mockDai.mint(depositor.address, DepositorInitial);

    this.mockUSDX = await MockERC20.deploy("USDX", "USDX");

    MockYearnV2Vault = await ethers.getContractFactory("MockYearnV2Vault");
    this.mockYearnVault = await MockYearnV2Vault.deploy();

    MockUniswapRouter = await ethers.getContractFactory("MockUniswapV2Router02");
    this.mockUniswapRouter = await MockUniswapRouter.deploy();

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

  it("accepts DAI deposits", async function () {
    await this.mockDai.connect(depositor).approve(this.Vault.address, 10);
    await this.Vault.connect(depositor).deposit(10);
    expect(await this.mockDai.connect(depositor).balanceOf(this.Vault.address)).to.equal(10);
  });

  it("reverts unapproved deposits", async function () {
    await expect(this.Vault.connect(depositor).deposit(10)).to.be.revertedWith("transfer amount exceeds allowance");
  });

});
