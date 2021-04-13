const { expect } = require("chai");
const { waffle } = require("hardhat");
const { parseEther } = require("ethers/lib/utils");
const provider = waffle.provider;

describe('Vault', function () {
  const DepositorInitial = parseEther("10000");
  let MockERC20
  let depositor, governance, treasury

  beforeEach(async function () {
    [depositor, governance, treasury] = await ethers.getSigners();

    MockERC20 = await ethers.getContractFactory("MockERC20");
    this.mockDai = await MockERC20.deploy("DAI", "DAI");
    await this.mockDai.mint(depositor.address, DepositorInitial);

    this.mockCrvUSDX = await MockERC20.deploy("crvUSDX", "crvUSDX");

    MockYearnV2Vault = await ethers.getContractFactory("MockYearnV2Vault");
    this.mockYearnVault = await MockYearnV2Vault.deploy(this.mockCrvUSDX.address);
    await this.mockYearnVault.setPricePerShare(parseEther("1.25"));

    MockCurveDepositZap = await ethers.getContractFactory("MockCurveDepositZap");
    this.mockCurveDepositZap = await MockCurveDepositZap.deploy(this.mockCrvUSDX.address, this.mockDai.address);

    Vault = await ethers.getContractFactory("Vault");
    this.Vault = await Vault.deploy(
      this.mockDai.address,
      this.mockCrvUSDX.address,
      this.mockYearnVault.address,
      this.mockCurveDepositZap.address
    );
    await this.Vault.deployed();
  });

  it("should be constructed with correct addresses", async function () {
    expect(await this.Vault.dai()).to.equal(this.mockDai.address);
    expect(await this.Vault.crvUsdx()).to.equal(this.mockCrvUSDX.address);
    expect(await this.Vault.yearnVault()).to.equal(this.mockYearnVault.address);
    expect(await this.Vault.curveDepositZap()).to.equal(this.mockCurveDepositZap.address);
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
      let amount = parseEther("10");
      await this.mockDai.connect(depositor).approve(this.Vault.address, amount);
      await this.Vault.connect(depositor).deposit(amount);
      expect(await this.mockDai.connect(depositor).balanceOf(this.Vault.address)).to.equal(amount);
    });

    it("reverts unapproved deposits", async function () {
      let amount = parseEther("10");
      await expect(this.Vault.connect(depositor).deposit(amount)).to.be.revertedWith("transfer amount exceeds allowance");
    });

    it("returns popDAI to depositor", async function () {
      let amount = parseEther("23");
      await this.mockDai.connect(depositor).approve(this.Vault.address, amount);
      await this.Vault.connect(depositor).deposit(amount);
      expect(await this.Vault.connect(depositor).balanceOf(depositor.address)).to.equal(amount);
    });

    xit("deposits DAI to the USDX Curve pool in exchange for crvUSDX", async function () {
      let amount = parseEther("31");
      await this.mockDai.connect(depositor).approve(this.Vault.address, amount);
      await this.Vault.connect(depositor).deposit(amount);
      expect(await this.mockCrvUSDX.connect(depositor).balanceOf(this.Vault.address)).to.equal(amount);
    });

    it("deposits crvUSDX to Yearn in exchange for yvUSDX", async function () {
      let amount = parseEther("20");
      let shares = amount / parseEther("1.25");
      await this.mockDai.connect(depositor).approve(this.Vault.address, amount);
      await this.Vault.connect(depositor).deposit(amount);
      expect(await this.mockYearnVault.connect(depositor).balanceOf(this.Vault.address)).to.equal(shares);
    });
  });

  describe("calculating total assets", async function () {
    it("total assets is DAI balance when Yearn balance is zero", async function () {
      let amount = parseEther("17");
      await this.mockDai.mint(this.Vault.address, amount);
      expect(await this.Vault.totalAssets()).to.equal(amount);
    });

    it("total assets is Yearn balance when DAI balance is zero", async function () {
      let amount = parseEther("37");
      await this.mockDai.connect(depositor).approve(this.Vault.address, amount);
      await this.Vault.connect(depositor).deposit(amount);
      expect(await this.Vault.totalAssets()).to.equal(amount);
    });

    it("total assets is sum of Yearn balance and DAI balance", async function () {
      let daiAmount = parseEther("11");
      let depositAmount  = parseEther("37");
      let total = parseEther("48");
      await this.mockDai.mint(this.Vault.address, daiAmount);
      await this.mockDai.connect(depositor).approve(this.Vault.address, depositAmount);
      await this.Vault.connect(depositor).deposit(depositAmount);
      expect(await this.Vault.totalAssets()).to.equal(total);
    });
  });

});
