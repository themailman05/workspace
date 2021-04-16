const { expect } = require("chai");
const { waffle } = require("hardhat");
const { parseEther, parseUnits } = require("ethers/lib/utils");
const provider = waffle.provider;

describe('Vault', function () {
  const DepositorInitial = parseEther("100000");
  let MockERC20
  let depositor, depositor1, depositor2, depositor3, depositor4, depositor5, governance, treasury

  beforeEach(async function () {
    [depositor, depositor1, depositor2, depositor3, depositor4, depositor5, governance, treasury] = await ethers.getSigners();

    MockERC20 = await ethers.getContractFactory("MockERC20");
    this.mockDai = await MockERC20.deploy("DAI", "DAI");
    await this.mockDai.mint(depositor.address, DepositorInitial);
    await this.mockDai.mint(depositor1.address, DepositorInitial);
    await this.mockDai.mint(depositor2.address, DepositorInitial);

    this.mockCrvUSDX = await MockERC20.deploy("crvUSDX", "crvUSDX");

    MockYearnV2Vault = await ethers.getContractFactory("MockYearnV2Vault");
    this.mockYearnVault = await MockYearnV2Vault.deploy(this.mockCrvUSDX.address);

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
      let amount = parseEther("2000");
      await this.mockDai.connect(depositor).approve(this.Vault.address, amount);
      await this.Vault.connect(depositor).deposit(amount);
      expect(await this.mockYearnVault.connect(depositor).balanceOf(this.Vault.address)).to.equal(parseEther("2000"));
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

    it("tokens convert 1:1 on withdrawal when underlying Yearn vault value is unchanged", async function () {
      let deposit1Amount = parseEther("3000");

      await this.mockDai.connect(depositor1).approve(this.Vault.address, deposit1Amount);
      await this.Vault.connect(depositor1).deposit(deposit1Amount);

      expect(await this.Vault.balanceOf(depositor1.address)).to.equal(deposit1Amount);
      expect(await this.mockDai.balanceOf(depositor1.address)).to.equal(parseEther("97000"));
      let withdrawal1Amount = parseEther("1000");
      await this.Vault.connect(depositor1).withdraw(withdrawal1Amount);
      expect(await this.Vault.balanceOf(depositor1.address)).to.equal(parseEther("2000"));
      let depositor1DaiBalance = await this.mockDai.balanceOf(depositor1.address);
      expect(depositor1DaiBalance).to.equal(parseUnits("97999999999999999999000", "wei"));
    });

    it("tokens convert at higher rate on withdrawal when underlying Yearn vault value increases", async function () {
      let deposit1Amount = parseEther("3000");

      await this.mockDai.connect(depositor1).approve(this.Vault.address, deposit1Amount);
      await this.Vault.connect(depositor1).deposit(deposit1Amount);

      expect(await this.Vault.balanceOf(depositor1.address)).to.equal(deposit1Amount);
      expect(await this.mockDai.balanceOf(depositor1.address)).to.equal(parseEther("97000"));

      this.mockYearnVault.setTotalAssets(parseEther("6000"));
      let withdrawal1Amount = parseEther("1000");
      await this.Vault.connect(depositor1).withdraw(withdrawal1Amount);
      expect(await this.Vault.balanceOf(depositor1.address)).to.equal(parseEther("2000"));
      let depositor1DaiBalance = await this.mockDai.balanceOf(depositor1.address);
      expect(depositor1DaiBalance).to.equal(parseUnits("98999999999999999998000", "wei"));
    });

    it("handles multiple deposits", async function () {
      let deposit1Amount = parseEther("1000");
      let deposit2Amount = parseEther("2000");
      let deposit3Amount = parseEther("5000");
      let deposit4Amount = parseEther("3000");
      let deposit5Amount = parseEther("4000");
      let deposit6Amount = parseEther("5000");

      await this.mockDai.connect(depositor1).approve(this.Vault.address, deposit1Amount);
      await this.Vault.connect(depositor1).deposit(deposit1Amount);

      expect(await this.Vault.balanceOf(depositor1.address)).to.equal(parseEther("1000"));
      expect(await this.mockDai.balanceOf(depositor1.address)).to.equal(parseEther("99000"));

      await this.mockDai.connect(depositor1).approve(this.Vault.address, deposit2Amount);
      await this.Vault.connect(depositor1).deposit(deposit2Amount);

      expect(await this.Vault.balanceOf(depositor1.address)).to.equal(parseEther("3000"));
      expect(await this.mockDai.balanceOf(depositor1.address)).to.equal(parseEther("97000"));

      await this.mockDai.connect(depositor2).approve(this.Vault.address, deposit3Amount);
      await this.Vault.connect(depositor2).deposit(deposit3Amount);

      expect(await this.Vault.balanceOf(depositor2.address)).to.equal(parseEther("5000"));
      expect(await this.mockDai.balanceOf(depositor2.address)).to.equal(parseEther("95000"));

      await this.mockDai.connect(depositor1).approve(this.Vault.address, deposit4Amount);
      await this.Vault.connect(depositor1).deposit(deposit4Amount);

      expect(await this.Vault.balanceOf(depositor1.address)).to.equal(parseEther("6000"));
      expect(await this.mockDai.balanceOf(depositor1.address)).to.equal(parseEther("94000"));

      await this.mockDai.connect(depositor1).approve(this.Vault.address, deposit5Amount);
      await this.Vault.connect(depositor1).deposit(deposit5Amount);

      expect(await this.Vault.balanceOf(depositor1.address)).to.equal(parseEther("10000"));
      expect(await this.mockDai.balanceOf(depositor1.address)).to.equal(parseEther("90000"));

      await this.mockDai.connect(depositor2).approve(this.Vault.address, deposit6Amount);
      await this.Vault.connect(depositor2).deposit(deposit6Amount);

      expect(await this.Vault.balanceOf(depositor2.address)).to.equal(parseEther("10000"));
      expect(await this.mockDai.balanceOf(depositor2.address)).to.equal(parseEther("90000"));

      expect(await this.mockYearnVault.totalAssets()).to.equal(parseEther("20000"));
      this.mockYearnVault.setTotalAssets(parseEther("40000"));

      let withdrawal1Amount = parseEther("1000");
      await this.Vault.connect(depositor1).withdraw(withdrawal1Amount);
      expect(await this.Vault.balanceOf(depositor1.address)).to.equal(parseEther("9000"));
      let depositor1DaiBalance = await this.mockDai.balanceOf(depositor1.address);
      expect(depositor1DaiBalance).to.equal(parseUnits("91999999999999999999994", "wei"));

      let withdrawal2Amount = parseEther("10000");
      await this.Vault.connect(depositor2).withdraw(withdrawal2Amount);
      expect(await this.Vault.balanceOf(depositor2.address)).to.equal(parseEther("0"));
      let depositor2DaiBalance = await this.mockDai.balanceOf(depositor2.address);
      expect(depositor2DaiBalance).to.equal(parseUnits("109999999999999999979998", "wei"));

      let withdrawal3Amount = parseEther("9000");
      await this.Vault.connect(depositor1).withdraw(withdrawal3Amount);
      expect(await this.Vault.balanceOf(depositor1.address)).to.equal(parseEther("0"));
      let depositor1UpdatedDaiBalance = await this.mockDai.balanceOf(depositor1.address);
      expect(depositor1UpdatedDaiBalance).to.equal(parseUnits("110000000000000000020002", "wei"));
    });

    it("multiple small deposits", async function () {
      let deposit1Amount = parseEther("1000");
      for (let i=0; i<10; i++) {
        await this.mockDai.connect(depositor1).approve(this.Vault.address, deposit1Amount);
        await this.Vault.connect(depositor1).deposit(deposit1Amount);
      }

      expect(await this.Vault.balanceOf(depositor1.address)).to.equal(parseEther("10000"));
      expect(await this.mockDai.balanceOf(depositor1.address)).to.equal(parseEther("90000"));

      let deposit2Amount = parseEther("10000");
      await this.mockDai.connect(depositor2).approve(this.Vault.address, deposit2Amount);
      await this.Vault.connect(depositor2).deposit(deposit2Amount);

      expect(await this.Vault.balanceOf(depositor2.address)).to.equal(parseEther("10000"));
      expect(await this.mockDai.balanceOf(depositor2.address)).to.equal(parseEther("90000"));

      expect(await this.mockYearnVault.totalAssets()).to.equal(parseEther("20000"));
      this.mockYearnVault.setTotalAssets(parseEther("40000"));

      let withdrawal1Amount = parseEther("10000");
      await this.Vault.connect(depositor1).withdraw(withdrawal1Amount);
      expect(await this.Vault.balanceOf(depositor1.address)).to.equal(parseEther("0"));
      let depositor1DaiBalance = await this.mockDai.balanceOf(depositor1.address);
      expect(depositor1DaiBalance).to.equal(parseUnits("110000000000000000000000", "wei"));

      let withdrawal2Amount = parseEther("10000");
      await this.Vault.connect(depositor2).withdraw(withdrawal2Amount);
      expect(await this.Vault.balanceOf(depositor2.address)).to.equal(parseEther("0"));
      let depositor2DaiBalance = await this.mockDai.balanceOf(depositor2.address);
      expect(depositor2DaiBalance).to.equal(parseUnits("110000000000000000000000", "wei"));
    });

    it("multiple small withdrawals", async function () {
      let deposit1Amount = parseEther("10000");
      await this.mockDai.connect(depositor1).approve(this.Vault.address, deposit1Amount);
      await this.Vault.connect(depositor1).deposit(deposit1Amount);

      expect(await this.Vault.balanceOf(depositor1.address)).to.equal(parseEther("10000"));
      expect(await this.mockDai.balanceOf(depositor1.address)).to.equal(parseEther("90000"));

      let deposit2Amount = parseEther("10000");
      await this.mockDai.connect(depositor2).approve(this.Vault.address, deposit2Amount);
      await this.Vault.connect(depositor2).deposit(deposit2Amount);

      expect(await this.Vault.balanceOf(depositor2.address)).to.equal(parseEther("10000"));
      expect(await this.mockDai.balanceOf(depositor2.address)).to.equal(parseEther("90000"));

      expect(await this.mockYearnVault.totalAssets()).to.equal(parseEther("20000"));
      this.mockYearnVault.setTotalAssets(parseEther("40000"));

      let withdrawal1Amount = parseEther("1000");
      for (let i=0; i<10; i++) {
        await this.Vault.connect(depositor1).withdraw(withdrawal1Amount);
      }
      expect(await this.Vault.balanceOf(depositor1.address)).to.equal(parseEther("0"));
      let depositor1DaiBalance = await this.mockDai.balanceOf(depositor1.address);
      expect(depositor1DaiBalance).to.equal(parseUnits("109999999999999999930828", "wei"));

      let withdrawal2Amount = parseEther("10000");
      await this.Vault.connect(depositor2).withdraw(withdrawal2Amount);
      expect(await this.Vault.balanceOf(depositor2.address)).to.equal(parseEther("0"));
      let depositor2DaiBalance = await this.mockDai.balanceOf(depositor2.address);
      expect(depositor2DaiBalance).to.equal(parseUnits("110000000000000000069172", "wei"));
    });

    it("deposits at different magnitudes", async function () {
      let deposit1Amount = parseEther("1000");
      await this.mockDai.connect(depositor1).approve(this.Vault.address, deposit1Amount);
      await this.Vault.connect(depositor1).deposit(deposit1Amount);

      expect(await this.Vault.balanceOf(depositor1.address)).to.equal(deposit1Amount);
      expect(await this.mockDai.balanceOf(depositor1.address)).to.equal(parseEther("99000"));

      let deposit2Amount = parseEther("10000");
      await this.mockDai.connect(depositor2).approve(this.Vault.address, deposit2Amount);
      await this.Vault.connect(depositor2).deposit(deposit2Amount);

      expect(await this.Vault.balanceOf(depositor2.address)).to.equal(deposit2Amount);
      expect(await this.mockDai.balanceOf(depositor2.address)).to.equal(parseEther("90000"));

      let deposit3Amount = parseEther("100000");
      await this.mockDai.mint(depositor3.address, deposit3Amount);
      await this.mockDai.connect(depositor3).approve(this.Vault.address, deposit3Amount);
      await this.Vault.connect(depositor3).deposit(deposit3Amount);

      expect(await this.Vault.balanceOf(depositor3.address)).to.equal(deposit3Amount);
      expect(await this.mockDai.balanceOf(depositor3.address)).to.equal(parseEther("0"));

      let deposit4Amount = parseEther("1000000");
      await this.mockDai.mint(depositor4.address, deposit4Amount);
      await this.mockDai.connect(depositor4).approve(this.Vault.address, deposit4Amount);
      await this.Vault.connect(depositor4).deposit(deposit4Amount);

      expect(await this.Vault.balanceOf(depositor4.address)).to.equal(deposit4Amount);
      expect(await this.mockDai.balanceOf(depositor4.address)).to.equal(parseEther("0"));

      let deposit5Amount = parseEther("100000000");
      await this.mockDai.mint(depositor5.address, deposit5Amount);
      await this.mockDai.connect(depositor5).approve(this.Vault.address, deposit5Amount);
      await this.Vault.connect(depositor5).deposit(deposit5Amount);

      expect(await this.Vault.balanceOf(depositor5.address)).to.equal(deposit5Amount);
      expect(await this.mockDai.balanceOf(depositor5.address)).to.equal(parseEther("0"));

      expect(await this.mockYearnVault.totalAssets()).to.equal(parseEther("101111000"));
      this.mockYearnVault.setTotalAssets(parseEther("202222000"));

      let withdrawal1Amount = deposit1Amount;
      await this.Vault.connect(depositor1).withdraw(withdrawal1Amount);
      expect(await this.Vault.balanceOf(depositor1.address)).to.equal(parseEther("0"));
      let depositor1DaiBalance = await this.mockDai.balanceOf(depositor1.address);
      expect(depositor1DaiBalance).to.equal(parseUnits("100999999999999907021473", "wei"));

      let withdrawal2Amount = deposit2Amount;
      await this.Vault.connect(depositor2).withdraw(withdrawal2Amount);
      expect(await this.Vault.balanceOf(depositor2.address)).to.equal(parseEther("0"));
      let depositor2DaiBalance = await this.mockDai.balanceOf(depositor2.address);
      expect(depositor2DaiBalance).to.equal(parseUnits("109999999999999834880430", "wei"));

      let withdrawal3Amount = deposit3Amount;
      await this.Vault.connect(depositor3).withdraw(withdrawal3Amount);
      expect(await this.Vault.balanceOf(depositor3.address)).to.equal(parseEther("0"));
      let depositor3DaiBalance = await this.mockDai.balanceOf(depositor3.address);
      expect(depositor3DaiBalance).to.equal(parseUnits("199999999999999942451306", "wei"));

      let withdrawal4Amount = deposit4Amount;
      await this.Vault.connect(depositor4).withdraw(withdrawal4Amount);
      expect(await this.Vault.balanceOf(depositor4.address)).to.equal(parseEther("0"));
      let depositor4DaiBalance = await this.mockDai.balanceOf(depositor4.address);
      expect(depositor4DaiBalance).to.equal(parseUnits("1999999999999999803122917", "wei"));

      let withdrawal5Amount = deposit5Amount;
      await this.Vault.connect(depositor5).withdraw(withdrawal5Amount);
      expect(await this.Vault.balanceOf(depositor5.address)).to.equal(parseEther("0"));
      let depositor5DaiBalance = await this.mockDai.balanceOf(depositor5.address);
      expect(depositor5DaiBalance).to.equal(parseUnits("200000000000000000512523874", "wei"));
    });


  });

});
