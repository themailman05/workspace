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

    MockYearnV1Vault = await ethers.getContractFactory("MockYearnV1Vault");
    this.mockYearnVault = await MockYearnV1Vault.deploy(this.mockCrvUSDX.address);

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
    it("accepts DAI deposits", async function () {
      let amount = parseEther("1000");
      await this.mockDai.connect(depositor).approve(this.Pool.address, amount);
      await this.Pool.connect(depositor).deposit(amount);
      expect(await this.mockDai.connect(depositor).balanceOf(depositor.address)).to.equal(parseEther("99000"));
    });

    it("reverts unapproved deposits", async function () {
      let amount = parseEther("1000");
      await expect(this.Pool.connect(depositor).deposit(amount)).to.be.revertedWith("transfer amount exceeds allowance");
    });

    it("returns popDAI to depositor", async function () {
      let amount = parseEther("1000");
      await this.mockDai.connect(depositor).approve(this.Pool.address, amount);
      await this.Pool.connect(depositor).deposit(amount);
      expect(await this.Pool.connect(depositor).balanceOf(depositor.address)).to.equal(amount);
    });

    it("deposits crvUSDX to Yearn in exchange for yvUSDX", async function () {
      let amount = parseEther("1000");
      await this.mockDai.connect(depositor).approve(this.Pool.address, amount);
      await this.Pool.connect(depositor).deposit(amount);
      expect(await this.mockYearnVault.connect(depositor).balanceOf(this.Pool.address)).to.equal(parseEther("1000"));
    });
  });

  describe("calculating total assets", async function () {
    it("total assets is Yearn balance * Yearn price per share - slippage from conversion to DAI", async function () {
      let amount = parseEther("10000");
      await this.mockDai.connect(depositor).approve(this.Pool.address, amount);
      await this.Pool.connect(depositor).deposit(amount);
      expect(await this.Pool.totalValue()).to.equal(parseEther("9990"));
    });
  });

  describe("pool token accounting", async function () {
    it("depositor earns tokens equal to deposit when pool is empty", async function () {
      let depositAmount  = parseEther("10000");
      await this.mockDai.connect(depositor).approve(this.Pool.address, depositAmount);
      await this.Pool.connect(depositor).deposit(depositAmount);
      expect(await this.Pool.balanceOf(depositor.address)).to.equal(depositAmount);
    });

    it("deposits emit an event", async function () {
      let depositAmount  = parseEther("10000");
      await this.mockDai.connect(depositor).approve(this.Pool.address, depositAmount);
      expect(await this.Pool.connect(depositor).deposit(depositAmount)).to
        .emit(this.Pool, "Deposit").withArgs(depositor.address, parseEther("10000"), parseEther("10000"));
    });

    it("depositors earn tokens proportional to contributions", async function () {
      let deposit1Amount = parseEther("2000");
      let deposit2Amount = parseEther("3000");
      let deposit3Amount = parseEther("10000");

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
      let deposit1Amount = parseEther("10000");

      await this.mockDai.connect(depositor1).approve(this.Pool.address, deposit1Amount);
      await this.Pool.connect(depositor1).deposit(deposit1Amount);

      expect(await this.Pool.balanceOf(depositor1.address)).to.equal(parseEther("10000"));
      expect(await this.mockDai.balanceOf(depositor1.address)).to.equal(parseEther("90000"));
      let withdrawal1Amount = parseEther("10000");

      await expect(await this.Pool.connect(depositor1).withdraw(withdrawal1Amount)).to
        .emit(this.Pool, "WithdrawalFee").withArgs(
          rewardsManager.address,
          parseUnits("49949999905692604747", "wei")).and
        .emit(this.Pool, "Withdrawal").withArgs(
          depositor1.address,
          parseUnits("9940049981232828344663", "wei")
        );
      expect(await this.Pool.balanceOf(depositor1.address)).to.equal(parseEther("0"));

      let depositor1DaiBalance = await this.mockDai.balanceOf(depositor1.address);
      expect(depositor1DaiBalance).to.equal(parseUnits("99940049981232828344663", "wei"));
    });

    it("tokens convert at higher rate on withdrawal when underlying Yearn vault value increases", async function () {
      let deposit = parseEther("10000");

      await this.mockDai.connect(depositor).approve(this.Pool.address, deposit);
      await this.Pool.connect(depositor).deposit(deposit);

      expect(await this.Pool.balanceOf(depositor.address)).to.equal(parseEther("10000"));
      expect(await this.mockDai.balanceOf(depositor.address)).to.equal(parseEther("90000"));

      this.mockYearnVault.setPricePerFullShare(parseEther("2"));
      let withdrawal = parseEther("10000");
      await expect(await this.Pool.connect(depositor).withdraw(withdrawal)).to
        .emit(this.Pool, "WithdrawalFee").withArgs(
          rewardsManager.address,
          parseUnits("99899999371284034710", "wei")).and
        .emit(this.Pool, "Withdrawal").withArgs(
          depositor.address,
          parseUnits("19880099874885522907410", "wei")
        );
      expect(await this.Pool.balanceOf(depositor.address)).to.equal(parseEther("0"));
      let depositorDaiBalance = await this.mockDai.balanceOf(depositor.address);
      expect(depositorDaiBalance).to.equal(parseUnits("109880099874885522907410", "wei"));
    });

    it("handles multiple deposits", async function () {
      let deposits = [
        [depositor1, parseEther("1000"), parseEther("1000"),  parseEther("99000")],
        [depositor1, parseEther("2000"), parseEther("3000"),  parseEther("97000")],
        [depositor2, parseEther("3000"), parseEther("3000"),  parseEther("97000")],
        [depositor1, parseEther("4000"), parseEther("7000"),  parseEther("93000")],
        [depositor1, parseEther("5000"), parseEther("12000"), parseEther("88000")],
        [depositor2, parseEther("6000"), parseEther("9000"),  parseEther("91000")]
      ]

      for ([depositor, deposit, poolBalance, daiBalance] of deposits) {
        await this.mockDai.connect(depositor).approve(this.Pool.address, deposit);
        await this.Pool.connect(depositor).deposit(deposit);

        expect(await this.Pool.balanceOf(depositor.address)).to.equal(poolBalance);
        expect(await this.mockDai.balanceOf(depositor.address)).to.equal(daiBalance);
      }

      expect(await this.mockYearnVault.balance()).to.equal(parseEther("21000"));
      this.mockYearnVault.setPricePerFullShare(parseEther("1.5"));

      let withdrawal1Amount = parseEther("10000");
      await this.Pool.connect(depositor1).withdraw(withdrawal1Amount);
      expect(await this.Pool.balanceOf(depositor1.address)).to.equal(parseEther("2000"));
      let depositor1DaiBalance = await this.mockDai.balanceOf(depositor1.address);
      expect(depositor1DaiBalance).to.equal(parseUnits("102910074907728073251568", "wei"));

      let withdrawal2Amount = parseEther("1000");
      await this.Pool.connect(depositor2).withdraw(withdrawal2Amount);
      expect(await this.Pool.balanceOf(depositor2.address)).to.equal(parseEther("8000"));
      let depositor2DaiBalance = await this.mockDai.balanceOf(depositor2.address);
      expect(depositor2DaiBalance).to.equal(parseUnits("92491007488661500544994", "wei"));
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

      expect(await this.mockYearnVault.balance()).to.equal(parseEther("20000"));
      this.mockYearnVault.setPricePerFullShare(parseEther("2"));

      let withdrawal1Amount = parseEther("10000");
      await this.Pool.connect(depositor1).withdraw(withdrawal1Amount);
      expect(await this.Pool.balanceOf(depositor1.address)).to.equal(parseEther("0"));
      let depositor1DaiBalance = await this.mockDai.balanceOf(depositor1.address);
      expect(depositor1DaiBalance).to.equal(parseUnits("109880099806072561824536", "wei"));

      let withdrawal2Amount = parseEther("10000");
      await this.Pool.connect(depositor2).withdraw(withdrawal2Amount);
      expect(await this.Pool.balanceOf(depositor2.address)).to.equal(parseEther("0"));
      let depositor2DaiBalance = await this.mockDai.balanceOf(depositor2.address);
      expect(depositor2DaiBalance).to.equal(parseUnits("109880099756026772230583", "wei"));
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

      expect(await this.mockYearnVault.balance()).to.equal(parseEther("20000"));
      this.mockYearnVault.setPricePerFullShare(parseEther("2"));

      let withdrawal1Amount = parseEther("1000");
      for (let i=0; i<10; i++) {
        await this.Pool.connect(depositor1).withdraw(withdrawal1Amount);
      }
      expect(await this.Pool.balanceOf(depositor1.address)).to.equal(parseEther("0"));
      let depositor1DaiBalance = await this.mockDai.balanceOf(depositor1.address);
      expect(depositor1DaiBalance).to.equal(parseUnits("109880099637168024634601", "wei"));

      let withdrawal2Amount = parseEther("10000");
      await this.Pool.connect(depositor2).withdraw(withdrawal2Amount);
      expect(await this.Pool.balanceOf(depositor2.address)).to.equal(parseEther("0"));
      let depositor2DaiBalance = await this.mockDai.balanceOf(depositor2.address);
      expect(depositor2DaiBalance).to.equal(parseUnits("109880099361916192224136", "wei"));
    });

    it("deposits at different magnitudes", async function () {

      async function _makeDeposit(depositor, amount) {
        let weiAmount = parseEther(amount);
        await this.mockDai.mint(depositor.address, weiAmount);
        await this.mockDai.connect(depositor).approve(this.Pool.address, weiAmount);
        await this.Pool.connect(depositor).deposit(weiAmount);
      }
      const makeDeposit = _makeDeposit.bind(this);
      let deposits = [
        [
          depositor1,
          "1000",
          "9989999930610792356",
          "1988009986191547678906"
        ],
        [
          depositor2,
          "10000",
          "99899999054623432903",
          "19880099811870063147865"
        ],
        [
          depositor3,
          "100000",
          "998999988031377359762",
          "198800997618244094592817"
        ],
        [
          depositor4,
          "1000000",
          "9989999855165135899302",
          "1988009971177862043961285"
        ],
        [
          depositor5,
          "100000000",
          "998999983001649903493407",
          "198800996617328330795188044"
        ]
      ]

      for([depositor, deposit] of deposits) {
        await makeDeposit(depositor, deposit);
      }

      expect(await this.mockYearnVault.balance()).to.equal(parseEther("101111000"));
      this.mockYearnVault.setPricePerFullShare(parseEther("2"));

      async function _expectation(depositor, amount, fee, withdrawal) {
        let weiAmount = parseEther(amount);
        await expect(await this.Pool.connect(depositor).withdraw(weiAmount)).to
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

      for([depositor, deposit, withdrawalFee, withdrawal] of deposits) {
        await expectFeeAndWithdrawalForAmount(
          depositor,
          deposit,
          withdrawalFee,
          withdrawal
        );
      }
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
      await this.mockYearnVault.setPricePerFullShare(parseEther("2"));
      await expect(await this.Pool.connect(depositor).withdraw(parseEther("10000"))).to
        .emit(this.Pool, "WithdrawalFee").withArgs(
          rewardsManager.address,
          parseUnits("99899999371284034710", "wei")).and
        .emit(this.Pool, "Withdrawal").withArgs(
          depositor.address,
          parseUnits("19880099874885522907410", "wei")
        );
      expect(await this.Pool.connect(depositor).valueFor(parseEther("10000"))).to.equal(parseUnits("19880099874885522942893", "wei"));
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
      expect(await this.Pool.connect(depositor).valueFor(parseEther("10000"))).to.equal(parseUnits("9940049937442761566750", "wei"));
    });

    it("calculating value for a single pool token", async function () {
      let amount = parseEther("10000");
      await this.mockDai.connect(depositor).approve(this.Pool.address, amount);
      await this.Pool.connect(depositor).deposit(amount);
      let valueForOneShare = await this.Pool.valueFor(parseEther("1"));
      let poolTokenPrice = await this.Pool.poolTokenPrice();
      expect(poolTokenPrice).to.equal(parseUnits("994004998748845907", "wei"));
      expect(valueForOneShare).to.equal(poolTokenPrice);
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
      expect(await this.Pool.poolTokenPrice()).to.equal(parseUnits("494567487984330135", "wei"));
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

    describe("sending accrued fees to rewards manager", async function() {
      it("owner can withdraw accrued fees", async function () {
        let deposit1Amount = parseEther("10000");
        await this.mockDai.connect(depositor1).approve(this.Pool.address, deposit1Amount);
        await this.Pool.connect(depositor1).deposit(deposit1Amount);
        await this.mockYearnVault.setPricePerFullShare(parseEther("2"));
        await provider.send("evm_increaseTime", [1 * 365 * 24 * 60 * 60]);
        await this.Pool.takeFees();
        expect(await this.Pool.balanceOf(this.Pool.address)).to.equal(parseUnits("793881391039782350409", "wei"));
        await this.Pool.withdrawAccruedFees();
        expect(await this.Pool.balanceOf(this.Pool.address)).to.equal(0);
        expect(await this.mockDai.balanceOf(rewardsManager.address)).to.equal(parseUnits("1469513108245010791860", "wei"));
      });

    });
  });

});
