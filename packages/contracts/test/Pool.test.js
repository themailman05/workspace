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
    await this.mockDai.mint(depositor3.address, DepositorInitial);
    await this.mockDai.mint(depositor4.address, DepositorInitial);
    await this.mockDai.mint(depositor5.address, DepositorInitial);

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
      await expect(this.Pool.connect(depositor).deposit(depositAmount)).to
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

      await expect(this.Pool.connect(depositor1).withdraw(withdrawal1Amount)).to
        .emit(this.Pool, "WithdrawalFee").withArgs(
          rewardsManager.address,
          parseUnits("49949999968564201515", "wei")).and
        .emit(this.Pool, "Withdrawal").withArgs(
          depositor1.address,
          parseUnits("9940049993744276101635", "wei")
        );
      expect(await this.Pool.balanceOf(depositor1.address)).to.equal(parseEther("0"));

      let depositor1DaiBalance = await this.mockDai.balanceOf(depositor1.address);
      expect(depositor1DaiBalance).to.equal(parseUnits("99940049993744276101635", "wei"));
    });

    it("tokens convert at higher rate on withdrawal when underlying Yearn vault value increases", async function () {
      let deposit = parseEther("10000");

      await this.mockDai.connect(depositor).approve(this.Pool.address, deposit);
      await this.Pool.connect(depositor).deposit(deposit);

      expect(await this.Pool.balanceOf(depositor.address)).to.equal(parseEther("10000"));
      expect(await this.mockDai.balanceOf(depositor.address)).to.equal(parseEther("90000"));

      this.mockYearnVault.setPricePerFullShare(parseEther("2"));
      let withdrawal = parseEther("10000");
      await expect(this.Pool.connect(depositor).withdraw(withdrawal)).to
        .emit(this.Pool, "WithdrawalFee").withArgs(
          rewardsManager.address,
          parseUnits("71724229869653504146", "wei")).and.to
        .emit(this.Pool, "Withdrawal").withArgs(
          depositor.address,
          parseUnits("14273121744061047325214", "wei")).and.to
        .emit(this.Pool,"PerformanceFee").withArgs(
          parseUnits("1976019989930445121545", "wei")
        ).and.to.emit(this.Pool, "ManagementFee").withArgs(
          parseUnits("25325639814643", "wei")
        );
      expect(await this.Pool.balanceOf(depositor.address)).to.equal(parseEther("0"));
      let depositorDaiBalance = await this.mockDai.balanceOf(depositor.address);
      expect(depositorDaiBalance).to.equal(parseUnits("104273121744061047325214", "wei"));
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
      expect(depositor1DaiBalance).to.equal(parseUnits("101005779487469074632472", "wei"));

      let withdrawal2Amount = parseEther("1000");
      await this.Pool.connect(depositor2).withdraw(withdrawal2Amount);
      expect(await this.Pool.balanceOf(depositor2.address)).to.equal(parseEther("8000"));
      let depositor2DaiBalance = await this.mockDai.balanceOf(depositor2.address);
      expect(depositor2DaiBalance).to.equal(parseUnits("92300577947345640038706", "wei"));
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
      expect(depositor1DaiBalance).to.equal(parseUnits("104273121736627800959466", "wei"));

      let withdrawal2Amount = parseEther("10000");
      await this.Pool.connect(depositor2).withdraw(withdrawal2Amount);
      expect(await this.Pool.balanceOf(depositor2.address)).to.equal(parseEther("0"));
      let depositor2DaiBalance = await this.mockDai.balanceOf(depositor2.address);
      expect(depositor2DaiBalance).to.equal(parseUnits("104273121718106615793482", "wei"));
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
      expect(depositor1DaiBalance).to.equal(parseUnits("104273121659364248135522", "wei"));

      let withdrawal2Amount = parseEther("10000");
      await this.Pool.connect(depositor2).withdraw(withdrawal2Amount);
      expect(await this.Pool.balanceOf(depositor2.address)).to.equal(parseEther("0"));
      let depositor2DaiBalance = await this.mockDai.balanceOf(depositor2.address);
      expect(depositor2DaiBalance).to.equal(parseUnits("104273121557497731898429", "wei"));
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
          "7172422987156663619",
          "1427312174444176060375"
        ],
        [
          depositor2,
          "10000",
          "71724229778502678130",
          "14273121725922032947963"
        ],
        [
          depositor3,
          "100000",
          "717242296854313899911",
          "142731217074008466082340"
        ],
        [
          depositor4,
          "1000000",
          "7172422959236017335043",
          "1427312168887967449673695"
        ],
        [
          depositor5,
          "100000000",
          "717242294992888977307726",
          "142731216703584906484237567"
        ]
      ]

      for([depositor, deposit] of deposits) {
        await makeDeposit(depositor, deposit);
      }

      expect(await this.mockYearnVault.balance()).to.equal(parseEther("101111000"));
      this.mockYearnVault.setPricePerFullShare(parseEther("2"));

      async function _expectation(depositor, amount, fee, withdrawal) {
        let weiAmount = parseEther(amount);
        await expect(this.Pool.connect(depositor).withdraw(weiAmount)).to
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
      await expect(this.Pool.connect(depositor).withdraw(parseEther("10000"))).to
        .emit(this.Pool, "WithdrawalFee").withArgs(
          rewardsManager.address,
          parseUnits("49949999968564201465", "wei")).and
        .emit(this.Pool, "Withdrawal").withArgs(
          depositor.address,
          parseUnits("9940049993744276091695", "wei")
        );
      expect(await this.Pool.connect(depositor).valueFor(parseEther("10000"))).to.equal(parseUnits("9940049993744276113640", "wei"));
    });

    it("when underlying vault value increases", async function () {
      let amount = parseEther("20000");
      await this.mockDai.connect(depositor).approve(this.Pool.address, amount);
      await this.Pool.connect(depositor).deposit(amount);
      await this.mockYearnVault.setPricePerFullShare(parseEther("2"));
      await expect(this.Pool.connect(depositor).withdraw(parseEther("10000"))).to
        .emit(this.Pool, "WithdrawalFee").withArgs(
          rewardsManager.address,
          parseUnits("71724229869654113337", "wei")).and
        .emit(this.Pool, "Withdrawal").withArgs(
          depositor.address,
          parseUnits("14273121744061168554063", "wei")
        );
      expect(await this.Pool.connect(depositor).valueFor(parseEther("10000"))).to.equal(parseUnits("14273121744061168594717", "wei"));
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
          parseUnits("49949999779949411859", "wei")).and
        .emit(this.Pool, "Withdrawal").withArgs(
          depositor.address,
          parseUnits("9940049956209932959941", "wei")
        );
      expect(await this.Pool.connect(depositor).valueFor(parseEther("10000"))).to.equal(parseUnits("9940049956209932969236", "wei"));
    });

    it("calculating value for a single pool token", async function () {
      let amount = parseEther("10000");
      await this.mockDai.connect(depositor).approve(this.Pool.address, amount);
      await this.Pool.connect(depositor).deposit(amount);
      let valueForOneShare = await this.Pool.valueFor(parseEther("1"));
      let pricePerPoolToken = await this.Pool.pricePerPoolToken();
      expect(pricePerPoolToken).to.equal(parseUnits("994005000000000000", "wei"));
      expect(valueForOneShare).to.equal(pricePerPoolToken);
    });
  });

  describe("fees", async function() {

    describe("management fees", async function() {
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
        expect(await this.Pool.valueFor(managementTokenBalance)).to.equal(parseUnits("193441273387599088217", "wei"));
      });

      it("shorter periods issue fewer shares", async function () {
        let amount = parseEther("10000");
        await this.mockDai.connect(depositor).approve(this.Pool.address, amount);

        expect(await this.Pool.balanceOf(this.Pool.address)).to.equal(0);
        await this.Pool.connect(depositor).deposit(amount);
        await provider.send("evm_increaseTime", [7 * 24 * 60 * 60]);
        await this.Pool.takeFees();

        let managementTokenBalance = await this.Pool.balanceOf(this.Pool.address);
        expect(await this.Pool.valueFor(managementTokenBalance)).to.equal(parseUnits("3782022270577059335", "wei"));
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
        expect(await this.Pool.pricePerPoolToken()).to.equal(parseUnits("494567488597611240", "wei"));
        expect(await this.Pool.valueFor(managementTokenBalance)).to.equal(parseUnits("49325114023857105525", "wei"));
      });
    });

    describe("performance fees", async function () {
      beforeEach(async function() {
        await this.Pool.connect(owner).setManagementFee(0);
      });

      it("takes no performance fee when value is unchanged", async function () {
        let amount = parseEther("20000");
        await this.mockDai.connect(depositor).approve(this.Pool.address, amount);
        await this.Pool.connect(depositor).deposit(amount);
        await expect(this.Pool.connect(depositor).withdraw(parseEther("10000"))).not.to.emit(this.Pool, "PerformanceFee");
      });

      it("takes a performance fee when value increases", async function () {
        let amount = parseEther("20000");
        await this.mockDai.connect(depositor).approve(this.Pool.address, amount);
        await this.Pool.connect(depositor).deposit(amount);
        await this.mockYearnVault.setPricePerFullShare(parseEther("1.5"));
        await expect(this.Pool.connect(depositor).withdraw(parseEther("10000"))).to.emit(this.Pool, "PerformanceFee").withArgs(parseEther("1964.03"));
      });

      it("takes no performance fee when value decreases below HWM", async function () {
        let amount = parseEther("20000");
        await this.mockDai.connect(depositor).approve(this.Pool.address, amount);
        await this.Pool.connect(depositor).deposit(amount);
        await this.mockYearnVault.setPricePerFullShare(parseEther("1.5"));
        expect(await this.Pool.pricePerPoolToken()).to.equal(parseUnits("1491007500000000000", "wei"));
        await expect(this.Pool.connect(depositor).withdraw(parseEther("10000"))).to.emit(this.Pool, "PerformanceFee").withArgs(parseEther("1964.03"));
        await this.mockYearnVault.setPricePerFullShare(parseEther("1.25"));
        expect(await this.Pool.pricePerPoolToken()).to.equal(parseUnits("1083814959877500528", "wei"));
        await expect(this.Pool.connect(depositor).withdraw(parseEther("10000"))).not.to.emit(this.Pool, "PerformanceFee")
      });

      it("takes a performance fee when value decreases below HWM, then increases above it", async function () {
        let amount = parseEther("30000");
        await this.mockDai.connect(depositor).approve(this.Pool.address, amount);
        await this.Pool.connect(depositor).deposit(amount);

        await this.mockYearnVault.setPricePerFullShare(parseEther("1.5"));
        expect(await this.Pool.pricePerPoolToken()).to.equal(parseUnits("1491007499999985090", "wei"));
        await expect(this.Pool.connect(depositor).withdraw(parseEther("10000"))).to.emit(this.Pool, "PerformanceFee").withArgs(parseUnits("2946044999999910540000", "wei"));

        await this.mockYearnVault.setPricePerFullShare(parseEther("1.25"));
        expect(await this.Pool.pricePerPoolToken()).to.equal(parseUnits("1083814959877515580", "wei"));
        await expect(this.Pool.connect(depositor).withdraw(parseEther("10000"))).not.to.emit(this.Pool, "PerformanceFee")

        await this.mockYearnVault.setPricePerFullShare(parseEther("1.75"));
        expect(await this.Pool.pricePerPoolToken()).to.equal(parseUnits("1517340943828506569", "wei"));
        await expect(this.Pool.connect(depositor).withdraw(parseEther("10000"))).to.emit(this.Pool, "PerformanceFee").withArgs(parseUnits("623955532097938987758", "wei"));
      });

    });

    describe("combined fees", async function() {

      it("combined fees over time", async function() {
        let initialDeposit = parseEther("10000");
        await this.mockDai.connect(depositor1).approve(this.Pool.address, initialDeposit);

        // Management fee:  None
        // Performance fee: None
        await expect(this.Pool.connect(depositor1).deposit(initialDeposit)).to
          .emit(this.Pool, "Deposit").withArgs(depositor1.address, parseEther("10000"), parseEther("10000")).and.not.to
          .emit(this.Pool, "ManagementFee").and.not.to
          .emit(this.Pool, "PerformanceFee");

        // yVault share price: $1.00
        // Pool token price:   $0.99
        // Total pool value:   $9,990
        // Pool share value:   $0
        expect(await this.Pool.pricePerPoolToken()).to.equal(parseUnits("994005000000000000", "wei"));
        expect(await this.Pool.totalValue()).to.equal(parseUnits("9990000000000000000000", "wei"));
        expect(await this.Pool.balanceOf(this.Pool.address)).to.equal(parseUnits("0", "wei"));
        expect(await this.Pool.totalSupply()).to.equal(parseUnits("10000000000000000000000", "wei"));
        expect(await this.Pool.valueFor(await this.Pool.balanceOf(this.Pool.address))).to.equal(parseUnits("0", "wei"));

        // Increase vault share value by 10% in each period
        await this.mockYearnVault.setPricePerFullShare(parseEther("1.1"));
        // Fast forward 30 days in each period
        await provider.send("evm_increaseTime", [30 * 24 * 60 * 60]);
        // Total pool value: $10,989
        // Gain this period: $999
        expect(await this.Pool.totalValue()).to.equal(parseUnits("10989000000000000000000", "wei"));

        // We've had assets worth $10,989 under management for 30 days.
        // Management fee:  $18

        // We've earned $999 profit this period
        // Performance fee: $182
        await this.mockDai.connect(depositor2).approve(this.Pool.address, initialDeposit);
        await expect(this.Pool.connect(depositor2).deposit(initialDeposit)).to
          .emit(this.Pool, "Deposit").withArgs(depositor2.address, parseEther("10000"), parseEther("10000")).and
          .emit(this.Pool, "ManagementFee").withArgs(parseUnits("18052129988979924296", "wei")).and
          .emit(this.Pool, "PerformanceFee").withArgs(parseUnits("182863340356649173284", "wei"));

        // yVault share price: $1.10
        // Pool token price:   $1.03
        // Total pool value: $20,979
        // Pool share value: $226
        expect(await this.Pool.pricePerPoolToken()).to.equal(parseUnits("1032385749224941465", "wei"));
        expect(await this.Pool.totalValue()).to.equal(parseUnits("20979000000000000000000", "wei"));
        expect(await this.Pool.balanceOf(this.Pool.address)).to.equal(parseUnits("219288202758500747754", "wei"));
        expect(await this.Pool.totalSupply()).to.equal(parseUnits("20219288202758500747754", "wei"));
        expect(await this.Pool.valueFor(await this.Pool.balanceOf(this.Pool.address))).to.equal(parseUnits("226390015501027228277", "wei"));

        await this.mockYearnVault.setPricePerFullShare(parseEther("1.21"));
        await provider.send("evm_increaseTime", [30 * 24 * 60 * 60]);
        // Total pool value: $23,076
        // Gain this period: $2,097
        expect(await this.Pool.totalValue()).to.equal(parseUnits("23076899999999999980927", "wei"));

        // Management fee:  $37
        // Performance fee: $408
        await this.mockDai.connect(depositor3).approve(this.Pool.address, initialDeposit);
        await expect(this.Pool.connect(depositor3).deposit(initialDeposit)).to
          .emit(this.Pool, "Deposit").withArgs(depositor3.address, parseEther("10000"), parseEther("10000")).and
          .emit(this.Pool, "ManagementFee").withArgs(parseUnits("37909472976857840992", "wei")).and
          .emit(this.Pool, "PerformanceFee").withArgs(parseUnits("408593068816936428942", "wei"));

        // yVault share price: $1.21
        // Pool token price:   $1.07
        // Total pool value: $33,066
        // Pool share value: $776
        expect(await this.Pool.pricePerPoolToken()).to.equal(parseUnits("1070827613165356343", "wei"));
        expect(await this.Pool.totalValue()).to.equal(parseUnits("33066899999999999972671", "wei"));
        expect(await this.Pool.balanceOf(this.Pool.address)).to.equal(parseUnits("725361482547753048288", "wei"));
        expect(await this.Pool.totalSupply()).to.equal(parseUnits("30725361482547753048288", "wei"));
        expect(await this.Pool.valueFor(await this.Pool.balanceOf(this.Pool.address))).to.equal(parseUnits("776737105038709189241", "wei"));

        await this.mockYearnVault.setPricePerFullShare(parseEther("1.331"));
        await provider.send("evm_increaseTime", [30 * 24 * 60 * 60]);
        // Total pool value: $36,375
        // Gain this period: $3,309
        expect(await this.Pool.totalValue()).to.equal(parseUnits("36373589999999999972671", "wei"));

        // Management fee:  $59
        // Performance fee: $642
        await this.mockDai.connect(depositor4).approve(this.Pool.address, initialDeposit);
        await expect(this.Pool.connect(depositor4).deposit(initialDeposit)).to
          .emit(this.Pool, "Deposit").withArgs(depositor4.address, parseEther("10000"), parseEther("10000")).and
          .emit(this.Pool, "ManagementFee").withArgs(parseUnits("59752550263523549377", "wei")).and
          .emit(this.Pool, "PerformanceFee").withArgs(parseUnits("642957666140375714381", "wei"));

        // yVault share price: $1.33
        // Pool token price:   $1.11
        // Total pool value: $46,363
        // Pool share value: $1,722
        expect(await this.Pool.pricePerPoolToken()).to.equal(parseUnits("1110234942730949497", "wei"));
        expect(await this.Pool.totalValue()).to.equal(parseUnits("46363589999999999999998", "wei"));
        expect(await this.Pool.balanceOf(this.Pool.address)).to.equal(parseUnits("1551360234189797903991", "wei"));
        expect(await this.Pool.totalSupply()).to.equal(parseUnits("41551360234189797903991", "wei"));
        expect(await this.Pool.valueFor(await this.Pool.balanceOf(this.Pool.address))).to.equal(parseUnits("1722374340760828873894", "wei"));

        await this.mockYearnVault.setPricePerFullShare(parseEther("1.4641"));
        await provider.send("evm_increaseTime", [30 * 24 * 60 * 60]);
        // Total pool value: $50,999
        // Gain this period: $4,636
        expect(await this.Pool.totalValue()).to.equal(parseUnits("50999948999999999965164", "wei"));

        // Management fee:  $83
        // Performance fee: $899
        await this.mockDai.connect(depositor5).approve(this.Pool.address, initialDeposit);
        await expect(this.Pool.connect(depositor5).deposit(initialDeposit)).to
          .emit(this.Pool, "Deposit").withArgs(depositor5.address, parseEther("10000"), parseEther("10000")).and
          .emit(this.Pool, "ManagementFee").withArgs(parseUnits("83779935278855828604", "wei")).and
          .emit(this.Pool, "PerformanceFee").withArgs(parseUnits("899916269751265136678", "wei"));

        // yVault share price: $1.46
        // Pool token price:   $1.15
        // Total pool value: $60,989
        // Pool share value: $3,163
        expect(await this.Pool.pricePerPoolToken()).to.equal(parseUnits("1150426353957318809", "wei"));
        expect(await this.Pool.totalValue()).to.equal(parseUnits("60989948999999999958340", "wei"));
        expect(await this.Pool.balanceOf(this.Pool.address)).to.equal(parseUnits("2750007895986223746668", "wei"));
        expect(await this.Pool.totalSupply()).to.equal(parseUnits("52750007895986223746668", "wei"));
        expect(await this.Pool.valueFor(await this.Pool.balanceOf(this.Pool.address))).to.equal(parseUnits("3163681557133310207816", "wei"));

        await this.mockYearnVault.setPricePerFullShare(parseEther("1.6105"));
        await provider.send("evm_increaseTime", [30 * 24 * 60 * 60]);
        // Total pool value: $67,088
        // Gain this period: $6,099
        expect(await this.Pool.totalValue()).to.equal(parseUnits("67088527330441909663962", "wei"));

        // Withdrawal:      $12,275
        // Withdrawal fee:  $61
        // Management fee:  $110
        // Performance fee: $1,181
        await expect(this.Pool.connect(depositor1).withdraw(initialDeposit)).to
          .emit(this.Pool, "Withdrawal").withArgs(depositor1.address, parseUnits("12275140623227548629714", "wei")).and
          .emit(this.Pool, "WithdrawalFee").withArgs(rewardsManager.address, parseUnits("61684123734811802159", "wei")).and
          .emit(this.Pool, "ManagementFee").withArgs(parseUnits("110209331958950129461", "wei")).and
          .emit(this.Pool, "PerformanceFee").withArgs(parseUnits("1181528101444089155258", "wei"));

        // yVault share price: $1.61
        // Pool token price:   $1.22
        // Total pool value: $54,751
        // Pool share value: $5,377
        expect(await this.Pool.pricePerPoolToken()).to.equal(parseUnits("1227514062322724498", "wei"));
        expect(await this.Pool.totalValue()).to.equal(parseUnits("54751702583479549273744", "wei"));
        expect(await this.Pool.balanceOf(this.Pool.address)).to.equal(parseUnits("4380708737036090762690", "wei"));
        expect(await this.Pool.totalSupply()).to.equal(parseUnits("44380708737036090762690", "wei"));
        expect(await this.Pool.valueFor(await this.Pool.balanceOf(this.Pool.address))).to.equal(parseUnits("5377381577651956646412", "wei"));

        await this.mockYearnVault.setPricePerFullShare(parseEther("1.77155"));
        await provider.send("evm_increaseTime", [30 * 24 * 60 * 60]);
        // Total pool value: $60,226
        // Gain this period: $5,475
        expect(await this.Pool.totalValue()).to.equal(parseUnits("60226872841827504167122", "wei"));

        // Withdrawal:      $13,045
        // Withdrawal fee:  $65
        // Management fee:  $98
        // Performance fee: $1,056
        await expect(this.Pool.connect(depositor2).withdraw(initialDeposit)).to
          .emit(this.Pool, "Withdrawal").withArgs(depositor2.address, parseUnits("13045221418862444864727", "wei")).and
          .emit(this.Pool, "WithdrawalFee").withArgs(rewardsManager.address, parseUnits("65553876476695702837", "wei")).and
          .emit(this.Pool, "ManagementFee").withArgs(parseUnits("98937384467859717648", "wei")).and
          .emit(this.Pool, "PerformanceFee").withArgs(parseUnits("1056761735042477512466", "wei"));

        // yVault share price: $1.77
        // Pool token price:   $1.30
        // Total pool value: $47,116
        // Pool share value: $7,744
        expect(await this.Pool.pricePerPoolToken()).to.equal(parseUnits("1304522141886208234", "wei"));
        expect(await this.Pool.totalValue()).to.equal(parseUnits("47116097546488363606959", "wei"));
        expect(await this.Pool.balanceOf(this.Pool.address)).to.equal(parseUnits("5936927058187062292174", "wei"));
        expect(await this.Pool.totalSupply()).to.equal(parseUnits("35936927058187062292174", "wei"));
        expect(await this.Pool.valueFor(await this.Pool.balanceOf(this.Pool.address))).to.equal(parseUnits("7744852802168586991875", "wei"));

        await this.mockYearnVault.setPricePerFullShare(parseEther("1.948705"));
        await provider.send("evm_increaseTime", [30 * 24 * 60 * 60]);
        // Total pool value: $51,827
        // Gain this period: $4,711
        expect(await this.Pool.totalValue()).to.equal(parseUnits("51827707301137199970315", "wei"));

        // Withdrawal:      $13,805
        // Withdrawal fee:  $69
        // Management fee:  $85
        // Performance fee: $905
        await expect(this.Pool.connect(depositor3).withdraw(initialDeposit)).to
          .emit(this.Pool, "Withdrawal").withArgs(depositor3.address, parseUnits("13805218311014766379558", "wei")).and
          .emit(this.Pool, "WithdrawalFee").withArgs(rewardsManager.address, parseUnits("69372956336757619997", "wei")).and
          .emit(this.Pool, "ManagementFee").withArgs(parseUnits("85139698632653067039", "wei")).and
          .emit(this.Pool, "PerformanceFee").withArgs(parseUnits("905734790292410152856", "wei"));

        // yVault share price: $1.94
        // Pool token price:   $1.38
        // Total pool value: $37,953
        // Pool share value: $10,152
        expect(await this.Pool.pricePerPoolToken()).to.equal(parseUnits("1380521831101466642", "wei"));
        expect(await this.Pool.totalValue()).to.equal(parseUnits("37953116033785675977879", "wei"));
        expect(await this.Pool.balanceOf(this.Pool.address)).to.equal(parseUnits("7354402953183660728119", "wei"));
        expect(await this.Pool.totalSupply()).to.equal(parseUnits("27354402953183660728119", "wei"));
        expect(await this.Pool.valueFor(await this.Pool.balanceOf(this.Pool.address))).to.equal(parseUnits("10152913831587214695819", "wei"));

        await this.mockYearnVault.setPricePerFullShare(parseEther("2.1435755"));
        await provider.send("evm_increaseTime", [30 * 24 * 60 * 60]);
        // Total pool value: $41,748
        // Gain this period: $3,795
        expect(await this.Pool.totalValue()).to.equal(parseUnits("41748427637164243577615", "wei"));

        // Withdrawal:      $14,545
        // Withdrawal fee:  $73
        // Management fee:  $68
        // Performance fee: $726
        await expect(this.Pool.connect(depositor4).withdraw(initialDeposit)).to
          .emit(this.Pool, "Withdrawal").withArgs(depositor4.address, parseUnits("14545916439052540064906", "wei")).and
          .emit(this.Pool, "WithdrawalFee").withArgs(rewardsManager.address, parseUnits("73095057482676080728", "wei")).and
          .emit(this.Pool, "ManagementFee").withArgs(parseUnits("68582013994226918060", "wei")).and
          .emit(this.Pool, "PerformanceFee").withArgs(parseUnits("726511605112558190724", "wei"));

        // yVault share price: $2.14
        // Pool token price:   $1.45
        // Total pool value:   $27,129
        // Pool share value:   $12,447
        expect(await this.Pool.pricePerPoolToken()).to.equal(parseUnits("1454591643905228148", "wei"));
        expect(await this.Pool.totalValue()).to.equal(parseUnits("27129416140629027438801", "wei"));
        expect(await this.Pool.balanceOf(this.Pool.address)).to.equal(parseUnits("8557626927825348531375", "wei"));
        expect(await this.Pool.totalSupply()).to.equal(parseUnits("18557626927825348531375", "wei"));
        expect(await this.Pool.valueFor(await this.Pool.balanceOf(this.Pool.address))).to.equal(parseUnits("12447852620873342204632", "wei"));

        await this.mockYearnVault.setPricePerFullShare(parseEther("2.3579330499999998"));
        await provider.send("evm_increaseTime", [30 * 24 * 60 * 60]);
        // Total pool value: $29,842
        // Gain this period: $2,713
        expect(await this.Pool.totalValue()).to.equal(parseUnits("29842357754691927652717", "wei"));

        // Withdrawal:      $15,258
        // Withdrawal fee:  $76
        // Management fee:  $49
        // Performance fee: $517
        await expect(this.Pool.connect(depositor5).withdraw(initialDeposit)).to
          .emit(this.Pool, "Withdrawal").withArgs(depositor5.address, parseUnits("15258632241366849695402", "wei")).and
          .emit(this.Pool, "WithdrawalFee").withArgs(rewardsManager.address, parseUnits("76676543926466581383", "wei")).and
          .emit(this.Pool, "ManagementFee").withArgs(parseUnits("49023379154310740256", "wei")).and
          .emit(this.Pool, "PerformanceFee").withArgs(parseUnits("517055777325152412871", "wei"));

        // yVault share price: $2.35
        // Pool token price:   $1.52
        // Total pool value:   $14,507
        expect(await this.Pool.pricePerPoolToken()).to.equal(parseUnits("1525863224136675000", "wei"));
        expect(await this.Pool.totalValue()).to.equal(parseUnits("14507048969398611388586", "wei"));
        let poolBalance = await this.Pool.balanceOf(this.Pool.address)

        // All external depositors have withdrawn their pool tokens. The only remaining balance is owned by the pool.
        expect(poolBalance).to.equal(parseUnits("9459900137981562727499", "wei"));
        expect(await this.Pool.totalSupply()).to.equal(parseUnits("9459900137981562727499", "wei"));

        // $14,434 in management and performance fees drawn as pool tokens over pool lifetime
        // (The value calculated here is lower than the pool balance because valueFor subtracts out the withdrawal fee)
        expect(await this.Pool.valueFor(poolBalance)).to.equal(parseUnits("14434513724551618331644", "wei"));

        // $346 in withdrawal fees sent as DAI to rewardsManager over pool lifetime
        expect(await this.mockDai.balanceOf(rewardsManager.address)).to.equal(parseUnits("346382557957407787104", "wei"));
      });
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
      await this.Pool.connect(owner).setManagementFee(500);
      expect(await this.Pool.managementFee()).to.equal(500);
    });

    it("non-owner cannot set managementFee", async function () {
      expect(this.Pool.connect(depositor).setManagementFee(500)).to.be.revertedWith("Ownable: caller is not the owner");
    });

    it("owner can set performanceFee", async function () {
      await this.Pool.connect(owner).setPerformanceFee(5000);
      expect(await this.Pool.performanceFee()).to.equal(5000);
    });

    it("non-owner cannot set performanceFee", async function () {
      expect(this.Pool.connect(depositor).setPerformanceFee(500)).to.be.revertedWith("Ownable: caller is not the owner");
    });

    describe("sending accrued fees to rewards manager", async function() {
      it("owner can withdraw accrued fees", async function () {
        let deposit1Amount = parseEther("10000");
        await this.mockDai.connect(depositor1).approve(this.Pool.address, deposit1Amount);
        await this.Pool.connect(depositor1).deposit(deposit1Amount);
        await this.mockYearnVault.setPricePerFullShare(parseEther("2"));
        await provider.send("evm_increaseTime", [1 * 365 * 24 * 60 * 60]);
        await this.Pool.takeFees();
        expect(await this.Pool.balanceOf(this.Pool.address)).to.equal(parseUnits("4140868963403517575130", "wei"));
        await this.Pool.withdrawAccruedFees();
        expect(await this.Pool.balanceOf(this.Pool.address)).to.equal(0);
        expect(await this.mockDai.balanceOf(rewardsManager.address)).to.equal(parseUnits("5850741004878754004760", "wei"));
      });

    });
  });

});
