const { BigNumber } = require("@ethersproject/bignumber");
const { expect } = require("chai");
const { parseEther } = require("ethers/lib/utils");
const { ethers } = require("hardhat");
const { IGrantRegistry } = require("../typechain");

let stakingFund;

describe("Staking", function () {
  before(async function () {
    [owner, rewarder, nonOwner] = await ethers.getSigners();

    MockERC20 = await ethers.getContractFactory("MockERC20");
    this.mockPop = await MockERC20.deploy("TestPOP", "TPOP");
    await this.mockPop.mint(owner.address, parseEther("500"));
    await this.mockPop.mint(nonOwner.address, parseEther("10"));
  });

  beforeEach(async function () {
    const Staking = await ethers.getContractFactory("Staking");
    this.contract = await Staking.deploy(this.mockPop.address);
    await this.contract.deployed();
    stakingFund = parseEther("10");
    await this.mockPop.transfer(this.contract.address, stakingFund);
    await this.contract.notifyRewardAmount(stakingFund);
  });

  describe("stake", function () {
    it("should reject zero amount", async function () {
      await expect(this.contract.stake(0, 604800)).to.be.revertedWith(
        "amount must be greater than 0"
      );
    });

    it("should lock for at least a week", async function () {
      await expect(this.contract.stake(1, 604799)).to.be.revertedWith(
        "must lock tokens for at least 1 week"
      );
    });

    it("should lock at most 4 years", async function () {
      await expect(
        this.contract.stake(1, 604800 * 52 * 4 + 1)
      ).to.be.revertedWith("must lock tokens for less than/equal to  4 year");
    });

    it("should error on insufficient balance", async function () {
      await expect(
        this.contract.stake(parseEther("1000"), 604800)
      ).to.be.revertedWith("insufficient balance");
    });

    it("should lock funds successfully", async function () {
      const amount = parseEther("1");
      const currentBalance = await this.mockPop.balanceOf(owner.address);
      await this.mockPop.connect(owner).approve(this.contract.address, amount);
      result = await expect(this.contract.connect(owner).stake(amount, 604800));
      expect(await this.mockPop.balanceOf(this.contract.address)).to.equal(
        amount.add(stakingFund)
      );
      expect(await this.mockPop.balanceOf(owner.address)).to.equal(
        currentBalance.sub(amount)
      );
      result.to
        .emit(this.contract, "StakingDeposited")
        .withArgs(owner.address, amount);
      expect(await this.contract.getVoiceCredits(owner.address)).to.equal(
        String((amount * 604800) / (604800 * 52 * 4))
      );
    });
  });

  describe("withdraw", function () {
    it("should reject zero amount", async function () {
      await expect(this.contract.withdraw(0)).to.be.revertedWith(
        "amount must be greater than 0"
      );
    });

    it("should reject insufficient balance", async function () {
      await expect(
        this.contract.withdraw(parseEther("1000"))
      ).to.be.revertedWith("insufficient balance");
    });

    it("should release funds successfully", async function () {
      const amount = parseEther("1");
      await this.mockPop.connect(owner).approve(this.contract.address, amount);
      await this.contract.connect(owner).stake(amount, 604800);
      ethers.provider.send("evm_increaseTime", [700000]);
      ethers.provider.send("evm_mine");
      expect(await this.contract.connect(owner).withdraw(amount))
        .to.emit(this.contract, "StakingWithdrawn")
        .withArgs(owner.address, amount);
      expect(
        await this.contract.connect(owner).getWithdrawableBalance()
      ).to.equal(0);
      expect(await this.contract.getVoiceCredits(owner.address)).to.equal(0);
    });

    it("should release funds and rewards successfully when exiting", async function () {
      const amount = parseEther("2");
      await this.mockPop.connect(owner).approve(this.contract.address, amount);
      await this.contract.connect(owner).stake(amount, 604800);
      ethers.provider.send("evm_increaseTime", [700000]);
      ethers.provider.send("evm_mine");
      const amountEarned = await this.contract.earned(owner.address);
      expect(await this.contract.connect(owner).exit(amount))
        .to.emit(this.contract, "StakingWithdrawn")
        .withArgs(owner.address, amount)
        .to.emit(this.contract, "RewardPaid")
        .withArgs(owner.address, amountEarned);
      expect(
        await this.contract.connect(owner).getWithdrawableBalance()
      ).to.equal(0);
      expect(await this.contract.getVoiceCredits(owner.address)).to.equal(0);
      expect(await this.contract.earned(owner.address)).to.equal(0);
    });
  });

  describe("rewards", function () {
    it("should pay out rewards successfully", async function () {
      const amount = parseEther("1");
      await this.mockPop.connect(owner).approve(this.contract.address, amount);
      await this.contract.connect(owner).stake(amount, 604800);
      ethers.provider.send("evm_increaseTime", [700000]);
      ethers.provider.send("evm_mine");
      const amountEarned = await this.contract.earned(owner.address);
      expect(await this.contract.connect(owner).getReward())
        .to.emit(this.contract, "RewardPaid")
        .withArgs(owner.address, amountEarned);
      expect(
        await this.contract.connect(owner).getWithdrawableBalance()
      ).to.equal(parseEther("1"));
      expect(await this.contract.earned(owner.address)).to.equal(0);
    });

    it("lowers the reward rate when more user stake", async function () {
      const amount = parseEther("1");
      await this.mockPop.connect(owner).approve(this.contract.address, amount);
      result = await this.contract.connect(owner).stake(amount, 604800);
      await this.mockPop
        .connect(nonOwner)
        .approve(this.contract.address, amount);
      result = await this.contract.connect(nonOwner).stake(amount, 604800);
      ethers.provider.send("evm_increaseTime", [604800]);
      ethers.provider.send("evm_mine");
      expect(await this.contract.earned(owner.address)).to.equal(
        "4999999999999838400"
      );
      //Dont know how to test this. RewardPerToken2 is higher than 1 even though they both earn less than if only one person was staking
    });
  });

  describe("timelock", function () {
    it("should increase locktime when staking more funds", async function () {
      await this.mockPop
        .connect(owner)
        .approve(this.contract.address, parseEther("2"));
      // owner stakes 1 ether for a week
      await this.contract.connect(owner).stake(parseEther("1"), 604800);
      ethers.provider.send("evm_increaseTime", [500000]);
      ethers.provider.send("evm_mine", []);
      await this.contract.connect(owner).stake(parseEther("1"), 604800);
      // still balance 0 for owner
      expect(
        await this.contract.connect(owner).getWithdrawableBalance()
      ).to.equal(0);
    });
    it("should lock all funds again when staking new funds without withdrawing old funds", async function () {
      await this.mockPop
        .connect(owner)
        .approve(this.contract.address, parseEther("2"));
      // owner stakes 1 ether for a week
      await this.contract.connect(owner).stake(parseEther("1"), 604800);
      ethers.provider.send("evm_increaseTime", [700000]);
      ethers.provider.send("evm_mine", []);
      expect(
        await this.contract.connect(owner).getWithdrawableBalance()
      ).to.equal(parseEther("1"));
      await this.contract.connect(owner).stake(parseEther("1"), 604800);
      // still balance 0 for owner
      expect(
        await this.contract.connect(owner).getWithdrawableBalance()
      ).to.equal(0);
    });
  });

  describe("getWithdrawableBalance", function () {
    it("should return total balance", async function () {
      // balance 0 for owner
      expect(
        await this.contract.connect(owner).getWithdrawableBalance()
      ).to.equal(0);

      await this.mockPop
        .connect(owner)
        .approve(this.contract.address, parseEther("3"));
      // owner stakes 1 ether for a week
      await this.contract.connect(owner).stake(parseEther("1"), 604800);

      // ~1 week passes
      ethers.provider.send("evm_increaseTime", [600000]);
      ethers.provider.send("evm_mine", []);

      // still balance 0 for owner
      expect(
        await this.contract.connect(owner).getWithdrawableBalance()
      ).to.equal(0);

      // owner stakes 2 ether for 4 weeks
      await this.contract.connect(owner).stake(parseEther("2"), 604800 * 4);

      // 1 week passes
      ethers.provider.send("evm_increaseTime", [604800]);
      ethers.provider.send("evm_mine", []);

      // still balance 0 for owner
      expect(
        await this.contract.connect(owner).getWithdrawableBalance()
      ).to.equal(0);

      // +3 week passes
      ethers.provider.send("evm_increaseTime", [604800 * 3]);
      ethers.provider.send("evm_mine", []);

      // balance of 3 either available for withdraw
      expect(
        await this.contract.connect(owner).getWithdrawableBalance()
      ).to.equal(parseEther("3"));

      // withdraws a partial balance of 0.7 ether
      await this.contract.connect(owner).withdraw(parseEther("0.7"));
      // balance of 2.3 either available for withdraw
      expect(
        await this.contract.connect(owner).getWithdrawableBalance()
      ).to.equal(parseEther("2.3"));

      // withdraws a partial balance of 2 ether
      await this.contract.connect(owner).withdraw(parseEther("2"));
      // balance of 0.3 either available for withdraw
      expect(
        await this.contract.connect(owner).getWithdrawableBalance()
      ).to.equal(parseEther("0.3"));

      // withdraws remaining balance of 0.3 ether
      await this.contract.connect(owner).withdraw(parseEther("0.3"));
      // balance of 0 either available for withdraw
      expect(
        await this.contract.connect(owner).getWithdrawableBalance()
      ).to.equal(0);
    });
  });

  describe("getVoiceCredits", function () {
    beforeEach(async function () {
      const Staking = await ethers.getContractFactory("Staking");
      this.contract = await Staking.deploy(this.mockPop.address);
      await this.contract.deployed();
      await this.mockPop
        .connect(owner)
        .approve(this.contract.address, parseEther("10"));
    });
    it("should return decayed voice credits", async function () {
      await this.contract.connect(owner).stake(parseEther("1"), 604800);
      const decayPerDay = BigNumber.from("684931506768000");
      const voiceCredits0 = await this.contract.getVoiceCredits(owner.address);
      //1 days passes
      ethers.provider.send("evm_increaseTime", [86400]);
      ethers.provider.send("evm_mine", []);
      const voiceCredits1 = await this.contract.getVoiceCredits(owner.address);
      expect(voiceCredits0.sub(decayPerDay)).to.equal(voiceCredits1);
      //1 days passes
      ethers.provider.send("evm_increaseTime", [86400]);
      ethers.provider.send("evm_mine", []);
      const voiceCredits2 = await this.contract.getVoiceCredits(owner.address);
      expect(voiceCredits1.sub(decayPerDay)).to.equal(voiceCredits2);
      //1 days passes
      ethers.provider.send("evm_increaseTime", [86400]);
      ethers.provider.send("evm_mine", []);
      const voiceCredits3 = await this.contract.getVoiceCredits(owner.address);
      expect(voiceCredits2.sub(decayPerDay)).to.equal(voiceCredits3);
      //1 days passes
      ethers.provider.send("evm_increaseTime", [86400]);
      ethers.provider.send("evm_mine", []);
      const voiceCredits4 = await this.contract.getVoiceCredits(owner.address);
      expect(voiceCredits3.sub(decayPerDay)).to.equal(voiceCredits4);
      //1 days passes
      ethers.provider.send("evm_increaseTime", [86400]);
      ethers.provider.send("evm_mine", []);
      const voiceCredits5 = await this.contract.getVoiceCredits(owner.address);
      expect(voiceCredits4.sub(decayPerDay)).to.equal(voiceCredits5);
      //1 days passes
      ethers.provider.send("evm_increaseTime", [86400]);
      ethers.provider.send("evm_mine", []);
      const voiceCredits6 = await this.contract.getVoiceCredits(owner.address);
      expect(voiceCredits5.sub(decayPerDay)).to.equal(voiceCredits6);
      //1 week passed
      ethers.provider.send("evm_increaseTime", [86400]);
      ethers.provider.send("evm_mine", []);
      const voiceCredits7 = await this.contract.getVoiceCredits(owner.address);
      expect(voiceCredits7).to.equal(0);
    });
    it.only("decays voice credits linearly on large time scales aswell", async function () {
      await this.contract.connect(owner).stake(parseEther("10"), 604800 * 78);
      const decayPerWeek = BigNumber.from("47945205479203200");
      const voiceCredits0 = await this.contract.getVoiceCredits(owner.address);
      ethers.provider.send("evm_increaseTime", [604800]);
      ethers.provider.send("evm_mine", []);
      const voiceCredits1 = await this.contract.getVoiceCredits(owner.address);
      //half way through
      ethers.provider.send("evm_increaseTime", [604800 * 38]);
      ethers.provider.send("evm_mine", []);
      const voiceCredits2 = await this.contract.getVoiceCredits(owner.address);
      expect(voiceCredits0.sub(decayPerWeek.mul("39"))).to.equal(voiceCredits2)
      //lockup period over
      ethers.provider.send("evm_increaseTime", [604800 * 39]);
      ethers.provider.send("evm_mine", []);
      const voiceCredits3 = await this.contract.getVoiceCredits(owner.address);
      expect(voiceCredits3).to.equal(0)
    });
    it("should return voice credits again after staking new pop", async function () {
      await this.contract.connect(owner).stake(parseEther("1"), 604800);
      const voiceCredits1 = await this.contract.getVoiceCredits(owner.address);
      //3 days pass
      ethers.provider.send("evm_increaseTime", [604800]);
      ethers.provider.send("evm_mine", []);
      const voiceCredits2 = await this.contract.getVoiceCredits(owner.address);
      expect(voiceCredits2).to.equal(0);
      await this.contract.connect(owner).stake(parseEther("9"), 604800);
      const voiceCredits3 = await this.contract.getVoiceCredits(owner.address);
      expect(voiceCredits3.toString()).to.equal("47945205479203200");
    });
    it("should return 0 voice credits after lockperiod ended", async function () {
      await this.contract.connect(owner).stake(parseEther("1"), 604800);
      ethers.provider.send("evm_increaseTime", [604800]);
      ethers.provider.send("evm_mine", []);
      const voiceCredits = await this.contract.getVoiceCredits(owner.address);
      expect(voiceCredits.toString()).to.equal("0");
    });
  });

  describe("notifyRewardAmount", function () {
    beforeEach(async function () {
      const Staking = await ethers.getContractFactory("Staking");
      this.contract = await Staking.deploy(this.mockPop.address);
      await this.contract.deployed();
      stakingFund = parseEther("10");
      await this.mockPop.transfer(this.contract.address, stakingFund);
    });
    it("should set rewards", async function () {
      expect(
        await this.contract.connect(owner).getRewardForDuration()
      ).to.equal(0);
      await this.contract.notifyRewardAmount(stakingFund);
      expect(
        await this.contract.connect(owner).getRewardForDuration()
      ).to.equal("9999999999999676800");
    });
    it("should be able to increase rewards", async function () {
      await this.contract.notifyRewardAmount(parseEther("5"));
      expect(
        await this.contract.connect(owner).getRewardForDuration()
      ).to.equal("4999999999999536000");
      await this.contract.notifyRewardAmount(parseEther("5"));
      expect(
        await this.contract.connect(owner).getRewardForDuration()
      ).to.equal("9999991732803408000");
    });
    it("should not allow more rewards than is available in contract balance", async function () {
      await expect(
        this.contract.notifyRewardAmount(parseEther("11"))
      ).to.be.revertedWith("Provided reward too high");
    });
  });

  describe("updatePeriodFinish", function () {
    beforeEach(async function () {
      const Staking = await ethers.getContractFactory("Staking");
      this.contract = await Staking.deploy(this.mockPop.address);
      await this.contract.deployed();
      stakingFund = parseEther("10");
      await this.mockPop.transfer(this.contract.address, stakingFund);
      await this.contract.notifyRewardAmount(stakingFund);
    });
    it("should increase staking period", async function () {
      const periodFinish = await this.contract.periodFinish();
      this.contract.connect(owner).updatePeriodFinish(periodFinish + 604800);
      await expect(await this.contract.periodFinish()).to.equal(
        periodFinish + 604800
      );
    });
    it("should decrease staking period", async function () {
      const periodFinish = await this.contract.periodFinish();
      await this.contract
        .connect(owner)
        .updatePeriodFinish(periodFinish - 300000);
      await expect(await this.contract.periodFinish()).to.equal(
        periodFinish - 300000
      );
    });
    it("should not be able to set finish time before now", async function () {
      const currentBlockNumber = await ethers.provider.getBlockNumber();
      const currentBlock = await ethers.provider._getBlock(currentBlockNumber);
      await expect(
        this.contract.updatePeriodFinish(currentBlock.timestamp)
      ).to.revertedWith("timestamp cant be in the past");
    });
  });
});
