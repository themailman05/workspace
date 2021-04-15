const { expect } = require("chai");
const { waffle } = require("hardhat");
const { parseEther } = require("ethers/lib/utils");
const provider = waffle.provider;

describe('Vault', function () {
  const DepositorInitial = parseEther("100000");
  let MockERC20
  let depositor, depositor1, depositor2, governance, treasury

  beforeEach(async function () {
    [depositor, depositor1, depositor2, governance, treasury] = await ethers.getSigners();

    MockERC20 = await ethers.getContractFactory("MockERC20");
    this.mockDai = await MockERC20.deploy("DAI", "DAI");
    await this.mockDai.mint(depositor.address, DepositorInitial);
    await this.mockDai.mint(depositor1.address, DepositorInitial);
    await this.mockDai.mint(depositor2.address, DepositorInitial);

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
    it("total assets is Yearn balance * Yearn price per share", async function () {
      let amount = parseEther("3700");
      await this.mockDai.connect(depositor).approve(this.Vault.address, amount);
      await this.Vault.connect(depositor).deposit(amount);
      expect(await this.Vault.totalAssets()).to.equal(amount);
    });
  });

  describe("vault token accounting", async function () {
    it("depositor earns tokens 1:1 when vault is empty", async function () {
      let depositAmount  = parseEther("4300");
      await this.mockDai.connect(depositor).approve(this.Vault.address, depositAmount);
      await this.Vault.connect(depositor).deposit(depositAmount);
      expect(await this.Vault.balanceOf(depositor.address)).to.equal(depositAmount);
    });

    it("depositors earn tokens proportional to contributions", async function () {
      let deposit1Amount = parseEther("3000");
      let deposit2Amount = parseEther("7000");
      let deposit3Amount = parseEther("11000");

      await this.mockDai.connect(depositor1).approve(this.Vault.address, deposit1Amount);
      await this.Vault.connect(depositor1).deposit(deposit1Amount);

      await this.mockDai.connect(depositor2).approve(this.Vault.address, deposit2Amount);
      await this.Vault.connect(depositor2).deposit(deposit2Amount);
      await this.mockDai.connect(depositor2).approve(this.Vault.address, deposit3Amount);
      await this.Vault.connect(depositor2).deposit(deposit3Amount);

      expect(await this.Vault.balanceOf(depositor1.address)).to.equal(deposit1Amount);
      expect(await this.Vault.balanceOf(depositor2.address)).to.equal(deposit2Amount.add(deposit3Amount));
    });

    it("tokens convert 1:1 on withdrawal when Yearn share value is unchanged", async function () {
      let deposit1Amount = parseEther("3000");
      let deposit2Amount = parseEther("7000");
      let deposit3Amount = parseEther("11000");

      await this.mockDai.connect(depositor1).approve(this.Vault.address, deposit1Amount);
      await this.Vault.connect(depositor1).deposit(deposit1Amount);

      await this.mockDai.connect(depositor2).approve(this.Vault.address, deposit2Amount);
      await this.Vault.connect(depositor2).deposit(deposit2Amount);
      await this.mockDai.connect(depositor2).approve(this.Vault.address, deposit3Amount);
      await this.Vault.connect(depositor2).deposit(deposit3Amount);

      expect(await this.Vault.balanceOf(depositor1.address)).to.equal(deposit1Amount);
      expect(await this.Vault.balanceOf(depositor2.address)).to.equal(deposit2Amount.add(deposit3Amount));

      let withdrawal1Amount = parseEther("1000");
      let withdrawal2Amount = parseEther("4000");
      let withdrawal3Amount = parseEther("12000");

      await this.Vault.connect(depositor1).withdraw(withdrawal1Amount);
      await this.Vault.connect(depositor2).withdraw(withdrawal2Amount);
      await this.Vault.connect(depositor2).withdraw(withdrawal3Amount);

      expect(await this.Vault.balanceOf(depositor1.address)).to.equal(parseEther("2000"));
      expect(await this.mockDai.balanceOf(depositor1.address)).to.equal(parseEther("98000"));

      expect(await this.Vault.balanceOf(depositor2.address)).to.equal(parseEther("2000"));
      expect(await this.mockDai.balanceOf(depositor2.address)).to.equal(parseEther("98000"));
    });

    xit("tokens convert at higher rate  on withdrawal when Yearn share value increases", async function () {
      let deposit1Amount = parseEther("3000");
      let deposit2Amount = parseEther("7000");
      let deposit3Amount = parseEther("11000");

      await this.mockDai.connect(depositor1).approve(this.Vault.address, deposit1Amount);
      await this.Vault.connect(depositor1).deposit(deposit1Amount);

      await this.mockDai.connect(depositor2).approve(this.Vault.address, deposit2Amount);
      await this.Vault.connect(depositor2).deposit(deposit2Amount);
      await this.mockDai.connect(depositor2).approve(this.Vault.address, deposit3Amount);
      await this.Vault.connect(depositor2).deposit(deposit3Amount);

      expect(await this.Vault.balanceOf(depositor1.address)).to.equal(deposit1Amount);
      expect(await this.Vault.balanceOf(depositor2.address)).to.equal(deposit2Amount.add(deposit3Amount));

      await this.mockYearnVault.setPricePerShare(parseEther("2.5"));

      let withdrawal1Amount = parseEther("1000");
      let withdrawal2Amount = parseEther("4000");
      let withdrawal3Amount = parseEther("12000");

      await this.Vault.connect(depositor1).withdraw(withdrawal1Amount);
      await this.Vault.connect(depositor2).withdraw(withdrawal2Amount);
      await this.Vault.connect(depositor2).withdraw(withdrawal3Amount);

      expect(await this.Vault.balanceOf(depositor1.address)).to.equal(parseEther("2000"));
      expect(await this.mockDai.balanceOf(depositor1.address)).to.equal(parseEther("98000"));

      expect(await this.Vault.balanceOf(depositor2.address)).to.equal(parseEther("2000"));
      expect(await this.mockDai.balanceOf(depositor2.address)).to.equal(parseEther("98000"));
    });

  });

});
