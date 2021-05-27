import { expect } from "chai";
import { waffle, ethers } from "hardhat";
import { parseEther } from "ethers/lib/utils";
import { MockERC20, Staking } from "../typechain";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { BigNumber } from "@ethersproject/bignumber";


let stakingFund:BigNumber;

let owner: SignerWithAddress,
  rewarder: SignerWithAddress,
  nonOwner: SignerWithAddress;

let mockERC20Factory
let mockPop:MockERC20
let staking:Staking

describe("Staking", function () {
  beforeEach(async function () {
    [owner, rewarder, nonOwner] = await ethers.getSigners();
    mockERC20Factory = await ethers.getContractFactory("MockERC20");
    mockPop = await mockERC20Factory.deploy("TestPOP", "TPOP") as MockERC20;
    await mockPop.mint(owner.address, parseEther("500"));
    await mockPop.mint(nonOwner.address, parseEther("10"));

    const stakingFactory = await ethers.getContractFactory("Staking");
    staking = await stakingFactory.deploy(mockPop.address) as Staking;
    await staking.deployed();
    await staking.setRewardsManager(rewarder.address);
    stakingFund = parseEther("10");
    await mockPop.transfer(staking.address, stakingFund);
    await staking.notifyRewardAmount(stakingFund);
  });

  describe("stake", function () {
    it("should reject zero amount", async function () {
      await expect(staking.stake(0, 604800)).to.be.revertedWith(
        "amount must be greater than 0"
      );
    });

    it("should lock for at least a week", async function () {
      await expect(staking.stake(1, 604799)).to.be.revertedWith(
        "must lock tokens for at least 1 week"
      );
    });

    it("should lock at most 4 years", async function () {
      await expect(
        staking.stake(1, 604800 * 52 * 4 + 1)
      ).to.be.revertedWith("must lock tokens for less than/equal to  4 year");
    });

    it("should error on insufficient balance", async function () {
      await expect(
        staking.stake(parseEther("1000"), 604800)
      ).to.be.revertedWith("insufficient balance");
    });

    it("should lock funds successfully", async function () {
      const amount = parseEther("1");
      const currentBalance = await mockPop.balanceOf(owner.address);
      await mockPop.connect(owner).approve(staking.address, amount);
      await expect(staking.connect(owner).stake(amount, 604800))
        .to.emit(staking, "StakingDeposited")
        .withArgs(owner.address, amount);
      expect(await mockPop.balanceOf(staking.address)).to.equal(
        stakingFund.add(amount)
      );
      expect(await mockPop.balanceOf(owner.address)).to.equal(
        currentBalance.sub(amount)
      );
      expect(await staking.getVoiceCredits(owner.address)).to.equal(
        String((Number(amount.toString()) * 604800) / (604800 * 52 * 4))
      );
    });
  });

  describe("withdraw", function () {
    it("should reject zero amount", async function () {
      await expect(staking.withdraw(0)).to.be.revertedWith(
        "amount must be greater than 0"
      );
    });

    it("should reject insufficient balance", async function () {
      await expect(
        staking.withdraw(parseEther("1000"))
      ).to.be.revertedWith("insufficient balance");
    });

    it("should release funds successfully", async function () {
      const amount = parseEther("1");
      await mockPop.connect(owner).approve(staking.address, amount);
      await staking.connect(owner).stake(amount, 604800);
      ethers.provider.send("evm_increaseTime", [700000]);
      ethers.provider.send("evm_mine",[]);
      expect(await staking.connect(owner).withdraw(amount))
        .to.emit(staking, "StakingWithdrawn")
        .withArgs(owner.address, amount);
      expect(
        await staking.connect(owner).getWithdrawableBalance()
      ).to.equal(0);
      expect(await staking.getVoiceCredits(owner.address)).to.equal(0);
    });

    it("should release funds and rewards successfully when exiting", async function () {
      const amount = parseEther("2");
      await mockPop.connect(owner).approve(staking.address, amount);
      await staking.connect(owner).stake(amount, 604800);
      ethers.provider.send("evm_increaseTime", [700000]);
      ethers.provider.send("evm_mine",[]);
      const amountEarned = await staking.earned(owner.address);
      expect(await staking.connect(owner).exit(amount))
        .to.emit(staking, "StakingWithdrawn")
        .withArgs(owner.address, amount)
        .to.emit(staking, "RewardPaid")
        .withArgs(owner.address, amountEarned);
      expect(
        await staking.connect(owner).getWithdrawableBalance()
      ).to.equal(0);
      expect(await staking.getVoiceCredits(owner.address)).to.equal(0);
      expect(await staking.earned(owner.address)).to.equal(0);
    });
  });

  describe("rewards", function () {
    it("should pay out rewards successfully", async function () {
      const amount = parseEther("1");
      await mockPop.connect(owner).approve(staking.address, amount);
      await staking.connect(owner).stake(amount, 604800);
      ethers.provider.send("evm_increaseTime", [700000]);
      ethers.provider.send("evm_mine",[]);
      const amountEarned = await staking.earned(owner.address);
      expect(await staking.connect(owner).getReward())
        .to.emit(staking, "RewardPaid")
        .withArgs(owner.address, amountEarned);
      expect(
        await staking.connect(owner).getWithdrawableBalance()
      ).to.equal(parseEther("1"));
      expect(await staking.earned(owner.address)).to.equal(0);
    });

    it("lowers the reward rate when more user stake", async function () {
      const amount = parseEther("1");
      await mockPop.connect(owner).approve(staking.address, amount);
      let result = await staking.connect(owner).stake(amount, 604800);
      await mockPop
        .connect(nonOwner)
        .approve(staking.address, amount);
      result = await staking.connect(nonOwner).stake(amount, 604800);
      ethers.provider.send("evm_increaseTime", [604800]);
      ethers.provider.send("evm_mine",[]);
      expect(await staking.earned(owner.address)).to.equal(
        parseEther("4.999999999999838400")
      );
      //Dont know how to test this. RewardPerToken2 is higher than 1 even though they both earn less than if only one person was staking
    });
  });

  describe("timelock", function () {
    it("should increase locktime when staking more funds", async function () {
      await mockPop
        .connect(owner)
        .approve(staking.address, parseEther("2"));
      // owner stakes 1 ether for a week
      await staking.connect(owner).stake(parseEther("1"), 604800);
      ethers.provider.send("evm_increaseTime", [500000]);
      ethers.provider.send("evm_mine", []);
      await staking.connect(owner).stake(parseEther("1"), 604800);
      // still balance 0 for owner
      expect(
        await staking.connect(owner).getWithdrawableBalance()
      ).to.equal(0);
    });
    it("should add locktime when staking immediately more funds", async function () {
      await mockPop
        .connect(owner)
        .approve(staking.address, parseEther("2"));
      // owner stakes 1 ether for a week
      await staking.connect(owner).stake(parseEther("1"), 604800 * 52);
      await staking.connect(owner).stake(parseEther("1"), 604800);
      ethers.provider.send("evm_increaseTime", [604800]);
      ethers.provider.send("evm_mine", []);
      // still balance 0 for owner
      expect(
        await staking.connect(owner).getWithdrawableBalance()
      ).to.equal(0);
      ethers.provider.send("evm_increaseTime", [604800 * 52]);
      ethers.provider.send("evm_mine", []);
      // still balance 0 for owner
      expect(
        await staking.connect(owner).getWithdrawableBalance()
      ).to.equal(parseEther("2"));
    });
    it("should lock all funds again when staking new funds without withdrawing old funds", async function () {
      await mockPop
        .connect(owner)
        .approve(staking.address, parseEther("2"));
      // owner stakes 1 ether for a week
      await staking.connect(owner).stake(parseEther("1"), 604800);
      ethers.provider.send("evm_increaseTime", [700000]);
      ethers.provider.send("evm_mine", []);
      expect(
        await staking.connect(owner).getWithdrawableBalance()
      ).to.equal(parseEther("1"));
      await staking.connect(owner).stake(parseEther("1"), 604800);
      // still balance 0 for owner
      expect(
        await staking.connect(owner).getWithdrawableBalance()
      ).to.equal(0);
    });
  });

  describe("getWithdrawableBalance", function () {
    it("should return total balance", async function () {
      // balance 0 for owner
      expect(
        await staking.connect(owner).getWithdrawableBalance()
      ).to.equal(0);

      await mockPop
        .connect(owner)
        .approve(staking.address, parseEther("3"));
      // owner stakes 1 ether for a week
      await staking.connect(owner).stake(parseEther("1"), 604800);

      // ~1 week passes
      ethers.provider.send("evm_increaseTime", [600000]);
      ethers.provider.send("evm_mine", []);

      // still balance 0 for owner
      expect(
        await staking.connect(owner).getWithdrawableBalance()
      ).to.equal(0);

      // owner stakes 2 ether for 4 weeks
      await staking.connect(owner).stake(parseEther("2"), 604800 * 4);

      // 1 week passes
      ethers.provider.send("evm_increaseTime", [604800]);
      ethers.provider.send("evm_mine", []);

      // still balance 0 for owner
      expect(
        await staking.connect(owner).getWithdrawableBalance()
      ).to.equal(0);

      // +4 week passes
      ethers.provider.send("evm_increaseTime", [604800 * 4]);
      ethers.provider.send("evm_mine", []);

      // balance of 3 either available for withdraw
      expect(
        await staking.connect(owner).getWithdrawableBalance()
      ).to.equal(parseEther("3"));

      // withdraws a partial balance of 0.7 ether
      await staking.connect(owner).withdraw(parseEther("0.7"));
      // balance of 2.3 either available for withdraw
      expect(
        await staking.connect(owner).getWithdrawableBalance()
      ).to.equal(parseEther("2.3"));

      // withdraws a partial balance of 2 ether
      await staking.connect(owner).withdraw(parseEther("2"));
      // balance of 0.3 either available for withdraw
      expect(
        await staking.connect(owner).getWithdrawableBalance()
      ).to.equal(parseEther("0.3"));

      // withdraws remaining balance of 0.3 ether
      await staking.connect(owner).withdraw(parseEther("0.3"));
      // balance of 0 either available for withdraw
      expect(
        await staking.connect(owner).getWithdrawableBalance()
      ).to.equal(0);
    });
  });
  describe("notifyRewardAmount", function () {
    beforeEach(async function () {
      const Staking = await ethers.getContractFactory("Staking");
      staking = await Staking.deploy(mockPop.address);
      await staking.setRewardsManager(rewarder.address);
      await staking.deployed();
      stakingFund = parseEther("10");
      await mockPop.transfer(staking.address, stakingFund);
    });
    it("should set rewards", async function () {
      expect(
        await staking.connect(owner).getRewardForDuration()
      ).to.equal(0);
      await staking.notifyRewardAmount(stakingFund);
      expect(
        await staking.connect(owner).getRewardForDuration()
      ).to.equal(parseEther("9.999999999999676800"));
    });

    it("should set as RewardsManager", async function () {
      expect(await staking.getRewardForDuration()).to.equal(0);
      await staking.connect(rewarder).notifyRewardAmount(stakingFund);
      expect(await staking.getRewardForDuration()).to.equal(
        parseEther("9.999999999999676800")
      );
    });

    it("should revert if not owner", async function () {
      await expect(
        staking.connect(nonOwner).notifyRewardAmount(stakingFund)
      ).to.be.revertedWith("Not allowed");
    });

    it("should be able to increase rewards", async function () {
      await staking.notifyRewardAmount(parseEther("5"));
      expect(
        await staking.connect(owner).getRewardForDuration()
      ).to.equal(parseEther("4.999999999999536000"));
      await staking.notifyRewardAmount(parseEther("5"));
      expect(
        await staking.connect(owner).getRewardForDuration()
      ).to.equal(parseEther("9.999991732803408000"));
    });
    it("should not allow more rewards than is available in contract balance", async function () {
      await expect(
        staking.notifyRewardAmount(parseEther("11"))
      ).to.be.revertedWith("Provided reward too high");
    });
  });

  describe("updatePeriodFinish", function () {
    beforeEach(async function () {
      const Staking = await ethers.getContractFactory("Staking");
      staking = await Staking.deploy(mockPop.address);
      await staking.deployed();
      stakingFund = parseEther("10");
      await mockPop.transfer(staking.address, stakingFund);
      await staking.notifyRewardAmount(stakingFund);
    });
    it("should increase staking period", async function () {
      const periodFinish = await staking.periodFinish();
      await staking
        .connect(owner)
        .updatePeriodFinish(periodFinish.add(604800));
      await expect(await staking.periodFinish()).to.equal(
        periodFinish.add(604800)
      );
    });
    it("should decrease staking period", async function () {
      const periodFinish = await staking.periodFinish();
      await staking
        .connect(owner)
        .updatePeriodFinish(periodFinish.sub(300000));
      await expect(await staking.periodFinish()).to.equal(
        periodFinish.sub(300000)
      );
    });
    it("should not be able to set finish time before now", async function () {
      const currentBlockNumber = await ethers.provider.getBlockNumber();
      const currentBlock = await ethers.provider._getBlock(currentBlockNumber);
      await expect(
        staking.updatePeriodFinish(currentBlock.timestamp)
      ).to.revertedWith("timestamp cant be in the past");
    });
  });
});
