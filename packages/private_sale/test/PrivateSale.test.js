const { expect } = require("chai");
const { waffle, ethers } = require("hardhat");
const { parseEther } = require("ethers/lib/utils");
const { parseFixed } = require("@ethersproject/bignumber");
const provider = waffle.provider;

describe('PrivateSale', function () {
  let owner, treasury, participant1, participant2;
  const DefaultSupply = parseEther("7500000");
  const MinimumPurchase = parseFixed("25000", 6);
  const TokenPrice = parseFixed("15", 4);
  const Participant1Initial = parseFixed("100000", 6);
  const Participant2Initial = parseFixed("2000000", 6);

  beforeEach(async function () {
    [owner, treasury, participant1, participant2, participant3] = await ethers.getSigners();

    let MockERC20 = await ethers.getContractFactory("MockERC20");
    this.mockPop = await MockERC20.deploy("TestPOP", "TPOP");
    await this.mockPop.mint(owner.address, parseEther("1000"));

    this.mockUsdc = await MockERC20.deploy("TestUSDC", "TUSDC");
    await this.mockUsdc.mint(participant1.address, Participant1Initial);
    await this.mockUsdc.mint(participant2.address, Participant2Initial);

    let MockTokenManager = await ethers.getContractFactory("MockTokenManager");
    this.mockTokenManager = await MockTokenManager.deploy();

    let PrivateSale = await ethers.getContractFactory("PrivateSale");
    this.privateSale = await PrivateSale.deploy(
      this.mockTokenManager.address,
      this.mockPop.address,
      this.mockUsdc.address,
      treasury.address,
      DefaultSupply
    );
    await this.privateSale.deployed();
  });

  it("should be constructed with expected values", async function () {
    expect(await this.privateSale.tokenManager()).to.equal(this.mockTokenManager.address);
    expect(await this.privateSale.pop()).to.equal(this.mockPop.address);
    expect(await this.privateSale.usdc()).to.equal(this.mockUsdc.address);
    expect(await this.privateSale.treasury()).to.equal(treasury.address);
    expect(await this.privateSale.supply()).to.equal(DefaultSupply);
    expect(await this.privateSale.minimumPurchase()).to.equal(MinimumPurchase);
  });

  it("should revert setting to same Treasury", async function () {
    await expect(this.privateSale.setTreasury(treasury.address)).to.be.revertedWith("Same Treasury");
  });

  it("should revert setting to same supply", async function () {
    await expect(this.privateSale.setSupply(DefaultSupply)).to.be.revertedWith("Same supply");
  });

  it("should revert for low allowance", async function () {
    await expect(
      this.privateSale.allowParticipant(participant1.address, parseFixed("50", 6))
    ).to.be.revertedWith("Allowance too low");
  });

  describe("sets new dependents", function () {
    it("sets new Treasury", async function () {
      result = await this.privateSale.setTreasury(owner.address);
      expect(await this.privateSale.treasury()).to.equal(owner.address);
      expect(result).to.emit(this.privateSale, "TreasuryChanged").withArgs(treasury.address, owner.address);
    });

    it("sets new supply", async function () {
      const newSupply = parseEther("12345");
      result = await this.privateSale.setSupply(newSupply);
      expect(await this.privateSale.supply()).to.equal(newSupply);
      expect(result).to.emit(this.privateSale, "SupplyChanged").withArgs(DefaultSupply, newSupply);
    });
  });

  describe("set participants allowances", function () {
    beforeEach(async function () {
      participant1Allowance = parseFixed("100000", 6);
      participant2Allowance = parseFixed("500000", 6);
      result = await this.privateSale.allowParticipant(participant1.address, participant1Allowance);
      await this.privateSale.allowParticipant(participant2.address, participant2Allowance);
      await this.privateSale.allowParticipant(participant3.address, MinimumPurchase);
    });

    it("should emit expected events", async function () {
      expect(result).to.emit(this.privateSale, "ParticipantAllowed")
        .withArgs(participant1.address, participant1Allowance);
    });

    it("should revert purchase for non-participant", async function () {
      await expect(this.privateSale.purchase(parseFixed("1", 6))).to.be.revertedWith("Participant not allowed");
    });

    it("should revert when minimum amount not met", async function () {
      await expect(this.privateSale.connect(participant1).purchase("0")).to.be.revertedWith("Minimum not met");
      await expect(
        this.privateSale.connect(participant1).purchase(parseFixed("1", 6))
      ).to.be.revertedWith("Minimum not met");
    });

    it("should revert when not enough allowance", async function () {
      await expect(
        this.privateSale.connect(participant1).purchase(participant1Allowance.add("1"))
      ).to.be.revertedWith("Allowance exceeded");
    });

    it("should fail purchase when not enough balance", async function () {
      await expect(
        this.privateSale.connect(participant3).purchase(MinimumPurchase)
      ).to.be.revertedWith("ERC20: transfer amount exceeds balance");
    });

    it("should fail purchase above approved amount", async function () {
      await this.mockUsdc.connect(participant1).approve(this.privateSale.address, participant1Allowance.sub("1"));
      await expect(
        this.privateSale.connect(participant1).purchase(participant1Allowance)
      ).to.be.revertedWith("ERC20: transfer amount exceeds allowance");
    });

    describe("participant1 purchases POP", function () {
      beforeEach(async function () {
        expectedParticipant1Pop = participant1Allowance.div(TokenPrice).mul(parseEther("1"));
        await this.mockUsdc.connect(participant1).approve(this.privateSale.address, participant1Allowance);
        result = await this.privateSale.connect(participant1).purchase(participant1Allowance);
      });

      it("emits expected events", async function () {
        expect(result).to.emit(this.privateSale, "TokensPurchased")
          .withArgs(participant1.address, expectedParticipant1Pop);
      });

      it("participant has expected balance", async function () {
        expect(
          await this.mockUsdc.balanceOf(participant1.address)
        ).to.equal(Participant1Initial.sub(participant1Allowance));
      });

      it("Treasury has expected balance", async function () {
        expect(
          await this.mockUsdc.balanceOf(treasury.address)
        ).to.equal(participant1Allowance);
      });

      it("has updated supply", async function () {
        expect(await this.privateSale.supply()).to.equal(DefaultSupply.sub(expectedParticipant1Pop));
      });

      it("has updated participant allowance", async function () {
        expect(await this.privateSale.allowances(participant1.address)).to.equal("0");
      });

      it("should revert when purchasing with no remaining allowance", async function () {
        await this.mockUsdc.connect(participant1).approve(this.privateSale.address, MinimumPurchase);
        await expect(
          this.privateSale.connect(participant1).purchase(MinimumPurchase)
        ).to.be.revertedWith("Allowance exceeded");
      });
    });
  })
});
