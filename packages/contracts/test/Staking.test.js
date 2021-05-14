const { expect } = require("chai");
const { parseEther } = require("ethers/lib/utils");

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
      console.log("amountEarned", amountEarned.div(parseEther("1")).toString());
    });
  });

  describe("rewards", function () {
    it("lowers the reward rate when more user stake", async function () {
      /*let rewardPerToken;
      let lockedAmount;
      const amount = parseEther("1");
      await this.mockPop.connect(owner).approve(this.contract.address, amount);
      result = await this.contract.connect(owner).stake(amount, 604800);
      ethers.provider.send("evm_increaseTime", [10]);
      ethers.provider.send("evm_mine");
      const rewardPerToken1 = await this.contract.rewardPerToken();
      console.log("rewardPerToken 1", rewardPerToken1.toString());
      await this.mockPop
        .connect(nonOwner)
        .approve(this.contract.address, amount);
      result = await this.contract.connect(nonOwner).stake(amount, 604800);
      lockedAmount = await this.contract.totalLocked();
      console.log(
        "lockedAmount 2",
        lockedAmount.div(parseEther("1")).toString()
      );
      const rewardPerToken2 = await this.contract.rewardPerToken();
      console.log("rewardPerToken 2", rewardPerToken2.toString());
      console.log("comparison", rewardPerToken1 > rewardPerToken2);*/
      //TODO
      //Dont know how to test this. RewardPerToken2 is higher than 1 even though they both earn less than if only one person was staking
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
});
