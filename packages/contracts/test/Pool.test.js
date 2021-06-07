const { expect } = require("chai");
const { waffle } = require("hardhat");
const { BigNumber } = require("ethers");
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

    MockCurveMetapool = await ethers.getContractFactory("MockCurveMetapool");
    this.mockCurveMetapool = await MockCurveMetapool.deploy();

    MockCurveRegistry = await ethers.getContractFactory("MockCurveRegistry");
    this.mockCurveRegistry = await MockCurveRegistry.deploy(this.mockCurveMetapool.address);

    MockCurveAddressProvider = await ethers.getContractFactory("MockCurveAddressProvider");
    this.mockCurveAddressProvider = await MockCurveAddressProvider.deploy(this.mockCurveRegistry.address);

    MockCurveDepositZap = await ethers.getContractFactory("MockCurveDepositZap");
    this.mockCurveDepositZap = await MockCurveDepositZap.deploy(this.mockCrvUSDX.address, this.mockDai.address);

    Pool = await ethers.getContractFactory("Pool");
    this.Pool = await Pool.deploy(
      this.mockDai.address,
      this.mockYearnVault.address,
      this.mockCurveAddressProvider.address,
      this.mockCurveDepositZap.address,
      rewardsManager.address,
    );
    await this.Pool.deployed();
  });

  describe("constructor", async function () {
    it("should be constructed with correct addresses", async function () {
      expect(await this.Pool.dai()).to.equal(this.mockDai.address);
      expect(await this.Pool.curveAddressProvider()).to.equal(this.mockCurveAddressProvider.address);
      expect(await this.Pool.curveDepositZap()).to.equal(this.mockCurveDepositZap.address);
      expect(await this.Pool.rewardsManager()).to.equal(rewardsManager.address);
    });

    it("finds the Curve metapool for the associated LP token", async function () {
      expect(await this.Pool.curveRegistry()).to.equal(this.mockCurveRegistry.address);
      expect(await this.Pool.curveMetapool()).to.equal(this.mockCurveMetapool.address);
    });
  })

  describe("pool token", async function () {
    it("has a token name", async function () {
      expect(await this.Pool.name()).to.equal("Popcorn DAI Pool");
    });

    it("has a token symbol", async function () {
      expect(await this.Pool.symbol()).to.equal("popDAI");
    });

    it("uses 18 decimals", async function () {
      expect(await this.Pool.decimals()).to.equal(18);
    });
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
    it("total assets is Yearn balance * Yearn price per share * Curve virtual price", async function () {
      let amount = parseEther("10000");
      await this.mockDai.connect(depositor).approve(this.Pool.address, amount);
      await this.Pool.connect(depositor).deposit(amount);
      expect(await this.Pool.totalValue()).to.equal(parseEther("10000"));
    });

    it("total assets change with Yearn price per share", async function () {
      let amount = parseEther("10000");
      await this.mockDai.connect(depositor).approve(this.Pool.address, amount);
      await this.Pool.connect(depositor).deposit(amount);
      await this.mockYearnVault.setPricePerFullShare(parseEther("1.5"));
      expect(await this.Pool.totalValue()).to.equal(parseEther("15000"));
    });

    it("total assets change with Curve virtual price", async function () {
      let amount = parseEther("10000");
      await this.mockDai.connect(depositor).approve(this.Pool.address, amount);
      await this.Pool.connect(depositor).deposit(amount);
      await this.mockCurveMetapool.setVirtualPrice(parseEther("1.05"));
      expect(await this.Pool.totalValue()).to.equal(parseEther("10500"));
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
      let deposit3Amount = parseEther("90000");

      await this.mockDai.connect(depositor1).approve(this.Pool.address, deposit1Amount);
      await this.Pool.connect(depositor1).deposit(deposit1Amount);

      await this.mockDai.connect(depositor2).approve(this.Pool.address, deposit2Amount);
      await this.Pool.connect(depositor2).deposit(deposit2Amount);
      await this.mockDai.connect(depositor2).approve(this.Pool.address, deposit3Amount);
      await this.Pool.connect(depositor2).deposit(deposit3Amount);

      expect(await this.Pool.balanceOf(depositor1.address)).to.equal(deposit1Amount);
      expect(await this.Pool.balanceOf(depositor2.address)).to.equal(parseUnits("93000000231961650583225", "wei"));
    });

    it("tokens convert 1:1 minus fees on withdrawal when underlying Yearn vault value is unchanged", async function () {
      let deposit1Amount = parseEther("10000");

      await this.mockDai.connect(depositor1).approve(this.Pool.address, deposit1Amount);
      await this.Pool.connect(depositor1).deposit(deposit1Amount);

      expect(await this.Pool.balanceOf(depositor1.address)).to.equal(parseEther("10000"));
      expect(await this.mockDai.balanceOf(depositor1.address)).to.equal(parseEther("90000"));
      let withdrawal1Amount = parseEther("10000");

      expect(await this.Pool.connect(depositor1).withdraw(withdrawal1Amount)).to
        .emit(this.Pool, "WithdrawalFee").withArgs(
          rewardsManager.address,
          parseUnits("49949999968342950238", "wei")).and
        .emit(this.Pool, "ManagementFee").withArgs(
          parseUnits("6337747701362", "wei")).and
        .emit(this.Pool, "Withdrawal").withArgs(
          depositor1.address,
          parseUnits("9940049993700247097462", "wei")
        );
      expect(await this.Pool.balanceOf(depositor1.address)).to.equal(parseEther("0"));

      let depositor1DaiBalance = await this.mockDai.balanceOf(depositor1.address);
      expect(depositor1DaiBalance).to.equal(parseUnits("99940049993700247097462", "wei"));
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
          parseUnits("90818181713530417847", "wei")).and.to
        .emit(this.Pool, "Withdrawal").withArgs(
          depositor.address,
          parseUnits("18072818160992553151633", "wei")).and.to
        .emit(this.Pool,"PerformanceFee").withArgs(
          parseUnits("1999999997464899074118", "wei")).and.to
        .emit(this.Pool, "ManagementFee").withArgs(
          parseUnits("25350990805449", "wei")
        );
      expect(await this.Pool.balanceOf(depositor.address)).to.equal(parseEther("0"));
      let depositorDaiBalance = await this.mockDai.balanceOf(depositor.address);
      expect(depositorDaiBalance).to.equal(parseUnits("108072818160992553151633", "wei"));
    });

    it("handles multiple deposits", async function () {
      let deposits = [
        [depositor1, parseEther("1000"), parseEther("1000"),                           parseEther("99000")],
        [depositor1, parseEther("2000"), parseUnits("3000000002535100003213", "wei"),  parseEther("97000")],
        [depositor2, parseEther("3000"), parseUnits("3000000007605300019280", "wei"),  parseEther("97000")],
        [depositor1, parseEther("4000"), parseUnits("7000000017745716061053", "wei"),  parseEther("93000")],
        [depositor1, parseEther("5000"), parseUnits("12000000043096766189588", "wei"), parseEther("88000")],
        [depositor2, parseEther("6000"), parseUnits("9000000045631890260283", "wei"),  parseEther("91000")]
      ]

      for ([depositor, deposit, poolBalance, daiBalance] of deposits) {
        await this.mockDai.connect(depositor).approve(this.Pool.address, deposit);
        await this.Pool.connect(depositor).deposit(deposit);

        expect(await this.Pool.balanceOf(depositor.address)).to.equal(poolBalance);
        expect(await this.mockDai.balanceOf(depositor.address)).to.equal(daiBalance);
      }

      expect(await this.mockYearnVault.balance()).to.equal(parseEther("21000"));
      this.mockYearnVault.setPricePerFullShare(parseEther("1.5"));

      let withdrawal1Amount = parseEther("12000");
      await expect(this.Pool.connect(depositor1).withdraw(withdrawal1Amount)).to
        .emit(this.Pool, "Withdrawal").withArgs(
          depositor1.address,
          parseUnits("16773834263376130016313", "wei")
        );

      let withdrawal2Amount = parseEther("9000");
      await expect(this.Pool.connect(depositor2).withdraw(withdrawal2Amount)).to
        .emit(this.Pool, "Withdrawal").withArgs(
          depositor2.address,
          parseUnits("12580375689558972816713", "wei")
        );
    });

    it("multiple small deposits", async function () {
      let deposit1Amount = parseEther("1000");
      for (let i=0; i<10; i++) {
        await this.mockDai.connect(depositor1).approve(this.Pool.address, deposit1Amount);
        await this.Pool.connect(depositor1).deposit(deposit1Amount);
      }

      expect(await this.Pool.balanceOf(depositor1.address)).to.equal(parseUnits("10000000057039755457900", "wei"));
      expect(await this.mockDai.balanceOf(depositor1.address)).to.equal(parseEther("90000"));

      let deposit2Amount = parseEther("10000");
      await this.mockDai.connect(depositor2).approve(this.Pool.address, deposit2Amount);
      await this.Pool.connect(depositor2).deposit(deposit2Amount);

      expect(await this.Pool.balanceOf(depositor2.address)).to.equal(parseUnits("10000000126755001606683", "wei"));
      expect(await this.mockDai.balanceOf(depositor2.address)).to.equal(parseEther("90000"));

      expect(await this.mockYearnVault.balance()).to.equal(parseEther("20000"));
      this.mockYearnVault.setPricePerFullShare(parseEther("2"));

      let withdrawal1Amount = this.Pool.balanceOf(depositor1.address);
      await this.Pool.connect(depositor1).withdraw(withdrawal1Amount);
      expect(await this.Pool.balanceOf(depositor1.address)).to.equal(parseEther("0"));
      let depositor1DaiBalance = await this.mockDai.balanceOf(depositor1.address);
      expect(depositor1DaiBalance).to.equal(parseUnits("108072818055823130548334", "wei"));

      let withdrawal2Amount = this.Pool.balanceOf(depositor2.address);
      await this.Pool.connect(depositor2).withdraw(withdrawal2Amount);
      expect(await this.Pool.balanceOf(depositor2.address)).to.equal(parseEther("0"));
      let depositor2DaiBalance = await this.mockDai.balanceOf(depositor2.address);
      expect(depositor2DaiBalance).to.equal(parseUnits("108072818170364129617973", "wei"));
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

      expect(await this.Pool.balanceOf(depositor2.address)).to.equal(parseUnits("10000000012675500016066", "wei"));
      expect(await this.mockDai.balanceOf(depositor2.address)).to.equal(parseEther("90000"));

      expect(await this.mockYearnVault.balance()).to.equal(parseEther("20000"));
      this.mockYearnVault.setPricePerFullShare(parseEther("2"));

      let withdrawal1Amount = parseEther("1000");
      for (let i=0; i<10; i++) {
        await this.Pool.connect(depositor1).withdraw(withdrawal1Amount);
      }
      let depositor1DaiBalance = await this.mockDai.balanceOf(depositor1.address);
      expect(depositor1DaiBalance).to.equal(parseUnits("108072818088623487624407", "wei"));

      let withdrawal2Amount = parseEther("10000");
      await this.Pool.connect(depositor2).withdraw(withdrawal2Amount);
      let depositor2DaiBalance = await this.mockDai.balanceOf(depositor2.address);
      expect(depositor2DaiBalance).to.equal(parseUnits("108072818025625959262892", "wei"));
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
          "9081818108608730563",
          "1807281803613137382053"
        ],
        [
          depositor2,
          "10000",
          "90818181201211623327",
          "18072818059041113042109"
        ],
        [
          depositor3,
          "100000",
          "908181813163291857804",
          "180728180819495079703126"
        ],
        [
          depositor4,
          "1000000",
          "9081818143145389612876",
          "1807281810485932532962407"
        ],
        [
          depositor5,
          "100000000",
          "908181815466069292556697",
          "180728181277747789218782716"
        ]
      ]

      for([depositor, deposit] of deposits) {
        await makeDeposit(depositor, deposit);
      }

      expect(await this.mockYearnVault.balance()).to.equal(parseEther("101111000"));
      this.mockYearnVault.setPricePerFullShare(parseEther("2"));

      async function _expectation(depositor, amount, fee, withdrawal) {
        let withdrawalAmount = this.Pool.balanceOf(depositor.address);
        await expect(this.Pool.connect(depositor).withdraw(withdrawalAmount)).to
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
    it("calculated value is greater than realized withdrawal amount due to fees", async function () {
      let amount = parseEther("20000");
      await this.mockDai.connect(depositor).approve(this.Pool.address, amount);
      await this.Pool.connect(depositor).deposit(amount);
      await expect(this.Pool.connect(depositor).withdraw(parseEther("10000"))).to
        .emit(this.Pool, "WithdrawalFee").withArgs(
          rewardsManager.address,
          parseUnits("49949999968342950238", "wei")).and
        .emit(this.Pool, "Withdrawal").withArgs(
          depositor.address,
          parseUnits("9940049993700247097462", "wei")
        );
      expect(await this.Pool.connect(depositor).valueFor(parseEther("10000"))).to.equal(parseUnits("9999999993662252301966", "wei"));
    });

    it("when underlying vault value increases", async function () {
      let amount = parseEther("20000");
      await this.mockDai.connect(depositor).approve(this.Pool.address, amount);
      await this.Pool.connect(depositor).deposit(amount);
      await this.mockYearnVault.setPricePerFullShare(parseEther("2"));
      await expect(this.Pool.connect(depositor).withdraw(parseEther("10000"))).to
        .emit(this.Pool, "WithdrawalFee").withArgs(
          rewardsManager.address,
          parseUnits("90818181713530500364", "wei")).and
        .emit(this.Pool, "Withdrawal").withArgs(
          depositor.address,
          parseUnits("18072818160992569572596", "wei")
        );
      expect(await this.Pool.connect(depositor).valueFor(parseEther("10000"))).to.equal(parseUnits("18181818160866967073418", "wei"));
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
          parseUnits("49949999588457686018", "wei")).and
        .emit(this.Pool, "Withdrawal").withArgs(
          depositor.address,
          parseUnits("9940049918103079517632", "wei")
        );
      expect(await this.Pool.connect(depositor).valueFor(parseEther("10000"))).to.equal(parseUnits("9999999917609146360367", "wei"));
    });

    it("calculating value for a single pool token", async function () {
      let amount = parseEther("10000");
      await this.mockDai.connect(depositor).approve(this.Pool.address, amount);
      await this.Pool.connect(depositor).deposit(amount);
      let valueForOneShare = await this.Pool.valueFor(parseEther("1"));
      let pricePerPoolToken = await this.Pool.pricePerPoolToken();
      expect(pricePerPoolToken).to.equal(parseUnits("1000000000000000000", "wei"));
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
        await provider.send("evm_increaseTime", [365 * 24 * 60 * 60]);
        await this.Pool.takeFees();

        let managementTokenBalance = await this.Pool.balanceOf(this.Pool.address);
        expect(await this.Pool.valueFor(managementTokenBalance)).to.equal(parseUnits("195950797560009930000", "wei"));
      });

      it("shorter periods issue fewer shares", async function () {
        let amount = parseEther("10000");
        await this.mockDai.connect(depositor).approve(this.Pool.address, amount);

        expect(await this.Pool.balanceOf(this.Pool.address)).to.equal(0);
        await this.Pool.connect(depositor).deposit(amount);
        await provider.send("evm_increaseTime", [7 * 24 * 60 * 60]);
        await this.Pool.takeFees();

        let managementTokenBalance = await this.Pool.balanceOf(this.Pool.address);
        expect(await this.Pool.valueFor(managementTokenBalance)).to.equal(parseUnits("3831601130322330000", "wei"));
      });

      it("feesUpdatedAt is contract creation block for new pool", async function () {
        let deployBlock = await provider.getBlock(this.Pool.deployTransaction.blockNumber);
        let deployTimestamp = deployBlock.timestamp;
        expect(await this.Pool.feesUpdatedAt()).to.equal(deployTimestamp);
      });

      it("larger management fees dilute token value", async function () {
        await this.Pool.connect(owner).setManagementFee(5000);

        let amount = parseEther("10000");
        await this.mockDai.connect(depositor).approve(this.Pool.address, amount);

        expect(await this.Pool.balanceOf(this.Pool.address)).to.equal(0);
        await this.Pool.connect(depositor).deposit(amount);
        await provider.send("evm_increaseTime", [365 * 24 * 60 * 60]);
        await this.Pool.takeFees();

        let managementTokenBalance = await this.Pool.balanceOf(this.Pool.address);
        expect(await this.Pool.pricePerPoolToken()).to.equal(parseUnits("666814242093680000", "wei"));
        expect(await this.Pool.valueFor(managementTokenBalance)).to.equal(parseUnits("3331857579063154670000", "wei"));
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
        await expect(this.Pool.connect(depositor).withdraw(parseEther("10000"))).to.emit(this.Pool, "PerformanceFee").withArgs(parseEther("2000"));
      });

      it("takes no performance fee when value decreases below HWM", async function () {
        let amount = parseEther("20000");
        await this.mockDai.connect(depositor).approve(this.Pool.address, amount);
        await this.Pool.connect(depositor).deposit(amount);
        await this.mockYearnVault.setPricePerFullShare(parseEther("1.5"));
        expect(await this.Pool.pricePerPoolToken()).to.equal(parseEther("1.5"));
        await expect(this.Pool.connect(depositor).withdraw(parseEther("10000"))).to.emit(this.Pool, "PerformanceFee").withArgs(parseEther("2000"));
        await this.mockYearnVault.setPricePerFullShare(parseEther("1.25"));
        expect(await this.Pool.pricePerPoolToken()).to.equal(parseUnits("1171874999999999218", "wei"));
        await expect(this.Pool.connect(depositor).withdraw(parseEther("10000"))).not.to.emit(this.Pool, "PerformanceFee")
      });

      it("takes a performance fee when value decreases below HWM, then increases above it", async function () {
        let amount = parseEther("30000");
        await this.mockDai.connect(depositor).approve(this.Pool.address, amount);
        await this.Pool.connect(depositor).deposit(amount);

        await this.mockYearnVault.setPricePerFullShare(parseEther("1.5"));
        expect(await this.Pool.pricePerPoolToken()).to.equal(parseUnits("1499999999999985000", "wei"));
        await expect(this.Pool.connect(depositor).withdraw(parseEther("10000"))).to.emit(this.Pool, "PerformanceFee").withArgs(parseUnits("2999999999999910000000", "wei"));

        await this.mockYearnVault.setPricePerFullShare(parseEther("1.25"));
        expect(await this.Pool.pricePerPoolToken()).to.equal(parseUnits("1171874999999987616", "wei"));
        await expect(this.Pool.connect(depositor).withdraw(parseEther("10000"))).not.to.emit(this.Pool, "PerformanceFee")

        await this.mockYearnVault.setPricePerFullShare(parseEther("1.75"));
        expect(await this.Pool.pricePerPoolToken()).to.equal(parseUnits("1640624999999990022", "wei"));
        await expect(this.Pool.connect(depositor).withdraw(parseEther("10000"))).to.emit(this.Pool, "PerformanceFee").withArgs(parseUnits("562500000000009844199", "wei"));
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
        // Pool token price:   $1.00
        // Total pool value:   $10,000
        // Pool share value:   $0
        expect(await this.Pool.pricePerPoolToken()).to.equal(parseUnits("1000000000000000000", "wei"));
        expect(await this.Pool.totalValue()).to.equal(parseUnits("10000000000000000000000", "wei"));
        expect(await this.Pool.balanceOf(this.Pool.address)).to.equal(parseUnits("0", "wei"));
        expect(await this.Pool.totalSupply()).to.equal(parseUnits("10000000000000000000000", "wei"));
        expect(await this.Pool.valueFor(await this.Pool.balanceOf(this.Pool.address))).to.equal(parseUnits("0", "wei"));

        // Increase vault share value by 10% in each period
        await this.mockYearnVault.setPricePerFullShare(parseEther("1.1"));
        // Fast forward 30 days in each period
        await provider.send("evm_increaseTime", [30 * 24 * 60 * 60]);
        // Total pool value: $11,000
        // Gain this period: $1,000
        expect(await this.Pool.totalValue()).to.equal(parseUnits("11000000000000000000000", "wei"));

        // We've had assets worth $11,000 under management for 30 days.
        // Management fee:  $18.07

        // We've earned $1000 profit this period
        // Performance fee: $196
        await this.mockDai.connect(depositor2).approve(this.Pool.address, initialDeposit);
        await expect(this.Pool.connect(depositor2).deposit(initialDeposit)).to
          .emit(this.Pool, "Deposit").withArgs(depositor2.address, parseEther("10000"), parseUnits("9268684182739424164739", "wei")).and
          .emit(this.Pool, "ManagementFee").withArgs(parseUnits("18070200189169093390", "wei")).and
          .emit(this.Pool, "PerformanceFee").withArgs(parseUnits("196714509056494691150", "wei"));

        // yVault share price: $1.10
        // Pool token price:   $1.07
        // Total pool value: $20,999
        // Pool share value: $210
        expect(await this.Pool.pricePerPoolToken()).to.equal(parseUnits("1078901794779290999", "wei"));
        expect(await this.Pool.totalValue()).to.equal(parseUnits("20999999999999999999999", "wei"));
        expect(await this.Pool.balanceOf(this.Pool.address)).to.equal(parseUnits("195552601013312919691", "wei"));
        expect(await this.Pool.totalSupply()).to.equal(parseUnits("19464236783752737084430", "wei"));
        expect(await this.Pool.valueFor(await this.Pool.balanceOf(this.Pool.address))).to.equal(parseUnits("210982052207022683999", "wei"));

        await this.mockYearnVault.setPricePerFullShare(parseEther("1.21"));
        await provider.send("evm_increaseTime", [30 * 24 * 60 * 60]);
        // Total pool value: $23,099
        // Gain this period: $2,100
        expect(await this.Pool.totalValue()).to.equal(parseUnits("23099999999999999980907", "wei"));

        // Management fee:  $38
        // Performance fee: $413
        await this.mockDai.connect(depositor3).approve(this.Pool.address, initialDeposit);
        await expect(this.Pool.connect(depositor3).deposit(initialDeposit)).to
          .emit(this.Pool, "Deposit").withArgs(depositor3.address, parseEther("10000"), parseUnits("8590850647936403988756", "wei")).and
          .emit(this.Pool, "ManagementFee").withArgs(parseUnits("37947420397255096088", "wei")).and
          .emit(this.Pool, "PerformanceFee").withArgs(parseUnits("413100469018671896216", "wei"));

        // yVault share price: $1.21
        // Pool token price:   $1.16
        // Total pool value: $33,099
        // Pool share value: $670
        expect(await this.Pool.pricePerPoolToken()).to.equal(parseUnits("1164029082777953898", "wei"));
        expect(await this.Pool.totalValue()).to.equal(parseUnits("33099999999999999972643", "wei"));
        expect(await this.Pool.balanceOf(this.Pool.address)).to.equal(parseUnits("576180813993524413211", "wei"));
        expect(await this.Pool.totalSupply()).to.equal(parseUnits("28435715644669352566706", "wei"));
        expect(await this.Pool.valueFor(await this.Pool.balanceOf(this.Pool.address))).to.equal(parseUnits("670691224427153681645", "wei"));

        await this.mockYearnVault.setPricePerFullShare(parseEther("1.331"));
        await provider.send("evm_increaseTime", [30 * 24 * 60 * 60]);
        // Total pool value: $36,409
        // Gain this period: $3,310
        expect(await this.Pool.totalValue()).to.equal(parseUnits("36409999999999999972643", "wei"));

        // Management fee:  $59
        // Performance fee: $651
        await this.mockDai.connect(depositor4).approve(this.Pool.address, initialDeposit);
        await expect(this.Pool.connect(depositor4).deposit(initialDeposit)).to
          .emit(this.Pool, "Deposit").withArgs(depositor4.address, parseEther("10000"), parseUnits("7962588151680626739316", "wei")).and
          .emit(this.Pool, "ManagementFee").withArgs(parseUnits("59812362626149699076", "wei")).and
          .emit(this.Pool, "PerformanceFee").withArgs(parseUnits("651125024977092699983", "wei"));

        // yVault share price: $1.33
        // Pool token price:   $1.25
        // Total pool value: $46,409
        // Pool share value: $1,421
        expect(await this.Pool.pricePerPoolToken()).to.equal(parseUnits("1255873066584435389", "wei"));
        expect(await this.Pool.totalValue()).to.equal(parseUnits("46409999999999999999997", "wei"));
        expect(await this.Pool.balanceOf(this.Pool.address)).to.equal(parseUnits("1132248629592609527246", "wei"));
        expect(await this.Pool.totalSupply()).to.equal(parseUnits("36954371611949064420057", "wei"));
        expect(await this.Pool.valueFor(await this.Pool.balanceOf(this.Pool.address))).to.equal(parseUnits("1421960558582517159569", "wei"));

        await this.mockYearnVault.setPricePerFullShare(parseEther("1.4641"));
        await provider.send("evm_increaseTime", [30 * 24 * 60 * 60]);
        // Total pool value: $51,509
        // Gain this period: $5,100
        expect(await this.Pool.totalValue()).to.equal(parseUnits("51050999999999999965129", "wei"));

        // Management fee:  $83
        // Performance fee: $912
        await this.mockDai.connect(depositor5).approve(this.Pool.address, initialDeposit);
        await expect(this.Pool.connect(depositor5).deposit(initialDeposit)).to
          .emit(this.Pool, "Deposit").withArgs(depositor5.address, parseEther("10000"), parseUnits("7380271485514908578001", "wei")).and
          .emit(this.Pool, "ManagementFee").withArgs(parseUnits("83863799077933762366", "wei")).and
          .emit(this.Pool, "PerformanceFee").withArgs(parseUnits("912952036531259911967", "wei"));

        // yVault share price: $1.46
        // Pool token price:   $1.35
        // Total pool value: $61,051
        // Pool share value: $2,513
        expect(await this.Pool.pricePerPoolToken()).to.equal(parseUnits("1354963705552911186", "wei"));
        expect(await this.Pool.totalValue()).to.equal(parseUnits("61050999999999999958298", "wei"));
        expect(await this.Pool.balanceOf(this.Pool.address)).to.equal(parseUnits("1854900978345582084005", "wei"));
        expect(await this.Pool.totalSupply()).to.equal(parseUnits("45057295446216945554817", "wei"));
        expect(await this.Pool.valueFor(await this.Pool.balanceOf(this.Pool.address))).to.equal(parseUnits("2513323503052915070634", "wei"));

        await this.mockYearnVault.setPricePerFullShare(parseEther("1.6105"));
        await provider.send("evm_increaseTime", [30 * 24 * 60 * 60]);
        // Total pool value: $67,155
        // Gain this period: $6,104
        expect(await this.Pool.totalValue()).to.equal(parseUnits("67155683013455365028990", "wei"));

        // Withdrawal:      $14,531
        // Withdrawal fee:  $73
        // Management fee:  $110
        // Performance fee: $1,200
        var withdrawalAmount = await this.Pool.balanceOf(depositor1.address);
        await expect(this.Pool.connect(depositor1).withdraw(withdrawalAmount)).to
          .emit(this.Pool, "Withdrawal").withArgs(depositor1.address, parseUnits("14531014389071920408612", "wei")).and
          .emit(this.Pool, "WithdrawalFee").withArgs(rewardsManager.address, parseUnits("73020172809406635219", "wei")).and
          .emit(this.Pool, "ManagementFee").withArgs(parseUnits("110319651610560690151", "wei")).and
          .emit(this.Pool, "PerformanceFee").withArgs(parseUnits("1200878359670507442544", "wei"));

        // yVault share price: $1.61
        // Pool token price:   $1.46
        // Total pool value: $52,537
        // Pool share value: $3,999
        expect(await this.Pool.pricePerPoolToken()).to.equal(parseUnits("1461865321509609514", "wei"));
        expect(await this.Pool.totalValue()).to.equal(parseUnits("52537029798358941570768", "wei"));
        expect(await this.Pool.balanceOf(this.Pool.address)).to.equal(parseUnits("2735957051477138623771", "wei"));
        expect(await this.Pool.totalSupply()).to.equal(parseUnits("35938351519348502094583", "wei"));
        expect(await this.Pool.valueFor(await this.Pool.balanceOf(this.Pool.address))).to.equal(parseUnits("3999600734694200341682", "wei"));

        await this.mockYearnVault.setPricePerFullShare(parseEther("1.77155"));
        await provider.send("evm_increaseTime", [30 * 24 * 60 * 60]);
        // Total pool value: $57,790
        // Gain this period: $5,253
        expect(await this.Pool.totalValue()).to.equal(parseUnits("57790732778194835731107", "wei"));

        // Withdrawal:      $14,531
        // Withdrawal fee:  $73
        // Management fee:  $95
        // Performance fee: $1,033
        withdrawalAmount = await this.Pool.balanceOf(depositor2.address);
        await expect(this.Pool.connect(depositor2).withdraw(withdrawalAmount)).to
          .emit(this.Pool, "Withdrawal").withArgs(depositor2.address, parseUnits("14531014396621263740531", "wei")).and
          .emit(this.Pool, "WithdrawalFee").withArgs(rewardsManager.address, parseUnits("73020172847343033872", "wei")).and
          .emit(this.Pool, "ManagementFee").withArgs(parseUnits("94935427953760421735", "wei")).and
          .emit(this.Pool, "PerformanceFee").withArgs(parseUnits("1033479609066377901922", "wei"));

        // yVault share price: $1.77
        // Pool token price:   $1.57
        // Total pool value: $43,170
        // Pool share value: $5,423
        expect(await this.Pool.pricePerPoolToken()).to.equal(parseUnits("1577209119921754896", "wei"));
        expect(await this.Pool.totalValue()).to.equal(parseUnits("43172079555503537691253", "wei"));
        expect(await this.Pool.balanceOf(this.Pool.address)).to.equal(parseUnits("3438740844014982475820", "wei"));
        expect(await this.Pool.totalSupply()).to.equal(parseUnits("27372451129146921781893", "wei"));
        expect(await this.Pool.valueFor(await this.Pool.balanceOf(this.Pool.address))).to.equal(parseUnits("5423613420227922796924", "wei"));

        await this.mockYearnVault.setPricePerFullShare(parseEther("1.948705"));
        await provider.send("evm_increaseTime", [30 * 24 * 60 * 60]);
        // Total pool value: $47,489
        // Gain this period: $4,319
        expect(await this.Pool.totalValue()).to.equal(parseUnits("47489287511053891436009", "wei"));

        // Withdrawal:      $14,531
        // Withdrawal fee:  $73
        // Management fee:  $78
        // Performance fee: $849
        withdrawalAmount = await this.Pool.balanceOf(depositor3.address);
        await expect(this.Pool.connect(depositor3).withdraw(withdrawalAmount)).to
          .emit(this.Pool, "Withdrawal").withArgs(depositor3.address, parseUnits("14531014404170597252971", "wei")).and
          .emit(this.Pool, "WithdrawalFee").withArgs(rewardsManager.address, parseUnits("73020172885279383180", "wei")).and
          .emit(this.Pool, "ManagementFee").withArgs(parseUnits("78012781917556041316", "wei")).and
          .emit(this.Pool, "PerformanceFee").withArgs(parseUnits("849257448943225220778", "wei"));

        // yVault share price: $1.94
        // Pool token price:   $1.70
        // Total pool value: $32,876
        // Pool share value: $6,762
        expect(await this.Pool.pricePerPoolToken()).to.equal(parseUnits("1701653751109902531", "wei"));
        expect(await this.Pool.totalValue()).to.equal(parseUnits("32870634280767728644562", "wei"));
        expect(await this.Pool.balanceOf(this.Pool.address)).to.equal(parseUnits("3974016230957624413311", "wei"));
        expect(await this.Pool.totalSupply()).to.equal(parseUnits("19316875868153159730628", "wei"));
        expect(await this.Pool.valueFor(await this.Pool.balanceOf(this.Pool.address))).to.equal(parseUnits("6762399626380791344490", "wei"));

        await this.mockYearnVault.setPricePerFullShare(parseEther("2.1435755"));
        await provider.send("evm_increaseTime", [30 * 24 * 60 * 60]);
        // Total pool value: $36,157
        // Gain this period: $3,281
        expect(await this.Pool.totalValue()).to.equal(parseUnits("36157697708844501510705", "wei"));

        // Withdrawal:      $14,531
        // Withdrawal fee:  $73
        // Management fee:  $59
        // Performance fee: $646
        withdrawalAmount = await this.Pool.balanceOf(depositor4.address);
        await expect(this.Pool.connect(depositor4).withdraw(withdrawalAmount)).to
          .emit(this.Pool, "Withdrawal").withArgs(depositor4.address, parseUnits("14531014411720133218912", "wei")).and
          .emit(this.Pool, "WithdrawalFee").withArgs(rewardsManager.address, parseUnits("73020172923216749843", "wei")).and
          .emit(this.Pool, "ManagementFee").withArgs(parseUnits("59397871264007155545", "wei")).and
          .emit(this.Pool, "PerformanceFee").withArgs(parseUnits("646613072658360970655", "wei"));

        // yVault share price: $2.14
        // Pool token price:   $1.83
        // Total pool value:   $21,539
        // Pool share value:   $7,989
        expect(await this.Pool.pricePerPoolToken()).to.equal(parseUnits("1835917287119214652", "wei"));
        expect(await this.Pool.totalValue()).to.equal(parseUnits("21539044470963270327618", "wei"));
        expect(await this.Pool.balanceOf(this.Pool.address)).to.equal(parseUnits("4351762752672665867679", "wei"));
        expect(await this.Pool.totalSupply()).to.equal(parseUnits("11732034238187574445680", "wei"));
        expect(await this.Pool.valueFor(await this.Pool.balanceOf(this.Pool.address))).to.equal(parseUnits("7989476467073319460124", "wei"));

        await this.mockYearnVault.setPricePerFullShare(parseEther("2.3579330499999998"));
        await provider.send("evm_increaseTime", [30 * 24 * 60 * 60]);
        // Total pool value: $23,693
        // Gain this period: $2,155
        //expect(await this.Pool.totalValue()).to.equal(parseUnits("23692948918059595340694", "wei"));

        // Withdrawal:      $14,531
        // Withdrawal fee:  $73
        // Management fee:  $38
        // Performance fee: $423
        withdrawalAmount = await this.Pool.balanceOf(depositor5.address);
        await expect(this.Pool.connect(depositor5).withdraw(withdrawalAmount)).to
          .emit(this.Pool, "Withdrawal").withArgs(depositor5.address, parseUnits("14531014419269154460980", "wei")).and
          .emit(this.Pool, "WithdrawalFee").withArgs(rewardsManager.address, parseUnits("73020172961151529954", "wei")).and
          .emit(this.Pool, "ManagementFee").withArgs(parseUnits("38921469531378942543", "wei")).and
          .emit(this.Pool, "PerformanceFee").withArgs(parseUnits("423704258595388095259", "wei"));

        // yVault share price: $2.35
        // Pool token price:   $1.98
        // Total pool value:   $9,074
        expect(await this.Pool.pricePerPoolToken()).to.equal(parseUnits("1980774457168340005", "wei"));
        expect(await this.Pool.totalValue()).to.equal(parseUnits("9074295672583813578036", "wei"));
        let poolBalance = await this.Pool.balanceOf(this.Pool.address)

        // All external depositors have withdrawn their pool tokens. The only remaining balance is owned by the pool.
        expect(poolBalance).to.equal(parseUnits("4581185727503861003163", "wei"));
        expect(await this.Pool.totalSupply()).to.equal(parseUnits("4581185727503861003163", "wei"));

        // $9,074 in management and performance fees drawn as pool tokens over pool lifetime
        expect(await this.Pool.valueFor(poolBalance)).to.equal(parseUnits("9074295672583813578036", "wei"));

        // $365 in withdrawal fees sent as DAI to rewardsManager over pool lifetime
        expect(await this.mockDai.balanceOf(rewardsManager.address)).to.equal(parseUnits("365100864426397332068", "wei"));
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
        await provider.send("evm_increaseTime", [365 * 24 * 60 * 60]);
        await this.Pool.takeFees();
        expect(await this.Pool.balanceOf(this.Pool.address)).to.equal(parseUnits("1199467748800196974433", "wei"));
        await this.Pool.withdrawAccruedFees();
        expect(await this.Pool.balanceOf(this.Pool.address)).to.equal(0);
        expect(await this.mockDai.balanceOf(rewardsManager.address)).to.equal(parseUnits("2139866479243654574040", "wei"));
      });

    });
  });

});
