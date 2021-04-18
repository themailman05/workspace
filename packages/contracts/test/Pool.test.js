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
      expect(await this.Pool.connect(depositor).balanceOf(depositor.address)).to.equal(parseEther("22.54"));
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
    it("total assets is Yearn balance * Yearn price per share - slippage from conversion to DAI", async function () {
      let amount = parseEther("3700");
      await this.mockDai.connect(depositor).approve(this.Pool.address, amount);
      await this.Pool.connect(depositor).deposit(amount);
      expect(await this.Pool.totalValue()).to.equal(parseUnits("3696300000000000000000", "wei"));
    });
  });

  describe("vault token accounting", async function () {
    it("depositor earns tokens equal to 98% of deposit when vault is empty", async function () {
      let depositAmount  = parseEther("4300");
      await this.mockDai.connect(depositor).approve(this.Pool.address, depositAmount);
      await this.Pool.connect(depositor).deposit(depositAmount);
      expect(await this.Pool.balanceOf(depositor.address)).to.equal(parseEther("4214"));
    });

    it("pool holds tokens equal to 2% of deposit when vault is empty", async function () {
      let depositAmount  = parseEther("4300");
      await this.mockDai.connect(depositor).approve(this.Pool.address, depositAmount);
      await this.Pool.connect(depositor).deposit(depositAmount);
      expect(await this.Pool.balanceOf(this.Pool.address)).to.equal(parseEther("86"));
    });

    it("deposits emit an event", async function () {
      let depositAmount  = parseEther("4300");
      await this.mockDai.connect(depositor).approve(this.Pool.address, depositAmount);
      expect(await this.Pool.connect(depositor).deposit(depositAmount)).to
        .emit(this.Pool, "Deposit").withArgs(depositor.address, parseEther("4300"), parseEther("4214"));
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

      expect(await this.Pool.balanceOf(depositor1.address)).to.equal(parseEther("2940"));
      expect(await this.Pool.balanceOf(depositor2.address)).to.equal(parseEther("17640"));
    });

    it("tokens convert 1:1 minus fees on withdrawal when underlying Yearn vault value is unchanged", async function () {
      let deposit1Amount = parseEther("3000");

      await this.mockDai.connect(depositor1).approve(this.Pool.address, deposit1Amount);
      await this.Pool.connect(depositor1).deposit(deposit1Amount);

      expect(await this.Pool.balanceOf(depositor1.address)).to.equal(parseEther("2940"));
      expect(await this.mockDai.balanceOf(depositor1.address)).to.equal(parseEther("97000"));
      let withdrawal1Amount = parseEther("1000");

      expect(await this.Pool.connect(depositor1).withdraw(withdrawal1Amount)).to
        .emit(this.Pool, "WithdrawalFee").withArgs(
          rewardsManager.address,
          parseUnits("4994999999999999995", "wei")).and
        .emit(this.Pool, "Withdrawal").withArgs(
          depositor1.address,
          parseUnits("994004999999999999006", "wei")
        );
      expect(await this.Pool.balanceOf(depositor1.address)).to.equal(parseEther("1940"));

      let depositor1DaiBalance = await this.mockDai.balanceOf(depositor1.address);
      expect(depositor1DaiBalance).to.equal(parseUnits("97994004999999999999006", "wei"));
    });

    it("tokens convert at higher rate on withdrawal when underlying Yearn vault value increases", async function () {
      let deposit1Amount = parseEther("3000");

      await this.mockDai.connect(depositor1).approve(this.Pool.address, deposit1Amount);
      await this.Pool.connect(depositor1).deposit(deposit1Amount);

      expect(await this.Pool.balanceOf(depositor1.address)).to.equal(parseEther("2940"));
      expect(await this.mockDai.balanceOf(depositor1.address)).to.equal(parseEther("97000"));

      this.mockYearnVault.setTotalAssets(parseEther("6000"));
      let withdrawal1Amount = parseEther("1000");
      expect(await this.Pool.connect(depositor1).withdraw(withdrawal1Amount)).to
        .emit(this.Pool, "WithdrawalFee").withArgs(
          rewardsManager.address,
          parseUnits("9989999999999999990", "wei")).and
        .emit(this.Pool, "Withdrawal").withArgs(
          depositor1.address,
          parseUnits("1988009999999999998012", "wei")
        );
      expect(await this.Pool.balanceOf(depositor1.address)).to.equal(parseEther("1940"));
      let depositor1DaiBalance = await this.mockDai.balanceOf(depositor1.address);
      expect(depositor1DaiBalance).to.equal(parseUnits("98988009999999999998012", "wei"));
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

      expect(await this.Pool.balanceOf(depositor1.address)).to.equal(parseEther("980"));
      expect(await this.mockDai.balanceOf(depositor1.address)).to.equal(parseEther("99000"));

      await this.mockDai.connect(depositor1).approve(this.Pool.address, deposit2Amount);
      await this.Pool.connect(depositor1).deposit(deposit2Amount);

      expect(await this.Pool.balanceOf(depositor1.address)).to.equal(parseEther("2940"));
      expect(await this.mockDai.balanceOf(depositor1.address)).to.equal(parseEther("97000"));

      await this.mockDai.connect(depositor2).approve(this.Pool.address, deposit3Amount);
      await this.Pool.connect(depositor2).deposit(deposit3Amount);

      expect(await this.Pool.balanceOf(depositor2.address)).to.equal(parseEther("4900"));
      expect(await this.mockDai.balanceOf(depositor2.address)).to.equal(parseEther("95000"));

      await this.mockDai.connect(depositor1).approve(this.Pool.address, deposit4Amount);
      await this.Pool.connect(depositor1).deposit(deposit4Amount);

      expect(await this.Pool.balanceOf(depositor1.address)).to.equal(parseEther("5880"));
      expect(await this.mockDai.balanceOf(depositor1.address)).to.equal(parseEther("94000"));

      await this.mockDai.connect(depositor1).approve(this.Pool.address, deposit5Amount);
      await this.Pool.connect(depositor1).deposit(deposit5Amount);

      expect(await this.Pool.balanceOf(depositor1.address)).to.equal(parseEther("9800"));
      expect(await this.mockDai.balanceOf(depositor1.address)).to.equal(parseEther("90000"));

      await this.mockDai.connect(depositor2).approve(this.Pool.address, deposit6Amount);
      await this.Pool.connect(depositor2).deposit(deposit6Amount);

      expect(await this.Pool.balanceOf(depositor2.address)).to.equal(parseEther("9800"));
      expect(await this.mockDai.balanceOf(depositor2.address)).to.equal(parseEther("90000"));

      expect(await this.mockYearnVault.totalAssets()).to.equal(parseEther("20000"));
      this.mockYearnVault.setTotalAssets(parseEther("40000"));

      let withdrawal1Amount = parseEther("1000");
      await this.Pool.connect(depositor1).withdraw(withdrawal1Amount);
      expect(await this.Pool.balanceOf(depositor1.address)).to.equal(parseEther("8800"));
      let depositor1DaiBalance = await this.mockDai.balanceOf(depositor1.address);
      expect(depositor1DaiBalance).to.equal(parseUnits("91988009999999999999996", "wei"));

      let withdrawal2Amount = parseEther("9800");
      await this.Pool.connect(depositor2).withdraw(withdrawal2Amount);
      expect(await this.Pool.balanceOf(depositor2.address)).to.equal(parseEther("0"));
      let depositor2DaiBalance = await this.mockDai.balanceOf(depositor2.address);
      expect(depositor2DaiBalance).to.equal(parseUnits("109482497999999999988069", "wei"));

      let withdrawal3Amount = parseEther("8800");
      await this.Pool.connect(depositor1).withdraw(withdrawal3Amount);
      expect(await this.Pool.balanceOf(depositor1.address)).to.equal(parseEther("0"));
      let depositor1UpdatedDaiBalance = await this.mockDai.balanceOf(depositor1.address);
      expect(depositor1UpdatedDaiBalance).to.equal(parseUnits("109482498000000000000280", "wei"));
    });

    it("multiple small deposits", async function () {
      let deposit1Amount = parseEther("1000");
      for (let i=0; i<10; i++) {
        await this.mockDai.connect(depositor1).approve(this.Pool.address, deposit1Amount);
        await this.Pool.connect(depositor1).deposit(deposit1Amount);
      }

      expect(await this.Pool.balanceOf(depositor1.address)).to.equal(parseEther("9800"));
      expect(await this.mockDai.balanceOf(depositor1.address)).to.equal(parseEther("90000"));

      let deposit2Amount = parseEther("10000");
      await this.mockDai.connect(depositor2).approve(this.Pool.address, deposit2Amount);
      await this.Pool.connect(depositor2).deposit(deposit2Amount);

      expect(await this.Pool.balanceOf(depositor2.address)).to.equal(parseEther("9800"));
      expect(await this.mockDai.balanceOf(depositor2.address)).to.equal(parseEther("90000"));

      expect(await this.mockYearnVault.totalAssets()).to.equal(parseEther("20000"));
      this.mockYearnVault.setTotalAssets(parseEther("40000"));

      let withdrawal1Amount = parseEther("9800");
      await this.Pool.connect(depositor1).withdraw(withdrawal1Amount);
      expect(await this.Pool.balanceOf(depositor1.address)).to.equal(parseEther("0"));
      let depositor1DaiBalance = await this.mockDai.balanceOf(depositor1.address);
      expect(depositor1DaiBalance).to.equal(parseUnits("109482498000000000000000", "wei"));

      let withdrawal2Amount = parseEther("9800");
      await this.Pool.connect(depositor2).withdraw(withdrawal2Amount);
      expect(await this.Pool.balanceOf(depositor2.address)).to.equal(parseEther("0"));
      let depositor2DaiBalance = await this.mockDai.balanceOf(depositor2.address);
      expect(depositor2DaiBalance).to.equal(parseUnits("109482497999999999998410", "wei"));
    });

    it("multiple small withdrawals", async function () {
      let deposit1Amount = parseEther("10000");
      await this.mockDai.connect(depositor1).approve(this.Pool.address, deposit1Amount);
      await this.Pool.connect(depositor1).deposit(deposit1Amount);

      expect(await this.Pool.balanceOf(depositor1.address)).to.equal(parseEther("9800"));
      expect(await this.mockDai.balanceOf(depositor1.address)).to.equal(parseEther("90000"));

      let deposit2Amount = parseEther("10000");
      await this.mockDai.connect(depositor2).approve(this.Pool.address, deposit2Amount);
      await this.Pool.connect(depositor2).deposit(deposit2Amount);

      expect(await this.Pool.balanceOf(depositor2.address)).to.equal(parseEther("9800"));
      expect(await this.mockDai.balanceOf(depositor2.address)).to.equal(parseEther("90000"));

      expect(await this.mockYearnVault.totalAssets()).to.equal(parseEther("20000"));
      this.mockYearnVault.setTotalAssets(parseEther("40000"));

      let withdrawal1Amount = parseEther("980");
      for (let i=0; i<10; i++) {
        await this.Pool.connect(depositor1).withdraw(withdrawal1Amount);
      }
      expect(await this.Pool.balanceOf(depositor1.address)).to.equal(parseEther("0"));
      let depositor1DaiBalance = await this.mockDai.balanceOf(depositor1.address);
      expect(depositor1DaiBalance).to.equal(parseUnits("109482497999999999920282", "wei"));

      let withdrawal2Amount = parseEther("9800");
      await this.Pool.connect(depositor2).withdraw(withdrawal2Amount);
      expect(await this.Pool.balanceOf(depositor2.address)).to.equal(parseEther("0"));
      let depositor2DaiBalance = await this.mockDai.balanceOf(depositor2.address);
      expect(depositor2DaiBalance).to.equal(parseUnits("109482498000000000075013", "wei"));
    });

    it("deposits at different magnitudes", async function () {

      async function _makeDeposit(depositor, amount) {
        await this.mockDai.mint(depositor.address, amount);
        await this.mockDai.connect(depositor).approve(this.Pool.address, amount);
        await this.Pool.connect(depositor).deposit(amount);
        //expect(await this.Pool.balanceOf(depositor.address)).to.equal(amount.mul(98).div(100));
      }
      const makeDeposit = _makeDeposit.bind(this);

      let deposit1Amount = parseEther("1000");
      await makeDeposit(depositor1, deposit1Amount);

      let deposit2Amount = parseEther("10000");
      await makeDeposit(depositor2, deposit2Amount);

      let deposit3Amount = parseEther("100000");
      await makeDeposit(depositor3, deposit3Amount);

      let deposit4Amount = parseEther("1000000");
      await makeDeposit(depositor4, deposit4Amount);

      let deposit5Amount = parseEther("100000000");
      await makeDeposit(depositor5, deposit5Amount);

      expect(await this.mockYearnVault.totalAssets()).to.equal(parseEther("101111000"));
      this.mockYearnVault.setTotalAssets(parseEther("202222000"));

      async function _expectation(depositor, amount, fee, withdrawal) {
        expect(await this.Pool.connect(depositor).withdraw(amount.mul(98).div(100))).to
          .emit(this.Pool, "WithdrawalFee").withArgs(
            rewardsManager.address,
            parseUnits(fee, "wei")).and
          .emit(this.Pool, "Withdrawal").withArgs(
            depositor.address,
            parseUnits(withdrawal, "wei")
          );
        expect(await this.Pool.balanceOf(depositor.address)).to.equal(parseEther("0"));
      }
      const expectFeeAndWithdrawalForAmount = _expectation.bind(this);

      await expectFeeAndWithdrawalForAmount(
        depositor1,
        deposit1Amount,
        "9790199999999019583",
        "1948249799999804897150"
      );

      await expectFeeAndWithdrawalForAmount(
        depositor2,
        deposit2Amount,
        "97901999999999476186",
        "19482497999999895761043"
      );

      await expectFeeAndWithdrawalForAmount(
        depositor3,
        deposit3Amount,
        "979019999999999923691",
        "194824979999999984814571"
      );

      await expectFeeAndWithdrawalForAmount(
        depositor4,
        deposit4Amount,
        "9790199999999999692726",
        "1948249799999999938852489"
      );

      await expectFeeAndWithdrawalForAmount(
        depositor5,
        deposit5Amount,
        "979020000000000001603734",
        "194824980000000000319143129"
      );
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

  describe("calculating pool token value", async function () {
    it("calculated value is same as realized withdrawal amount", async function () {
      let amount = parseEther("10000");
      await this.mockDai.connect(depositor).approve(this.Pool.address, amount);
      await this.Pool.connect(depositor).deposit(amount);
      expect(await this.Pool.connect(depositor).withdraw(parseEther("9800"))).to
        .emit(this.Pool, "WithdrawalFee").withArgs(
          rewardsManager.address,
          parseUnits("48951000000000000000", "wei")).and
        .emit(this.Pool, "Withdrawal").withArgs(
          depositor.address,
          parseUnits("9741249000000000000000", "wei")
        );
      expect(await this.Pool.connect(depositor).valueFor(parseEther("9800"))).to.equal(parseUnits("9741249000000000000000", "wei"));
    });

    it("when underlying vault value increases", async function () {
      let amount = parseEther("10000");
      await this.mockDai.connect(depositor).approve(this.Pool.address, amount);
      await this.Pool.connect(depositor).deposit(amount);
      await this.mockYearnVault.setTotalAssets(parseEther("25000"));
      expect(await this.Pool.connect(depositor).withdraw(parseEther("9800"))).to
        .emit(this.Pool, "WithdrawalFee").withArgs(
          rewardsManager.address,
          parseUnits("122377500000000000000", "wei")).and
        .emit(this.Pool, "Withdrawal").withArgs(
          depositor.address,
          parseUnits("24353122500000000000000", "wei")
        );
      expect(await this.Pool.connect(depositor).valueFor(parseEther("9800"))).to.equal(parseUnits("24353122500000000000000", "wei"));
    });

    it("is unchanged by other deposits", async function () {
      let amount = parseEther("10000");
      await this.mockDai.mint(depositor.address, amount)
      await this.mockDai.connect(depositor).approve(this.Pool.address, amount);
      await this.Pool.connect(depositor).deposit(amount);

      let amount1 = parseEther("10000");
      await this.mockDai.mint(depositor1.address, amount)
      await this.mockDai.connect(depositor1).approve(this.Pool.address, amount);
      await this.Pool.connect(depositor1).deposit(amount);

      let amount2 = parseEther("15000");
      await this.mockDai.mint(depositor2.address, amount)
      await this.mockDai.connect(depositor2).approve(this.Pool.address, amount);
      await this.Pool.connect(depositor2).deposit(amount);

      let amount3 = parseEther("250000");
      await this.mockDai.mint(depositor3.address, amount)
      await this.mockDai.connect(depositor3).approve(this.Pool.address, amount);
      await this.Pool.connect(depositor3).deposit(amount);

      let amount4 = parseEther("250000000");
      await this.mockDai.mint(depositor4.address, amount)
      await this.mockDai.connect(depositor4).approve(this.Pool.address, amount);
      await this.Pool.connect(depositor4).deposit(amount);

      expect(await this.Pool.connect(depositor).withdraw(parseEther("9800"))).to
        .emit(this.Pool, "WithdrawalFee").withArgs(
          rewardsManager.address,
          parseUnits("48951000000000000000", "wei")).and
        .emit(this.Pool, "Withdrawal").withArgs(
          depositor.address,
          parseUnits("9741249000000000000000", "wei")
        );
      expect(await this.Pool.connect(depositor).valueFor(parseEther("9800"))).to.equal(parseUnits("9741248999999999992924", "wei"));
    });
  });

});
