import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { parseEther } from "ethers/lib/utils";
import { ethers, waffle } from "hardhat";
import { MockERC20, RewardParticipationHelper } from "../typechain";

interface Contracts {
  mockPop: MockERC20;
  rewardParticipationHelper: RewardParticipationHelper;
}

let owner: SignerWithAddress,
  voter: SignerWithAddress,
  governance: SignerWithAddress;
let contracts: Contracts;
let now: number;
let end: number;
let vaultId: string;
const rewardBudget = parseEther("10");

async function deployContracts(): Promise<Contracts> {
  const mockPop = await (
    await (
      await ethers.getContractFactory("MockERC20")
    ).deploy("TestPOP", "TPOP", 18)
  ).deployed();
  await mockPop.mint(owner.address, parseEther("500"));

  const rewardParticipationHelper = await (
    await (
      await ethers.getContractFactory("RewardParticipationHelper")
    ).deploy(mockPop.address, governance.address)
  ).deployed();

  await mockPop
    .connect(owner)
    .approve(rewardParticipationHelper.address, parseEther("1000000"));

  return {
    mockPop,
    rewardParticipationHelper,
  };
}

describe("RewardParticipation", function () {
  beforeEach(async function () {
    [owner, voter, governance] = await ethers.getSigners();
    contracts = await deployContracts();
    now = await (await ethers.provider.getBlock("latest")).timestamp;
    end = now + 604800;
    vaultId = ethers.utils.solidityKeccak256(["uint8", "uint256"], [1, now]);
  });
  describe("initialize a vault", function () {
    it("vault must not already exist", async function () {
      await contracts.rewardParticipationHelper.initializeVault(vaultId, end);
      await expect(
        contracts.rewardParticipationHelper.initializeVault(vaultId, end)
      ).to.be.revertedWith("Vault must not exist");
    });
    it("endTime must be in the future", async function () {
      await expect(
        contracts.rewardParticipationHelper.initializeVault(vaultId, now)
      ).to.be.revertedWith("end must be in the future");
    });
    it("should initialize a vault successfully", async function () {
      await contracts.rewardParticipationHelper
        .connect(governance)
        .setRewardsBudget(rewardBudget);
      await contracts.mockPop
        .connect(owner)
        .transfer(contracts.rewardParticipationHelper.address, rewardBudget);
      const result = await contracts.rewardParticipationHelper.initializeVault(
        vaultId,
        end
      );
      expect("0x" + result.data.slice(10, 74)).to.equal(vaultId);
      expect(result)
        .to.emit(contracts.rewardParticipationHelper, "VaultInitialized")
        .withArgs(vaultId);

      const vault = await contracts.rewardParticipationHelper.vaults(vaultId);
      expect(vault.status).to.equal(0);
      expect(vault.endTime).to.equal(end);
      expect(vault.tokenBalance).to.equal(rewardBudget);
    });
  });
  describe("open a vault", function () {
    it("vault must exist", async function () {
      await expect(
        contracts.rewardParticipationHelper.openVault(vaultId)
      ).to.be.revertedWith("Uninitialized vault slot");
    });
    it("vault must not be open", async function () {
      await contracts.rewardParticipationHelper.initializeVault(vaultId, end);
      ethers.provider.send("evm_increaseTime", [604800]);
      ethers.provider.send("evm_mine", []);
      await contracts.rewardParticipationHelper.openVault(vaultId);
      await expect(
        contracts.rewardParticipationHelper.openVault(vaultId)
      ).to.be.revertedWith("Vault must be initialized");
    });
    it("vault must be opened after endTime", async function () {
      await contracts.rewardParticipationHelper.initializeVault(vaultId, end);
      ethers.provider.send("evm_increaseTime", [604600]);
      ethers.provider.send("evm_mine", []);
      await expect(
        contracts.rewardParticipationHelper.openVault(vaultId)
      ).to.be.revertedWith("wait till endTime is over");
    });
    it("should open vaults successfully", async function () {
      await contracts.rewardParticipationHelper.initializeVault(vaultId, end);
      ethers.provider.send("evm_increaseTime", [604800]);
      ethers.provider.send("evm_mine", []);
      await expect(contracts.rewardParticipationHelper.openVault(vaultId))
        .to.emit(contracts.rewardParticipationHelper, "VaultOpened")
        .withArgs(vaultId);
    });
  });
  describe("add shares", function () {
    it("vault must exist", async function () {
      await expect(
        contracts.rewardParticipationHelper.addShares(
          vaultId,
          owner.address,
          1000
        )
      ).to.be.revertedWith("Uninitialized vault slot");
    });
    it("vault must not be open", async function () {
      await contracts.rewardParticipationHelper.initializeVault(vaultId, end);
      ethers.provider.send("evm_increaseTime", [604800]);
      ethers.provider.send("evm_mine", []);
      await contracts.rewardParticipationHelper.openVault(vaultId);
      await expect(
        contracts.rewardParticipationHelper.addShares(
          vaultId,
          owner.address,
          1000
        )
      ).to.be.revertedWith("Vault must be initialized");
    });
    it("should add shares successfully", async function () {
      await contracts.rewardParticipationHelper.initializeVault(vaultId, end);
      await expect(
        contracts.rewardParticipationHelper.addShares(
          vaultId,
          owner.address,
          1000
        )
      )
        .to.emit(contracts.rewardParticipationHelper, "SharesAdded")
        .withArgs(vaultId, owner.address, 1000);
    });
  });
  describe("claim rewards", function () {
    it("reverts if there are no rewards to claim", async function () {
      await contracts.rewardParticipationHelper.initializeVault(vaultId, end);
      ethers.provider.send("evm_increaseTime", [604800]);
      ethers.provider.send("evm_mine", []);
      await contracts.rewardParticipationHelper.openVault(vaultId);
      await expect(
        contracts.rewardParticipationHelper.claimRewards()
      ).to.be.revertedWith("No rewards");
    });
    it("claims rewards successfully", async function () {
      await contracts.rewardParticipationHelper
        .connect(governance)
        .setRewardsBudget(parseEther("10"));
        await contracts.rewardParticipationHelper
        .connect(owner)
        .contributeRewardBalance(parseEther("10"));
      await contracts.rewardParticipationHelper.initializeVault(vaultId, end);
      await contracts.rewardParticipationHelper.addShares(
        vaultId,
        owner.address,
        1000
      );
      await contracts.rewardParticipationHelper
        .connect(voter)
        .addShares(vaultId, voter.address, 1000);
      ethers.provider.send("evm_increaseTime", [604800]);
      ethers.provider.send("evm_mine", []);
      await contracts.rewardParticipationHelper.openVault(vaultId);
      const oldBalance = await contracts.mockPop.balanceOf(owner.address);

      await expect(
        contracts.rewardParticipationHelper.connect(owner).claimRewards()
      )
        .to.emit(contracts.rewardParticipationHelper, "RewardsClaimed")
        .withArgs(owner.address, parseEther("5"));

      const newBalance = await contracts.mockPop.balanceOf(owner.address);
      expect(newBalance).to.equal(oldBalance.add(parseEther("5")));
    });
    it("adds rewardedVaults to user address when voting and deletes them after claiming rewards", async function () {
      await contracts.rewardParticipationHelper
        .connect(governance)
        .setRewardsBudget(parseEther("10"));
      await contracts.rewardParticipationHelper
        .connect(owner)
        .contributeRewardBalance(parseEther("30"));
      await contracts.rewardParticipationHelper.initializeVault(vaultId, end);
      await contracts.rewardParticipationHelper.addShares(
        vaultId,
        owner.address,
        1000
      );
      expect(
        await contracts.rewardParticipationHelper.numRewardedVaults(
          owner.address
        )
      ).to.equal(1);

      ethers.provider.send("evm_increaseTime", [604800]);
      ethers.provider.send("evm_mine", []);

      await contracts.rewardParticipationHelper.openVault(vaultId);
      await contracts.rewardParticipationHelper.connect(owner).claimRewards();
      expect(
        await contracts.rewardParticipationHelper.numRewardedVaults(
          owner.address
        )
      ).to.equal(0);

      now = await (await ethers.provider.getBlock("latest")).timestamp;
      end = now + 604800;
      const vaultId2 = ethers.utils.solidityKeccak256(
        ["uint8", "uint256"],
        [1, now]
      );
      await contracts.rewardParticipationHelper.initializeVault(vaultId2, end);
      await contracts.rewardParticipationHelper.addShares(
        vaultId2,
        owner.address,
        1000
      );
      now = await (await ethers.provider.getBlock("latest")).timestamp;
      end = now + 604800;
      const vaultId3 = ethers.utils.solidityKeccak256(
        ["uint8", "uint256"],
        [1, now]
      );
      await contracts.rewardParticipationHelper.initializeVault(vaultId3, end);
      await contracts.rewardParticipationHelper.addShares(
        vaultId3,
        owner.address,
        1000
      );

      expect(
        await contracts.rewardParticipationHelper.numRewardedVaults(
          owner.address
        )
      ).to.equal(2);

      ethers.provider.send("evm_increaseTime", [604800]);
      ethers.provider.send("evm_mine", []);

      await contracts.rewardParticipationHelper.openVault(vaultId2);
      await contracts.rewardParticipationHelper.openVault(vaultId3);
      await expect(
        contracts.rewardParticipationHelper.connect(owner).claimRewards()
      )
        .to.emit(contracts.rewardParticipationHelper, "RewardsClaimed")
        .withArgs(owner.address, parseEther("20"));
      expect(
        await contracts.rewardParticipationHelper.numRewardedVaults(
          owner.address
        )
      ).to.equal(0);
    });
  });
});
