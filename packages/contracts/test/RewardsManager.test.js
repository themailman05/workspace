const { expect } = require("chai");
const { waffle } = require("hardhat");
const { parseEther } = require("ethers/lib/utils");
const { merklize, makeElement, generateClaims } = require("../scripts/merkle.js");
const provider = waffle.provider;

describe('RewardsManager', function () {
  const VaultStatus = { "Initialized": 0, "Open": 1, "Closed": 2 };
  const RewardSplits = { "DAO": parseEther("33"), "Treasury": parseEther("33"), "Beneficiaries": parseEther("34") };
  const OwnerInitial = parseEther("10");
  const RewarderInitial = parseEther("5");
  let owner, rewarder, beneficiary1, beneficiary2;
  let claims, merkleTree, merkleRoot;

  beforeEach(async function () {
    [owner, rewarder, beneficiary1, beneficiary2] = await ethers.getSigners();

    let MockERC20 = await ethers.getContractFactory("MockERC20");
    this.mockPop = await MockERC20.deploy("TestPOP", "TPOP");
    await this.mockPop.mint(owner.address, OwnerInitial);
    await this.mockPop.mint(rewarder.address, RewarderInitial);

    let Treasury = await ethers.getContractFactory("MockTreasury");
    this.mockTreasury = await waffle.deployMockContract(owner, Treasury.interface.format());

    let DAO = await ethers.getContractFactory("MockDAO");
    this.mockDao = await waffle.deployMockContract(owner, DAO.interface.format());

    let BeneficiaryRegistry = await ethers.getContractFactory("BeneficiaryRegistry");
    this.mockBeneficiaryRegistry = await waffle.deployMockContract(owner, BeneficiaryRegistry.interface.format());
    await this.mockBeneficiaryRegistry.mock.beneficiaryExists.returns(true); //assume true

    let RewardsManager = await ethers.getContractFactory("RewardsManager");
    this.rewardsManager = await RewardsManager.deploy(
      this.mockPop.address,
      this.mockDao.address,
      this.mockTreasury.address,
      this.mockBeneficiaryRegistry.address
    );
    await this.rewardsManager.deployed();

    claims = generateClaims(await provider.listAccounts());
    merkleTree = merklize(claims);
    merkleRoot = "0x" + merkleTree.getRoot().toString("hex");
  });

  it("should be constructed with correct addresses", async function () {
    expect(await this.rewardsManager.pop()).to.equal(this.mockPop.address);
    expect(await this.rewardsManager.dao()).to.equal(this.mockDao.address);
    expect(await this.rewardsManager.treasury()).to.equal(this.mockTreasury.address);
    expect(await this.rewardsManager.beneficiaryRegistry()).to.equal(this.mockBeneficiaryRegistry.address);
  });

  it("should be initialized with correct splits", async function () {
    expect(await this.rewardsManager.rewardSplits(0)).to.equal(parseEther("33"));
    expect(await this.rewardsManager.rewardSplits(1)).to.equal(parseEther("33"));
    expect(await this.rewardsManager.rewardSplits(2)).to.equal(parseEther("34"));
  });

  it("reverts deposit with no transfer approval", async function () {
    await expect(
      this.rewardsManager.depositReward(owner.address, 100)
    ).to.be.revertedWith("ERC20: transfer amount exceeds allowance");
  });

  it("reverts when trying to get uninitialized vault", async function () {
    await expect(this.rewardsManager.getVault(0)).to.be.revertedWith("Uninitialized vault slot");
  });

  it("reverts when trying to get invalid vault", async function () {
    await expect(this.rewardsManager.getVault(4)).to.be.revertedWith("Invalid vault id");
  });

  it("reverts when trying to initialize an invalid vault id", async function () {
    const currentBlock = (await provider.getBlock("latest")).number;
    await expect(
      this.rewardsManager.initializeVault(4, currentBlock + 1, merkleRoot)
    ).to.be.revertedWith("Invalid vault id");
  });

  it("reverts when trying to initialize an invalid end block", async function () {
    const currentBlock = (await provider.getBlock("latest")).number;
    await expect(
      this.rewardsManager.initializeVault(0, currentBlock, merkleRoot)
    ).to.be.revertedWith("Invalid end block");
  });

  it("reverts when setting reward splits as non-owner", async function () {
    await expect(
      this.rewardsManager.connect(beneficiary1).setRewardSplits([20,20,60])
    ).to.be.revertedWith("Ownable: caller is not the owner");
  });

  it("reverts when setting invalid reward splits", async function () {
    await expect(
      this.rewardsManager.setRewardSplits([20, 20, 60])
    ).to.be.revertedWith("Invalid split");
  });

  it("reverts when setting invalid total reward splits", async function () {
    await expect(
      this.rewardsManager.setRewardSplits([parseEther("20.000000001"), parseEther("20"), parseEther("60")])
    ).to.be.revertedWith("Invalid split total");
  });

  it("reverts when setting out of bounds reward splits", async function () {
    await expect(
      this.rewardsManager.setRewardSplits([parseEther("10"), parseEther("10"), parseEther("80")])
    ).to.be.revertedWith("Invalid split");
  });

  it("cannot tranfer ownership as non-owner", async function () {
    await expect(
      this.rewardsManager.connect(beneficiary1).transferOwnership(beneficiary1.address)
    ).to.be.revertedWith("Ownable: caller is not the owner");
  });

  it("reward redirected to owner with no open vaults", async function () {
    let rewardAmount = parseEther("0.01");
    await this.mockPop.connect(rewarder).approve(this.rewardsManager.address, rewardAmount);
    await this.rewardsManager.depositReward(rewarder.address, rewardAmount);
    expect(await this.mockPop.balanceOf(this.rewardsManager.address)).to.equal(0);
    expect(await this.mockPop.balanceOf(owner.address)).to.equal(
      OwnerInitial.add(rewardAmount.mul(RewardSplits.Beneficiaries).div(parseEther("100")))
    );
  });

  describe("reward splits are set", function () {
    beforeEach(async function() {
      await this.rewardsManager.setRewardSplits([parseEther("20"), parseEther("20"), parseEther("60")]);
    });

    it("should have updated correct splits", async function () {
      expect(await this.rewardsManager.rewardSplits(0)).to.equal(parseEther("20"));
      expect(await this.rewardsManager.rewardSplits(1)).to.equal(parseEther("20"));
      expect(await this.rewardsManager.rewardSplits(2)).to.equal(parseEther("60"));
    });
  });

  describe("vault 0 is initialized", function () {
    beforeEach(async function () {
      currentTime = (await provider.getBlock("latest")).timestamp;
      endTime = currentTime + 10000;
      result = await this.rewardsManager.initializeVault(0, endTime, merkleRoot);
    });

    it("reverts when closing initialized vault", async function () {
      await expect(this.rewardsManager.closeVault(0)).to.be.revertedWith("Vault must be open");
    });

    it("emits a VaultInitialized event", async function () {
      expect(result).to.emit(this.rewardsManager, "VaultInitialized").withArgs(0, merkleRoot);
    });

    it("vault has expected values", async function () {
      let vaultData = await this.rewardsManager.getVault(0);
      expect(vaultData.totalDeposited).to.equal(0);
      expect(vaultData.currentBalance).to.equal(0);
      expect(vaultData.unclaimedShare).to.equal(parseEther("100"));
      expect(vaultData.merkleRoot).to.equal(merkleRoot);
      expect(vaultData.endTime).to.equal(endTime);
      expect(vaultData.status).to.equal(VaultStatus.Initialized);
      expect(await this.rewardsManager.hasClaimed(0, beneficiary1.address)).to.be.false;
      expect(await this.rewardsManager.hasClaimed(0, beneficiary2.address)).to.be.false;
    });

    it("opens vault", async function () {
      await this.rewardsManager.openVault(0);
      let vaultData = await this.rewardsManager.getVault(0);
      expect(vaultData.status).to.equal(VaultStatus.Open);
    });

    describe("open vault and deposit reward", function () {
      beforeEach(async function () {
        totalReward = parseEther("0.1");
        daoReward = totalReward.mul(RewardSplits.DAO).div(parseEther("100"));
        treasuryReward = totalReward.mul(RewardSplits.Treasury).div(parseEther("100"));
        beneficiariesReward = totalReward.mul(RewardSplits.Beneficiaries).div(parseEther("100"));
        result1 = await this.rewardsManager.openVault(0);
        await this.mockPop.connect(rewarder).approve(this.rewardsManager.address, totalReward);
        result2 = await this.rewardsManager.depositReward(rewarder.address, totalReward);
      });

      it("emits a VaultOpened & RewardDeposited event", async function () {
        expect(result1).to.emit(this.rewardsManager, "VaultOpened").withArgs(0);
        expect(result2).to.emit(this.rewardsManager, "RewardDeposited").withArgs(rewarder.address, totalReward);
      });

      it("contract has expected balance", async function () {
        expect(await this.mockPop.balanceOf(this.rewardsManager.address)).to.equal(beneficiariesReward);
      });

      it("DAO has expected balance", async function () {
        expect(await this.mockPop.balanceOf(this.mockDao.address)).to.equal(daoReward);
      });

      it("Treasury has expected balance", async function () {
        expect(await this.mockPop.balanceOf(this.mockTreasury.address)).to.equal(treasuryReward);
      });

      it("DAO has expected balance", async function () {
        expect(await this.mockPop.balanceOf(this.mockDao.address)).to.equal(daoReward);
      });

      it("vault has expected balance", async function () {
        let vaultData = await this.rewardsManager.getVault(0);
        expect(vaultData.totalDeposited).to.equal(beneficiariesReward);
        expect(vaultData.currentBalance).to.equal(beneficiariesReward);
      });

      it("reverts invalid claim", async function () {
        let proof = [makeElement(owner.address, "10")];
        await expect(
          this.rewardsManager.claimReward(0, proof, owner.address, "10")
        ).to.be.revertedWith("Invalid claim");
      });

      it("reverts claim when beneficiary does not exist", async function () {
        let proof = merkleTree.getProof(makeElement(beneficiary1.address, claims[beneficiary1.address]));
        await this.mockBeneficiaryRegistry.mock.beneficiaryExists.returns(false);
        await expect(this.rewardsManager.connect(beneficiary1).claimReward(
          0,
          proof,
          beneficiary1.address,
          claims[beneficiary1.address]
        )).to.be.revertedWith("Beneficiary does not exist");
      });

      it("verifies valid claim", async function () {
        let proof = merkleTree.getProof(makeElement(beneficiary1.address, claims[beneficiary1.address]));
        expect(await this.rewardsManager.connect(beneficiary1).verifyClaim(
          0,
          proof,
          beneficiary1.address,
          claims[beneficiary1.address]
        )).to.be.true;
      });

      it("reverts claim from wrong sender", async function () {
        let proof = merkleTree.getProof(makeElement(beneficiary1.address, claims[beneficiary1.address]));
        await expect(this.rewardsManager.connect(beneficiary2).claimReward(
          0,
          proof,
          beneficiary1.address,
          claims[beneficiary1.address]
        )).to.be.revertedWith("Sender must be beneficiary");
      });

      it("reverts when closing before end block", async function () {
        await expect(this.rewardsManager.closeVault(0)).to.be.revertedWith("Vault has not ended");
      });

      it("reverts when reinitializing open vault", async function () {
        await expect(
          this.rewardsManager.initializeVault(0, endTime, merkleRoot)
        ).to.be.revertedWith("Vault must not be open");
      });

      it("reverts close vault before end time", async function () {
        await expect(this.rewardsManager.closeVault(0)).to.be.revertedWith("Vault has not ended");
      });

      describe("allows claim from beneficiary 1", function () {
        beforeEach(async function () {
          beneficiary1Claim = beneficiariesReward.mul(claims[beneficiary1.address]).div(parseEther("100"));
          let proof = merkleTree.getProof(makeElement(beneficiary1.address, claims[beneficiary1.address]));
          result = await this.rewardsManager.connect(beneficiary1).claimReward(
            0,
            proof,
            beneficiary1.address,
            claims[beneficiary1.address]
          );
        });

        it("emits a RewardClaimed event", async function () {
          expect(result).to.emit(this.rewardsManager, "RewardClaimed").withArgs(
            0,
            beneficiary1.address,
            beneficiary1Claim
          );
        });

        it("vault has expected data", async function () {
          let currentBalance = beneficiariesReward.sub(beneficiary1Claim);
          let unclaimedShare = parseEther("100").sub(claims[beneficiary1.address]);
          let vaultData = await this.rewardsManager.getVault(0);
          expect(vaultData.currentBalance).to.equal(currentBalance);
          expect(vaultData.unclaimedShare).to.equal(unclaimedShare);
          expect(await this.rewardsManager.hasClaimed(0, beneficiary1.address)).to.be.true;
        });

        it("contract has expected balance", async function () {
          expect(
            await this.mockPop.balanceOf(this.rewardsManager.address)
          ).to.equal(beneficiariesReward.sub(beneficiary1Claim));
        });

        it("reverts a second claim", async function () {
          let proof = merkleTree.getProof(makeElement(beneficiary1.address, claims[beneficiary1.address]));
          await expect(this.rewardsManager.connect(beneficiary1).claimReward(
            0,
            proof,
            beneficiary1.address,
            claims[beneficiary1.address]
          )).to.be.revertedWith("Already claimed");
        });

        describe("allows claim from beneficiary 2", function () {
          beforeEach(async function () {
            beneficiary2Claim = beneficiariesReward.mul(claims[beneficiary2.address]).div(parseEther("100"));
            let proof = merkleTree.getProof(makeElement(beneficiary2.address, claims[beneficiary2.address]));
            await this.rewardsManager.connect(beneficiary2).claimReward(
              0,
              proof,
              beneficiary2.address,
              claims[beneficiary2.address]
            );
          });

          it("vault has expected data", async function () {
            let currentBalance = beneficiariesReward.sub(beneficiary1Claim).sub(beneficiary2Claim);
            let unclaimedShare = parseEther("100").sub(claims[beneficiary1.address]).sub(claims[beneficiary1.address]);
            let vaultData = await this.rewardsManager.getVault(0);
            expect(vaultData.currentBalance).to.equal(currentBalance);
            expect(vaultData.unclaimedShare).to.equal(unclaimedShare);
            expect(await this.rewardsManager.hasClaimed(0, beneficiary2.address)).to.be.true;
          });

          it("has expected contract balance", async function () {
            let currentBalance = beneficiariesReward.sub(beneficiary1Claim).sub(beneficiary2Claim);
            expect(await this.mockPop.balanceOf(this.rewardsManager.address)).to.equal(currentBalance);
          });
        });

        describe("closes vault 0 after end time", function () {
          beforeEach(async function () {
            ethers.provider.send("evm_increaseTime", [endTime - Math.floor(Date.now() / 1000)]);
            ethers.provider.send("evm_mine");
          });

          it("redirect unclaimed rewards to owner when no other vaults open", async function () {
            await this.rewardsManager.closeVault(0);
            expect(await this.mockPop.balanceOf(this.rewardsManager.address)).to.equal(0);
          });

          //@todo open vault 1 for remaining rewards and close 0
        });
      });
    });

    describe("vault 0 is reinitialized", function () {
      beforeEach(async function () {
        result = await this.rewardsManager.initializeVault(0, endTime, merkleRoot);
      });

      it("reverts when closing initialized vault", async function () {
        await expect(this.rewardsManager.closeVault(0)).to.be.revertedWith("Vault must be open");
      });

      it("emits a VaultInitialized event", async function () {
        expect(result).to.emit(this.rewardsManager, "VaultInitialized").withArgs(0, merkleRoot);
      });

      it("vault has expected values", async function () {
        let vaultData = await this.rewardsManager.getVault(0);
        expect(vaultData.totalDeposited).to.equal(0);
        expect(vaultData.currentBalance).to.equal(0);
        expect(vaultData.unclaimedShare).to.equal(parseEther("100"));
        expect(vaultData.merkleRoot).to.equal(merkleRoot);
        expect(vaultData.endTime).to.equal(endTime);
        expect(vaultData.status).to.equal(VaultStatus.Initialized);
        expect(await this.rewardsManager.hasClaimed(0, beneficiary1.address)).to.be.false;
        expect(await this.rewardsManager.hasClaimed(0, beneficiary2.address)).to.be.false;
      });
    });
  });
});
