import { expect } from "chai";
import {  ethers } from "hardhat";
import { parseEther } from "ethers/lib/utils";
import { MockERC20, RewardsEscrow, Staking } from "../typechain";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { BigNumber } from "@ethersproject/bignumber";

interface Contracts {
  mockPop: MockERC20;
  staking: Staking;
  rewardsEscrow: RewardsEscrow;
}

let owner: SignerWithAddress,
  rewarder: SignerWithAddress,
  nonOwner: SignerWithAddress;

let contracts: Contracts;
let popBalance: BigNumber;

async function deployContracts(): Promise<Contracts> {
  const mockPop = (await (
    await (
      await ethers.getContractFactory("MockERC20")
    ).deploy("TestPOP", "TPOP", 18)
  ).deployed()) as MockERC20;
  await mockPop.mint(owner.address, parseEther("500"));
  await mockPop.mint(nonOwner.address, parseEther("10"));

  const rewardsEscrow = (await (
    await (
      await ethers.getContractFactory("RewardsEscrow")
    ).deploy(mockPop.address)
  ).deployed()) as RewardsEscrow;

  const staking = (await (
    await (
      await ethers.getContractFactory("Staking")
    ).deploy(mockPop.address, rewardsEscrow.address)
  ).deployed()) as Staking;

  const stakingFund = parseEther("10");
  await mockPop.transfer(staking.address, stakingFund);
  await mockPop.connect(owner).approve(staking.address, parseEther("100000"));

  await staking.setRewardsManager(rewarder.address);
  await staking.notifyRewardAmount(stakingFund);
  await staking.connect(owner).stake(parseEther("1"), 604800);

  return { mockPop, staking, rewardsEscrow };
}

describe("RewardsEscrow", function () {
  beforeEach(async function () {
    [owner, rewarder, nonOwner] = await ethers.getSigners();
    contracts = await deployContracts();
  });

  describe("restricted functions", function () {
    it("set staking contract after construction", async function () {
      await contracts.rewardsEscrow
        .connect(owner)
        .setStaking(contracts.staking.address);
      expect(await contracts.rewardsEscrow.Staking()).to.equal(
        contracts.staking.address
      );
    });

    it("update staking contract", async function () {
      const newStaking = (await (
        await (
          await ethers.getContractFactory("Staking")
        ).deploy(contracts.mockPop.address, contracts.rewardsEscrow.address)
      ).deployed()) as Staking;
      await contracts.rewardsEscrow
        .connect(owner)
        .setStaking(contracts.staking.address);
      expect(await contracts.rewardsEscrow.Staking()).to.equal(
        contracts.staking.address
      );
      await contracts.rewardsEscrow
        .connect(owner)
        .setStaking(newStaking.address);
      expect(await contracts.rewardsEscrow.Staking()).to.equal(
        newStaking.address
      );
    });

    it("should revert setStaking if not owner", async function () {
      await expect(
        contracts.rewardsEscrow.connect(nonOwner).setStaking(nonOwner.address)
      ).to.be.revertedWith("Only the contract owner may perform this action");
    });

    it("should revert updateEscrowDuration if not owner", async function () {
      await expect(
        contracts.rewardsEscrow
          .connect(nonOwner)
          .updateEscrowDuration(nonOwner.address)
      ).to.be.revertedWith("Only the contract owner may perform this action");
    });

    it("update escrow duration", async function () {
      await contracts.rewardsEscrow.connect(owner).updateEscrowDuration(604800);
      expect(await contracts.rewardsEscrow.escrowDuration()).to.equal(604800);
    });
  });

  describe("lock", function () {
    beforeEach(async function () {
      await contracts.rewardsEscrow
        .connect(owner)
        .setStaking(contracts.staking.address);
      ethers.provider.send("evm_increaseTime", [604800]);
      ethers.provider.send("evm_mine", []);
    });
    it("should transfer lock funds and emit an event ", async function () {
      const rewardsEarned = await contracts.staking.earned(owner.address);
      const lockedAmount = rewardsEarned
        .div(BigNumber.from("3"))
        .mul(BigNumber.from("2"));
      const result = await contracts.staking.connect(owner).getReward();
      expect(result)
        .to.emit(contracts.rewardsEscrow, "Locked")
        .withArgs(owner.address, lockedAmount);
      expect(await contracts.rewardsEscrow.getLocked(owner.address)).to.equal(
        lockedAmount
      );
      expect(
        await contracts.mockPop.balanceOf(contracts.rewardsEscrow.address)
      ).to.equal(lockedAmount);
    });
    it("should not allow anyone but the staking contract to lock funds", async function () {
      await expect(
        contracts.rewardsEscrow
          .connect(owner)
          .lock(owner.address, parseEther("1"))
      ).to.be.revertedWith("you cant call this function");
    });
  });

  describe("claim", function () {
    beforeEach(async function () {
      await contracts.rewardsEscrow
        .connect(owner)
        .setStaking(contracts.staking.address);
      ethers.provider.send("evm_increaseTime", [604800]);
      ethers.provider.send("evm_mine", []);
    });
    it("should claim funds", async function () {
      const rewardsEarned = await contracts.staking.earned(owner.address);
      const payout = rewardsEarned.div(BigNumber.from("3"))
      const lockedAmount = payout.mul(BigNumber.from("2"));
      await contracts.staking.connect(owner).getReward();
      ethers.provider.send("evm_increaseTime", [2592000]);
      ethers.provider.send("evm_mine", []);
      const locked1 = await contracts.rewardsEscrow.getLocked(owner.address);
      const vested1 = await contracts.rewardsEscrow.getVested(owner.address);
      popBalance = await contracts.mockPop.balanceOf(owner.address);
      await contracts.rewardsEscrow.connect(owner).claim();
      expect(await contracts.mockPop.balanceOf(owner.address)).to.equal(
        parseEther("493.444437524494542442")
      );
      ethers.provider.send("evm_increaseTime", [2592000 * 5]);
      ethers.provider.send("evm_mine", []);
      const locked3 = await contracts.rewardsEscrow.getLocked(owner.address);
      const vested3 = await contracts.rewardsEscrow.getVested(owner.address);
      expect(locked3).to.equal(vested3);
      await contracts.rewardsEscrow.connect(owner).claim();
      const locked4 = await contracts.rewardsEscrow.getLocked(owner.address);
      const vested4 = await contracts.rewardsEscrow.getVested(owner.address);
      expect(await contracts.mockPop.balanceOf(owner.address)).to.equal(
        popBalance.add(lockedAmount)
      );
      expect(vested4).to.equal(0);
      expect(locked4).to.equal(0);
    });
  });
});
