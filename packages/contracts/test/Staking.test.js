const { expect } = require('chai');
const { parseEther } = require("ethers/lib/utils");

let contract;

describe('Staking', function () {

  beforeEach(async function () {
    [owner, rewarder, nonOwner] = await ethers.getSigners();

    MockERC20 = await ethers.getContractFactory("MockERC20");
    this.mockPop = await MockERC20.deploy("TestPOP", "TPOP");
    await this.mockPop.mint(owner.address, parseEther("10"));

    const Staking = await ethers.getContractFactory('Staking');
    this.contract = await Staking.deploy(this.mockPop.address);
    await this.contract.deployed();
  });

  describe("stake", function () {
    it("should reject zero amount", async function () {
        await expect(
        this.contract.stake(0, 604800)
        ).to.be.revertedWith("amount must be greater than 0");
    });

    it("should lock for at least a week", async function () {
        await expect(
        this.contract.stake(1, 604799)
        ).to.be.revertedWith("must lock tokens for at least 1 week");
    });

    it("should lock at most 4 years", async function () {
        await expect(
        this.contract.stake(1, 604800 * 52 * 4 + 1)
        ).to.be.revertedWith("must lock tokens for less than/equal to  4 year");
    });

    it("should lock available balance", async function () {
        await expect(
        this.contract.stake(parseEther("1000"), 604800)
        ).to.be.revertedWith("insufficient balance");
    });

    it("should lock funds successfully", async function () {
        const amount = parseEther("1")
        const currentBalance = await this.mockPop.balanceOf(owner.address);
        await this.mockPop.connect(owner).approve(this.contract.address, amount);
        result = await expect(
            this.contract.connect(owner).stake(amount, 604800)
        )
        expect(await this.mockPop.balanceOf(this.contract.address)).to.equal(amount);
        expect(await this.mockPop.balanceOf(owner.address)).to.equal(currentBalance.sub(amount));
        result.to.emit(this.contract, "StakingDeposited").withArgs(owner.address, amount);
        expect(await this.contract.getVoiceCredits(owner.address)).to.not.equal(0);
    });
  });

  describe("withdraw", function () {
    it("should reject zero amount", async function () {
        await expect(
        this.contract.withdraw(0)
        ).to.be.revertedWith("amount must be greater than 0");
    });

    it("should reject insufficient balance", async function () {
        await expect(
        this.contract.withdraw(parseEther("1000"))
        ).to.be.revertedWith("insufficient balance");
    });

    it("should release funds successfully", async function () {
        const amount = parseEther("1")
        await this.mockPop.connect(owner).approve(this.contract.address, amount);
        await this.contract.connect(owner).stake(amount, 604800);
        ethers.provider.send("evm_increaseTime", [700000]);
        ethers.provider.send("evm_mine");
        const result = expect(
            await this.contract.connect(owner).withdraw(amount)
        )
        result.to.emit(this.contract, "StakingWithdrawn").withArgs(owner.address, amount);
        expect(await this.contract.connect(owner).getWithdrawableBalance()).to.equal(0);
        expect(await this.contract.getVoiceCredits(owner.address)).to.equal(0);
    });
  });

  describe("getWithdrawableBalance", function () {
    it("should not return locked balance", async function () {
        //  balance 0 for owner
        expect(await this.contract.connect(owner).getWithdrawableBalance()).to.equal(0);

        const amount = parseEther("1")
        await this.mockPop.connect(owner).approve(this.contract.address, amount);
        // owner stakes 1 ether for a week
        await this.contract.connect(owner).stake(amount, 604800);

        //  still balance 0 for owner
        expect(await this.contract.connect(owner).getWithdrawableBalance()).to.equal(0);

        // +1 week passes
        ethers.provider.send("evm_increaseTime", [700000]);
        ethers.provider.send("evm_mine", []);

        // balance of 1 either available for withdraw
        expect(await this.contract.connect(owner).getWithdrawableBalance()).to.equal(amount);
    });
  });
});