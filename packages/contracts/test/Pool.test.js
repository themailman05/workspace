const { expect } = require("chai");
const { waffle } = require("hardhat");
const { parseEther, parseUnits } = require("ethers/lib/utils");
const provider = waffle.provider;

describe('Pool', function () {
  const DepositorInitial = parseEther("100000");
  let MockERC20
  let depositor, depositor1, depositor2, depositor3, depositor4, depositor5, rewardsManager

  beforeEach(async function () {
    [depositor, depositor1, depositor2, depositor3, depositor4, depositor5, rewardsManager] = await ethers.getSigners();

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

    Pool = await ethers.getContractFactory("Pool");
    this.Pool = await Pool.deploy(
      this.mockDai.address,
      this.mockCrvUSDX.address,
      this.mockYearnVault.address,
      this.mockCurveDepositZap.address,
      rewardsManager.address
    );
    await this.Pool.deployed();
  });

  it("should be constructed with correct addresses", async function () {
    expect(await this.Pool.dai()).to.equal(this.mockDai.address);
    expect(await this.Pool.crvLPToken()).to.equal(this.mockCrvUSDX.address);
    expect(await this.Pool.yearnVault()).to.equal(this.mockYearnVault.address);
    expect(await this.Pool.curveDepositZap()).to.equal(this.mockCurveDepositZap.address);
    expect(await this.Pool.rewardsManager()).to.equal(rewardsManager.address);
  });

  it("has a token name", async function () {
    expect(await this.Pool.name()).to.equal("Popcorn DAI Pool");
  });

  it("has a token symbol", async function () {
    expect(await this.Pool.symbol()).to.equal("popDAI");
  });

  it("uses 18 decimals", async function () {
    expect(await this.Pool.decimals()).to.equal(18);
  });

  describe("deposits", async function () {
    xit("accepts DAI deposits", async function () {
      let amount = parseEther("10");
      await this.mockDai.connect(depositor).approve(this.Pool.address, amount);
      await this.Pool.connect(depositor).deposit(amount);
      expect(await this.mockDai.connect(depositor).balanceOf(this.Pool.address)).to.equal(amount);
    });

    it("reverts unapproved deposits", async function () {
      let amount = parseEther("10");
      await expect(this.Pool.connect(depositor).deposit(amount)).to.be.revertedWith("transfer amount exceeds allowance");
    });

    it("returns popDAI to depositor", async function () {
      let amount = parseEther("23");
      await this.mockDai.connect(depositor).approve(this.Pool.address, amount);
      await this.Pool.connect(depositor).deposit(amount);
      expect(await this.Pool.connect(depositor).balanceOf(depositor.address)).to.equal(amount);
    });

    xit("deposits DAI to the USDX Curve pool in exchange for crvUSDX", async function () {
      let amount = parseEther("31");
      await this.mockDai.connect(depositor).approve(this.Pool.address, amount);
      await this.Pool.connect(depositor).deposit(amount);
      expect(await this.mockCrvUSDX.connect(depositor).balanceOf(this.Pool.address)).to.equal(amount);
    });

    it("deposits crvUSDX to Yearn in exchange for yvUSDX", async function () {
      let amount = parseEther("2000");
      await this.mockDai.connect(depositor).approve(this.Pool.address, amount);
      await this.Pool.connect(depositor).deposit(amount);
      expect(await this.mockYearnVault.connect(depositor).balanceOf(this.Pool.address)).to.equal(parseEther("2000"));
    });
  });

  describe("calculating total assets", async function () {
    it("total assets is Yearn balance * Yearn price per share", async function () {
      let amount = parseEther("3700");
      await this.mockDai.connect(depositor).approve(this.Pool.address, amount);
      await this.Pool.connect(depositor).deposit(amount);
      expect(await this.Pool.totalAssets()).to.equal(amount);
    });
  });

  describe("vault token accounting", async function () {
    it("depositor earns tokens 1:1 when vault is empty", async function () {
      let depositAmount  = parseEther("4300");
      await this.mockDai.connect(depositor).approve(this.Pool.address, depositAmount);
      await this.Pool.connect(depositor).deposit(depositAmount);
      expect(await this.Pool.balanceOf(depositor.address)).to.equal(depositAmount);
    });

    it("deposits emit an event", async function () {
      let depositAmount  = parseEther("4300");
      await this.mockDai.connect(depositor).approve(this.Pool.address, depositAmount);
      expect(await this.Pool.connect(depositor).deposit(depositAmount)).to
        .emit(this.Pool, "Deposit").withArgs(depositor.address, parseEther("4300"));
    });

    it("depositors earn tokens proportional to contributions", async function () {
      let deposit1Amount = parseEther("3000");
      let deposit2Amount = parseEther("7000");
      let deposit3Amount = parseEther("11000");

      await this.mockDai.connect(depositor1).approve(this.Pool.address, deposit1Amount);
      await this.Pool.connect(depositor1).deposit(deposit1Amount);

      await this.mockDai.connect(depositor2).approve(this.Pool.address, deposit2Amount);
      await this.Pool.connect(depositor2).deposit(deposit2Amount);
      await this.mockDai.connect(depositor2).approve(this.Pool.address, deposit3Amount);
      await this.Pool.connect(depositor2).deposit(deposit3Amount);

      expect(await this.Pool.balanceOf(depositor1.address)).to.equal(deposit1Amount);
      expect(await this.Pool.balanceOf(depositor2.address)).to.equal(deposit2Amount.add(deposit3Amount));
    });

    it("tokens convert 1:1 minus fees on withdrawal when underlying Yearn vault value is unchanged", async function () {
      let deposit1Amount = parseEther("3000");

      await this.mockDai.connect(depositor1).approve(this.Pool.address, deposit1Amount);
      await this.Pool.connect(depositor1).deposit(deposit1Amount);

      expect(await this.Pool.balanceOf(depositor1.address)).to.equal(deposit1Amount);
      expect(await this.mockDai.balanceOf(depositor1.address)).to.equal(parseEther("97000"));
      let withdrawal1Amount = parseEther("1000");

      await this.Pool.connect(depositor1).withdraw(withdrawal1Amount);
      expect(await this.Pool.balanceOf(depositor1.address)).to.equal(parseEther("2000"));

      let depositor1DaiBalance = await this.mockDai.balanceOf(depositor1.address);
      expect(depositor1DaiBalance).to.equal(parseUnits("97994999999999999999005", "wei"));
    });

    it("tokens convert at higher rate on withdrawal when underlying Yearn vault value increases", async function () {
      let deposit1Amount = parseEther("3000");

      await this.mockDai.connect(depositor1).approve(this.Pool.address, deposit1Amount);
      await this.Pool.connect(depositor1).deposit(deposit1Amount);

      expect(await this.Pool.balanceOf(depositor1.address)).to.equal(deposit1Amount);
      expect(await this.mockDai.balanceOf(depositor1.address)).to.equal(parseEther("97000"));

      this.mockYearnVault.setTotalAssets(parseEther("6000"));
      let withdrawal1Amount = parseEther("1000");
      await this.Pool.connect(depositor1).withdraw(withdrawal1Amount);
      expect(await this.Pool.balanceOf(depositor1.address)).to.equal(parseEther("2000"));
      let depositor1DaiBalance = await this.mockDai.balanceOf(depositor1.address);
      expect(depositor1DaiBalance).to.equal(parseUnits("98989999999999999998010", "wei"));
    });

    it("handles multiple deposits", async function () {
      let deposit1Amount = parseEther("1000");
      let deposit2Amount = parseEther("2000");
      let deposit3Amount = parseEther("5000");
      let deposit4Amount = parseEther("3000");
      let deposit5Amount = parseEther("4000");
      let deposit6Amount = parseEther("5000");

      await this.mockDai.connect(depositor1).approve(this.Pool.address, deposit1Amount);
      await this.Pool.connect(depositor1).deposit(deposit1Amount);

      expect(await this.Pool.balanceOf(depositor1.address)).to.equal(parseEther("1000"));
      expect(await this.mockDai.balanceOf(depositor1.address)).to.equal(parseEther("99000"));

      await this.mockDai.connect(depositor1).approve(this.Pool.address, deposit2Amount);
      await this.Pool.connect(depositor1).deposit(deposit2Amount);

      expect(await this.Pool.balanceOf(depositor1.address)).to.equal(parseEther("3000"));
      expect(await this.mockDai.balanceOf(depositor1.address)).to.equal(parseEther("97000"));

      await this.mockDai.connect(depositor2).approve(this.Pool.address, deposit3Amount);
      await this.Pool.connect(depositor2).deposit(deposit3Amount);

      expect(await this.Pool.balanceOf(depositor2.address)).to.equal(parseEther("5000"));
      expect(await this.mockDai.balanceOf(depositor2.address)).to.equal(parseEther("95000"));

      await this.mockDai.connect(depositor1).approve(this.Pool.address, deposit4Amount);
      await this.Pool.connect(depositor1).deposit(deposit4Amount);

      expect(await this.Pool.balanceOf(depositor1.address)).to.equal(parseEther("6000"));
      expect(await this.mockDai.balanceOf(depositor1.address)).to.equal(parseEther("94000"));

      await this.mockDai.connect(depositor1).approve(this.Pool.address, deposit5Amount);
      await this.Pool.connect(depositor1).deposit(deposit5Amount);

      expect(await this.Pool.balanceOf(depositor1.address)).to.equal(parseEther("10000"));
      expect(await this.mockDai.balanceOf(depositor1.address)).to.equal(parseEther("90000"));

      await this.mockDai.connect(depositor2).approve(this.Pool.address, deposit6Amount);
      await this.Pool.connect(depositor2).deposit(deposit6Amount);

      expect(await this.Pool.balanceOf(depositor2.address)).to.equal(parseEther("10000"));
      expect(await this.mockDai.balanceOf(depositor2.address)).to.equal(parseEther("90000"));

      expect(await this.mockYearnVault.totalAssets()).to.equal(parseEther("20000"));
      this.mockYearnVault.setTotalAssets(parseEther("40000"));

      let withdrawal1Amount = parseEther("1000");
      await this.Pool.connect(depositor1).withdraw(withdrawal1Amount);
      expect(await this.Pool.balanceOf(depositor1.address)).to.equal(parseEther("9000"));
      let depositor1DaiBalance = await this.mockDai.balanceOf(depositor1.address);
      expect(depositor1DaiBalance).to.equal(parseUnits("91989999999999999999995", "wei"));

      let withdrawal2Amount = parseEther("10000");
      await this.Pool.connect(depositor2).withdraw(withdrawal2Amount);
      expect(await this.Pool.balanceOf(depositor2.address)).to.equal(parseEther("0"));
      let depositor2DaiBalance = await this.mockDai.balanceOf(depositor2.address);
      expect(depositor2DaiBalance).to.equal(parseUnits("109899999999999999980099", "wei"));

      let withdrawal3Amount = parseEther("9000");
      await this.Pool.connect(depositor1).withdraw(withdrawal3Amount);
      expect(await this.Pool.balanceOf(depositor1.address)).to.equal(parseEther("0"));
      let depositor1UpdatedDaiBalance = await this.mockDai.balanceOf(depositor1.address);
      expect(depositor1UpdatedDaiBalance).to.equal(parseUnits("109900000000000000019903", "wei"));
    });

    it("multiple small deposits", async function () {
      let deposit1Amount = parseEther("1000");
      for (let i=0; i<10; i++) {
        await this.mockDai.connect(depositor1).approve(this.Pool.address, deposit1Amount);
        await this.Pool.connect(depositor1).deposit(deposit1Amount);
      }

      expect(await this.Pool.balanceOf(depositor1.address)).to.equal(parseEther("10000"));
      expect(await this.mockDai.balanceOf(depositor1.address)).to.equal(parseEther("90000"));

      let deposit2Amount = parseEther("10000");
      await this.mockDai.connect(depositor2).approve(this.Pool.address, deposit2Amount);
      await this.Pool.connect(depositor2).deposit(deposit2Amount);

      expect(await this.Pool.balanceOf(depositor2.address)).to.equal(parseEther("10000"));
      expect(await this.mockDai.balanceOf(depositor2.address)).to.equal(parseEther("90000"));

      expect(await this.mockYearnVault.totalAssets()).to.equal(parseEther("20000"));
      this.mockYearnVault.setTotalAssets(parseEther("40000"));

      let withdrawal1Amount = parseEther("10000");
      await this.Pool.connect(depositor1).withdraw(withdrawal1Amount);
      expect(await this.Pool.balanceOf(depositor1.address)).to.equal(parseEther("0"));
      let depositor1DaiBalance = await this.mockDai.balanceOf(depositor1.address);
      expect(depositor1DaiBalance).to.equal(parseUnits("109900000000000000000000", "wei"));

      let withdrawal2Amount = parseEther("10000");
      await this.Pool.connect(depositor2).withdraw(withdrawal2Amount);
      expect(await this.Pool.balanceOf(depositor2.address)).to.equal(parseEther("0"));
      let depositor2DaiBalance = await this.mockDai.balanceOf(depositor2.address);
      expect(depositor2DaiBalance).to.equal(parseUnits("109900000000000000000000", "wei"));
    });

    it("multiple small withdrawals", async function () {
      let deposit1Amount = parseEther("10000");
      await this.mockDai.connect(depositor1).approve(this.Pool.address, deposit1Amount);
      await this.Pool.connect(depositor1).deposit(deposit1Amount);

      expect(await this.Pool.balanceOf(depositor1.address)).to.equal(parseEther("10000"));
      expect(await this.mockDai.balanceOf(depositor1.address)).to.equal(parseEther("90000"));

      let deposit2Amount = parseEther("10000");
      await this.mockDai.connect(depositor2).approve(this.Pool.address, deposit2Amount);
      await this.Pool.connect(depositor2).deposit(deposit2Amount);

      expect(await this.Pool.balanceOf(depositor2.address)).to.equal(parseEther("10000"));
      expect(await this.mockDai.balanceOf(depositor2.address)).to.equal(parseEther("90000"));

      expect(await this.mockYearnVault.totalAssets()).to.equal(parseEther("20000"));
      this.mockYearnVault.setTotalAssets(parseEther("40000"));

      let withdrawal1Amount = parseEther("1000");
      for (let i=0; i<10; i++) {
        await this.Pool.connect(depositor1).withdraw(withdrawal1Amount);
      }
      expect(await this.Pool.balanceOf(depositor1.address)).to.equal(parseEther("0"));
      let depositor1DaiBalance = await this.mockDai.balanceOf(depositor1.address);
      expect(depositor1DaiBalance).to.equal(parseUnits("109899999999999999931179", "wei"));

      let withdrawal2Amount = parseEther("10000");
      await this.Pool.connect(depositor2).withdraw(withdrawal2Amount);
      expect(await this.Pool.balanceOf(depositor2.address)).to.equal(parseEther("0"));
      let depositor2DaiBalance = await this.mockDai.balanceOf(depositor2.address);
      expect(depositor2DaiBalance).to.equal(parseUnits("109900000000000000068827", "wei"));
    });

    it("deposits at different magnitudes", async function () {
      let deposit1Amount = parseEther("1000");
      await this.mockDai.connect(depositor1).approve(this.Pool.address, deposit1Amount);
      await this.Pool.connect(depositor1).deposit(deposit1Amount);

      expect(await this.Pool.balanceOf(depositor1.address)).to.equal(deposit1Amount);
      expect(await this.mockDai.balanceOf(depositor1.address)).to.equal(parseEther("99000"));

      let deposit2Amount = parseEther("10000");
      await this.mockDai.connect(depositor2).approve(this.Pool.address, deposit2Amount);
      await this.Pool.connect(depositor2).deposit(deposit2Amount);

      expect(await this.Pool.balanceOf(depositor2.address)).to.equal(deposit2Amount);
      expect(await this.mockDai.balanceOf(depositor2.address)).to.equal(parseEther("90000"));

      let deposit3Amount = parseEther("100000");
      await this.mockDai.mint(depositor3.address, deposit3Amount);
      await this.mockDai.connect(depositor3).approve(this.Pool.address, deposit3Amount);
      await this.Pool.connect(depositor3).deposit(deposit3Amount);

      expect(await this.Pool.balanceOf(depositor3.address)).to.equal(deposit3Amount);
      expect(await this.mockDai.balanceOf(depositor3.address)).to.equal(parseEther("0"));

      let deposit4Amount = parseEther("1000000");
      await this.mockDai.mint(depositor4.address, deposit4Amount);
      await this.mockDai.connect(depositor4).approve(this.Pool.address, deposit4Amount);
      await this.Pool.connect(depositor4).deposit(deposit4Amount);

      expect(await this.Pool.balanceOf(depositor4.address)).to.equal(deposit4Amount);
      expect(await this.mockDai.balanceOf(depositor4.address)).to.equal(parseEther("0"));

      let deposit5Amount = parseEther("100000000");
      await this.mockDai.mint(depositor5.address, deposit5Amount);
      await this.mockDai.connect(depositor5).approve(this.Pool.address, deposit5Amount);
      await this.Pool.connect(depositor5).deposit(deposit5Amount);

      expect(await this.Pool.balanceOf(depositor5.address)).to.equal(deposit5Amount);
      expect(await this.mockDai.balanceOf(depositor5.address)).to.equal(parseEther("0"));

      expect(await this.mockYearnVault.totalAssets()).to.equal(parseEther("101111000"));
      this.mockYearnVault.setTotalAssets(parseEther("202222000"));

      let withdrawal1Amount = deposit1Amount;
      expect(await this.Pool.connect(depositor1).withdraw(withdrawal1Amount)).to
        .emit(this.Pool, "WithdrawalFee").withArgs(
          rewardsManager.address,
          parseUnits("9999999999999535107", "wei")).and
        .emit(this.Pool, "Withdrawal").withArgs(
          depositor1.address,
          parseUnits("1989999999999907486366", "wei")
        );
      expect(await this.Pool.balanceOf(depositor1.address)).to.equal(parseEther("0"));
      let depositor1DaiBalance = await this.mockDai.balanceOf(depositor1.address);
      expect(depositor1DaiBalance).to.equal(parseUnits("100989999999999907486366", "wei"));

      let withdrawal2Amount = deposit2Amount;
      expect(await this.Pool.connect(depositor2).withdraw(withdrawal2Amount)).to
        .emit(this.Pool, "WithdrawalFee").withArgs(
          rewardsManager.address,
          parseUnits("99999999999999174402", "wei")).and
        .emit(this.Pool, "Withdrawal").withArgs(
          depositor2.address,
          parseUnits("19899999999999835706028", "wei")
        );
      expect(await this.Pool.balanceOf(depositor2.address)).to.equal(parseEther("0"));
      let depositor2DaiBalance = await this.mockDai.balanceOf(depositor2.address);
      expect(depositor2DaiBalance).to.equal(parseUnits("109899999999999835706028", "wei"));

      let withdrawal3Amount = deposit3Amount;
      expect(await this.Pool.connect(depositor3).withdraw(withdrawal3Amount)).to
        .emit(this.Pool, "WithdrawalFee").withArgs(
          rewardsManager.address,
          parseUnits("999999999999999712256", "wei")).and
        .emit(this.Pool, "Withdrawal").withArgs(
          depositor3.address,
          parseUnits("198999999999999942739050", "wei")
        );
      expect(await this.Pool.balanceOf(depositor3.address)).to.equal(parseEther("0"));
      let depositor3DaiBalance = await this.mockDai.balanceOf(depositor3.address);
      expect(depositor3DaiBalance).to.equal(parseUnits("198999999999999942739050", "wei"));

      let withdrawal4Amount = deposit4Amount;
      expect(await this.Pool.connect(depositor4).withdraw(withdrawal4Amount)).to
        .emit(this.Pool, "WithdrawalFee").withArgs(
          rewardsManager.address,
          parseUnits("9999999999999999015614", "wei")).and
        .emit(this.Pool, "Withdrawal").withArgs(
          depositor4.address,
          parseUnits("1989999999999999804107303", "wei")
        );
      expect(await this.Pool.balanceOf(depositor4.address)).to.equal(parseEther("0"));
      let depositor4DaiBalance = await this.mockDai.balanceOf(depositor4.address);
      expect(depositor4DaiBalance).to.equal(parseUnits("1989999999999999804107303", "wei"));

      let withdrawal5Amount = deposit5Amount;
      expect(await this.Pool.connect(depositor5).withdraw(withdrawal5Amount)).to
        .emit(this.Pool, "WithdrawalFee").withArgs(
          rewardsManager.address,
          parseUnits("1000000000000000002562619", "wei")).and
        .emit(this.Pool, "Withdrawal").withArgs(
          depositor5.address,
          parseUnits("199000000000000000509961255", "wei")
        );
      expect(await this.Pool.balanceOf(depositor5.address)).to.equal(parseEther("0"));
      let depositor5DaiBalance = await this.mockDai.balanceOf(depositor5.address);
      expect(depositor5DaiBalance).to.equal(parseUnits("199000000000000000509961255", "wei"));
    });
  });

  describe("reporting returns", async function () {
    it("last report is contract creation block for new vault", async function () {
      expect(await this.Pool.deployedAt()).to.equal(this.Pool.deployTransaction.blockNumber);
      expect(await this.Pool.lastReport()).to.equal(this.Pool.deployTransaction.blockNumber);
    });

    it("empty vault reports no gain or loss", async function () {
      expect(await this.Pool.gain()).to.equal(0);
      expect(await this.Pool.loss()).to.equal(0);
    });
  });

});
