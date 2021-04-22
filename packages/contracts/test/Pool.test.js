const { expect } = require("chai");
const { waffle } = require("hardhat");
const { parseEther, parseUnits } = require("ethers/lib/utils");
const provider = waffle.provider;

describe('Pool', function () {
  const DepositorInitial = parseEther("100000");
  let MockERC20
  let owner, depositor, depositor1, depositor2, depositor3, depositor4, depositor5, rewardsManager

  beforeEach(async function () {
    [owner, depositor, depositor1, depositor2, depositor3, depositor4, depositor5, rewardsManager] = await ethers.getSigners();

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
      rewardsManager.address,
    );
    await this.Pool.deployed();
  });

  it("should be constructed with correct addresses", async function () {
    expect(await this.Pool.dai()).to.equal(this.mockDai.address);
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
    it("total assets is Yearn balance * Yearn price per share - slippage from conversion to DAI", async function () {
      let amount = parseEther("3700");
      await this.mockDai.connect(depositor).approve(this.Pool.address, amount);
      await this.Pool.connect(depositor).deposit(amount);
      expect(await this.Pool.totalValue()).to.equal(parseUnits("3696300000000000000000", "wei"));
    });
  });

  describe("pool token accounting", async function () {
    it("depositor earns tokens equal to deposit when pool is empty", async function () {
      let depositAmount  = parseEther("4300");
      await this.mockDai.connect(depositor).approve(this.Pool.address, depositAmount);
      await this.Pool.connect(depositor).deposit(depositAmount);
      expect(await this.Pool.balanceOf(depositor.address)).to.equal(depositAmount);
    });

    it("deposits emit an event", async function () {
      let depositAmount  = parseEther("4300");
      await this.mockDai.connect(depositor).approve(this.Pool.address, depositAmount);
      expect(await this.Pool.connect(depositor).deposit(depositAmount)).to
        .emit(this.Pool, "Deposit").withArgs(depositor.address, parseEther("4300"), parseEther("4300"));
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

      expect(await this.Pool.balanceOf(depositor1.address)).to.equal(parseEther("3000"));
      expect(await this.mockDai.balanceOf(depositor1.address)).to.equal(parseEther("97000"));
      let withdrawal1Amount = parseEther("3000");

      await expect(await this.Pool.connect(depositor1).withdraw(withdrawal1Amount)).to
        .emit(this.Pool, "WithdrawalFee").withArgs(
          rewardsManager.address,
          parseUnits("14984999971707781424", "wei")).and
        .emit(this.Pool, "Withdrawal").withArgs(
          depositor1.address,
          parseUnits("2982014994369848503399", "wei")
        );
      expect(await this.Pool.balanceOf(depositor1.address)).to.equal(parseEther("0"));

      let depositor1DaiBalance = await this.mockDai.balanceOf(depositor1.address);
      expect(depositor1DaiBalance).to.equal(parseUnits("99982014994369848503399", "wei"));
    });

    it("tokens convert at higher rate on withdrawal when underlying Yearn vault value increases", async function () {
      let deposit1Amount = parseEther("10000");

      await this.mockDai.connect(depositor1).approve(this.Pool.address, deposit1Amount);
      await this.Pool.connect(depositor1).deposit(deposit1Amount);

      expect(await this.Pool.balanceOf(depositor1.address)).to.equal(parseEther("10000"));
      expect(await this.mockDai.balanceOf(depositor1.address)).to.equal(parseEther("90000"));

      this.mockYearnVault.setTotalAssets(parseEther("20000"));
      let withdrawal1Amount = parseEther("10000");
      await expect(await this.Pool.connect(depositor1).withdraw(withdrawal1Amount)).to
        .emit(this.Pool, "WithdrawalFee").withArgs(
          rewardsManager.address,
          parseUnits("71724229856070318828", "wei")).and
        .emit(this.Pool, "Withdrawal").withArgs(
          depositor1.address,
          parseUnits("14273121741357993446952", "wei")
        );
      expect(await this.Pool.balanceOf(depositor1.address)).to.equal(parseEther("0"));
      let depositor1DaiBalance = await this.mockDai.balanceOf(depositor1.address);
      expect(depositor1DaiBalance).to.equal(parseUnits("104273121741357993446952", "wei"));
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
      expect(depositor1DaiBalance).to.equal(parseUnits("91427312173622230019809", "wei"));

      let withdrawal2Amount = parseEther("10000");
      await this.Pool.connect(depositor2).withdraw(withdrawal2Amount);
      expect(await this.Pool.balanceOf(depositor2.address)).to.equal(parseEther("0"));
      let depositor2DaiBalance = await this.mockDai.balanceOf(depositor2.address);
      expect(depositor2DaiBalance).to.equal(parseUnits("104273121717701115178387", "wei"));

      let withdrawal3Amount = parseEther("9000");
      await this.Pool.connect(depositor1).withdraw(withdrawal3Amount);
      expect(await this.Pool.balanceOf(depositor1.address)).to.equal(parseEther("0"));
      let depositor1UpdatedDaiBalance = await this.mockDai.balanceOf(depositor1.address);
      expect(depositor1UpdatedDaiBalance).to.equal(parseUnits("104273121702884167042179", "wei"));
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
      expect(depositor1DaiBalance).to.equal(parseUnits("104273121733924625951755", "wei"));

      let withdrawal2Amount = parseEther("10000");
      await this.Pool.connect(depositor2).withdraw(withdrawal2Amount);
      expect(await this.Pool.balanceOf(depositor2.address)).to.equal(parseEther("0"));
      let depositor2DaiBalance = await this.mockDai.balanceOf(depositor2.address);
      expect(depositor2DaiBalance).to.equal(parseUnits("104273121715403440765791", "wei"));
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
      expect(depositor1DaiBalance).to.equal(parseUnits("104273121656661073103396", "wei"));

      let withdrawal2Amount = parseEther("10000");
      await this.Pool.connect(depositor2).withdraw(withdrawal2Amount);
      expect(await this.Pool.balanceOf(depositor2.address)).to.equal(parseEther("0"));
      let depositor2DaiBalance = await this.mockDai.balanceOf(depositor2.address);
      expect(depositor2DaiBalance).to.equal(parseUnits("104273121554794556875496", "wei"));
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
        await expect(await this.Pool.connect(depositor).withdraw(amount)).to
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
        "7172422985321313913",
        "1427312174078941468687"
      );

      await expectFeeAndWithdrawalForAmount(
        depositor2,
        deposit2Amount,
        "71724229760143381388",
        "14273121722268532896405"
      );

      await expectFeeAndWithdrawalForAmount(
        depositor3,
        deposit3Amount,
        "717242296670721756149",
        "142731217037473629473746"
      );

      await expectFeeAndWithdrawalForAmount(
        depositor4,
        deposit4Amount,
        "7172422957400095454479",
        "1427312168522618995441400"
      );

      await expectFeeAndWithdrawalForAmount(
        depositor5,
        deposit5Amount,
        "717242294809296738025261",
        "142731216667050050867027035"
      );
    });
  });

  describe("calculating pool token value", async function () {
    it("calculated value is same as realized withdrawal amount", async function () {
      let amount = parseEther("20000");
      await this.mockDai.connect(depositor).approve(this.Pool.address, amount);
      await this.Pool.connect(depositor).deposit(amount);
      await expect(await this.Pool.connect(depositor).withdraw(parseEther("10000"))).to
        .emit(this.Pool, "WithdrawalFee").withArgs(
          rewardsManager.address,
          parseUnits("49949999905692604697", "wei")).and
        .emit(this.Pool, "Withdrawal").withArgs(
          depositor.address,
          parseUnits("9940049981232828334723", "wei")
        );
      expect(await this.Pool.connect(depositor).valueFor(parseEther("10000"))).to.equal(parseUnits("9940049981232828353318", "wei"));
    });

    it("when underlying vault value increases", async function () {
      let amount = parseEther("20000");
      await this.mockDai.connect(depositor).approve(this.Pool.address, amount);
      await this.Pool.connect(depositor).deposit(amount);
      await this.mockYearnVault.setTotalAssets(parseEther("25000"));
      await expect(await this.Pool.connect(depositor).withdraw(parseEther("10000"))).to
        .emit(this.Pool, "WithdrawalFee").withArgs(
          rewardsManager.address,
          parseUnits("58888684799266317859", "wei")).and
        .emit(this.Pool, "Withdrawal").withArgs(
          depositor.address,
          parseUnits("11718848275053997253966", "wei")
        );
      expect(await this.Pool.connect(depositor).valueFor(parseEther("10000"))).to.equal(parseUnits("11718848275053997280408", "wei"));
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

      await expect(await this.Pool.connect(depositor).withdraw(parseEther("10000"))).to
        .emit(this.Pool, "WithdrawalFee").withArgs(
          rewardsManager.address,
          parseUnits("49949999685642017904", "wei")).and
        .emit(this.Pool, "Withdrawal").withArgs(
          depositor.address,
          parseUnits("9940049937442761563046", "wei")
        );
      expect(await this.Pool.connect(depositor).valueFor(parseEther("10000"))).to.equal(parseUnits("9940049937442761562773", "wei"));
    });

    it("calculating value for a single pool token", async function () {
      let amount = parseEther("10000");
      await this.mockDai.connect(depositor).approve(this.Pool.address, amount);
      await this.Pool.connect(depositor).deposit(amount);
      let valueForOneShare = await this.Pool.valueFor(parseEther("1"));
      let poolTokenValue = await this.Pool.poolTokenValue();
      expect(poolTokenValue).to.equal(parseUnits("994004998748845907", "wei"));
      expect(valueForOneShare).to.equal(poolTokenValue);
    });
  });

  describe("management fees", async function () {
    beforeEach(async function() {
      await this.Pool.connect(owner).setPerformanceFee(0);
    });

    it("management fee issues pool tokens to contract on deposit", async function () {
      let amount = parseEther("10000");
      await this.mockDai.connect(depositor).approve(this.Pool.address, amount);

      expect(await this.Pool.balanceOf(this.Pool.address)).to.equal(0);
      await this.Pool.connect(depositor).deposit(amount);
      await provider.send("evm_increaseTime", [1 * 365 * 24 * 60 * 60]);
      await this.Pool.takeFees();

      let managementTokenBalance = await this.Pool.balanceOf(this.Pool.address);
      expect(await this.Pool.valueFor(managementTokenBalance)).to.equal(parseUnits("193441291073312855633", "wei"));
    });

    it("shorter periods issue fewer shares", async function () {
      let amount = parseEther("10000");
      await this.mockDai.connect(depositor).approve(this.Pool.address, amount);

      expect(await this.Pool.balanceOf(this.Pool.address)).to.equal(0);
      await this.Pool.connect(depositor).deposit(amount);
      await provider.send("evm_increaseTime", [7 * 24 * 60 * 60]);
      await this.Pool.takeFees();

      let managementTokenBalance = await this.Pool.balanceOf(this.Pool.address);
      expect(await this.Pool.valueFor(managementTokenBalance)).to.equal(parseUnits("3782041016332360065", "wei"));
    });

    it("feesUpdatedAt is contract creation block for new pool", async function () {
      let deployBlock = await provider.getBlock(this.Pool.deployTransaction.blockNumber);
      let deployTimestamp = deployBlock.timestamp;
      expect(await this.Pool.deployedAt()).to.equal(deployTimestamp);
      expect(await this.Pool.feesUpdatedAt()).to.equal(deployTimestamp);
    });

    it("larger management fees dilute token value", async function () {
      await this.Pool.connect(owner).setWithdrawalFee(10 * 500);

      let amount = parseEther("10000");
      await this.mockDai.connect(depositor).approve(this.Pool.address, amount);

      expect(await this.Pool.balanceOf(this.Pool.address)).to.equal(0);
      await this.Pool.connect(depositor).deposit(amount);
      await provider.send("evm_increaseTime", [365 * 24 * 60 * 60]);
      await this.Pool.takeFees();

      let managementTokenBalance = await this.Pool.balanceOf(this.Pool.address);
      expect(await this.Pool.poolTokenValue()).to.equal(parseUnits("494567487984330135", "wei"));
      expect(await this.Pool.valueFor(managementTokenBalance)).to.equal(parseUnits("49325120156651547150", "wei"));
    });
  });

  describe("performance fees", async function () {
    beforeEach(async function() {
      await this.Pool.connect(owner).setManagementFee(0);
    });

    it("performance fee issues pool tokens to contract when total value increases", async function () {
    });
  });


  describe("governance", async function () {
    it("owner can set withdrawalFee", async function () {
      await this.Pool.connect(owner).setWithdrawalFee(20);
      expect(await this.Pool.withdrawalFee()).to.equal(20);
    });

    it("non-owner cannot set withdrawalFee", async function () {
      expect(this.Pool.connect(depositor).setWithdrawalFee(20)).to.be.revertedWith("Ownable: caller is not the owner");
    });

    it("owner can set managementFee", async function () {
      await this.Pool.connect(owner).setWithdrawalFee(500);
      expect(await this.Pool.withdrawalFee()).to.equal(500);
    });

    it("non-owner cannot set managementFee", async function () {
      expect(this.Pool.connect(depositor).setManagementFee(500)).to.be.revertedWith("Ownable: caller is not the owner");
    });
  });

});
