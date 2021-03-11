const { expect } = require("chai");
const { waffle } = require("hardhat");
const { parseEther } = require("ethers/lib/utils");
const { merklize, makeElement, generateClaims } = require("../scripts/merkle.js");
const provider = waffle.provider;

describe('RewardsManager', function () {
  const VaultStatus = { "Initialized": 0, "Open": 1, "Closed": 2 };
  let owner, rewarder, beneficiary1, beneficiary2;
  let claims, merkleTree, merkleRoot;

  beforeEach(async function () {
    [owner, rewarder, beneficiary1, beneficiary2] = await ethers.getSigners();

    let MockERC20 = await ethers.getContractFactory("MockERC20");
    this.mockPop = await MockERC20.deploy("TestPOP", "TPOP");
    await this.mockPop.mint(owner.address, "100000000000");
    await this.mockPop.mint(rewarder.address, "500000000000");

    let BeneficiaryRegistry = await ethers.getContractFactory("BeneficiaryRegistry");
    this.mockBeneficiaryRegistry = await waffle.deployMockContract(owner, BeneficiaryRegistry.interface.format());
    await this.mockBeneficiaryRegistry.mock.beneficiaryExists.returns(true); //assume true

    let RewardsManager = await ethers.getContractFactory("RewardsManager");
    this.rewardsProxy = await RewardsManager.deploy(this.mockPop.address, this.mockBeneficiaryRegistry.address);
    await this.rewardsProxy.deployed();

    claims = generateClaims(await provider.listAccounts());
    merkleTree = merklize(claims);
    merkleRoot = "0x" + merkleTree.getRoot().toString("hex");
  });

  it("should be constructed with POP token", async function () {
    expect(await this.rewardsProxy.pop()).to.equal(this.mockPop.address);
  });

  it("reverts deposit with no transfer approval", async function () {
    await expect(
      this.rewardsProxy.depositReward(owner.address, 100)
    ).to.be.revertedWith("ERC20: transfer amount exceeds allowance");
  });

  it("reward redirected to owner with no open vaults", async function () {
    await this.mockPop.connect(rewarder).approve(this.rewardsProxy.address, 100);
    await this.rewardsProxy.depositReward(rewarder.address, 100);
    expect(await this.mockPop.balanceOf(this.rewardsProxy.address)).to.equal(0);
    expect(await this.mockPop.balanceOf(owner.address)).to.equal(100000000100);
  });

  it("reverts when trying to get uninitialized vault", async function () {
    await expect(this.rewardsProxy.getVault(0)).to.be.revertedWith("Uninitialized vault slot");
  });

  it("reverts when trying to get invalid vault", async function () {
    await expect(this.rewardsProxy.getVault(4)).to.be.revertedWith("Invalid vault id");
  });

  it("reverts when trying to initialize an invalid vault id", async function () {
    const currentBlock = (await provider.getBlock("latest")).number;
    await expect(
      this.rewardsProxy.initializeVault(4, currentBlock + 1, merkleRoot)
    ).to.be.revertedWith("Invalid vault id");
  });

  it("reverts when trying to initialize an invalid end block", async function () {
    const currentBlock = (await provider.getBlock("latest")).number;
    await expect(
      this.rewardsProxy.initializeVault(0, currentBlock, merkleRoot)
    ).to.be.revertedWith("Invalid end block");
  });

  it("cannot tranfer ownership as non-owner", async function () {
    await expect(
      this.rewardsProxy.connect(beneficiary1).transferOwnership(beneficiary1.address)
    ).to.be.revertedWith("Ownable: caller is not the owner");
  });

  describe("vault 0 is initialized", function () {
    beforeEach(async function () {
      currentTime = (await provider.getBlock("latest")).timestamp;
      endTime = currentTime + 10000;
      result = await this.rewardsProxy.initializeVault(0, endTime, merkleRoot);
    });

    it("reverts when closing initialized vault", async function () {
      await expect(this.rewardsProxy.closeVault(0)).to.be.revertedWith("Vault must be open");
    });

    it("emits a VaultInitialized event", async function () {
      expect(result).to.emit(this.rewardsProxy, "VaultInitialized").withArgs(0, merkleRoot);
    });

    it("vault has expected values", async function () {
      let vaultData = await this.rewardsProxy.getVault(0);
      expect(vaultData.totalDeposited).to.equal(0);
      expect(vaultData.currentBalance).to.equal(0);
      expect(vaultData.unclaimedShare).to.equal(parseEther("100").toString());
      expect(vaultData.merkleRoot).to.equal(merkleRoot);
      expect(vaultData.endTime).to.equal(endTime);
      expect(vaultData.status).to.equal(VaultStatus.Initialized);
      expect(await this.rewardsProxy.hasClaimed(0, beneficiary1.address)).to.be.false;
      expect(await this.rewardsProxy.hasClaimed(0, beneficiary2.address)).to.be.false;
    });

    it("opens vault", async function () {
      await this.rewardsProxy.openVault(0);
      let vaultData = await this.rewardsProxy.getVault(0);
      expect(vaultData.status).to.equal(VaultStatus.Open);
    });

    describe("open vault and deposit reward", function () {
      beforeEach(async function () {
        totalReward = "10000000";
        result1 = await this.rewardsProxy.openVault(0);
        await this.mockPop.connect(rewarder).approve(this.rewardsProxy.address, totalReward);
        result2 = await this.rewardsProxy.depositReward(rewarder.address, totalReward);
      });

      it("emits a VaultOpened & RewardDeposited event", async function () {
        expect(result1).to.emit(this.rewardsProxy, "VaultOpened").withArgs(0);
        expect(result2).to.emit(this.rewardsProxy, "RewardDeposited").withArgs(rewarder.address, totalReward);
      });

      it("contract has expected balance", async function () {
        expect(await this.mockPop.balanceOf(this.rewardsProxy.address)).to.equal(totalReward);
      });

      it("vault has expected balance", async function () {
        let vaultData = await this.rewardsProxy.getVault(0);
        expect(vaultData.totalDeposited).to.equal(totalReward);
        expect(vaultData.currentBalance).to.equal(totalReward);
      });

      it("reverts invalid claim", async function () {
        let proof = [makeElement(owner.address, "10")];
        await expect(this.rewardsProxy.claimReward(0, proof, owner.address, "10")).to.be.revertedWith("Invalid claim");
      });

      it("reverts claim when beneficiary does not exist", async function () {
        let proof = merkleTree.getProof(makeElement(beneficiary1.address, claims[beneficiary1.address]));
        await this.mockBeneficiaryRegistry.mock.beneficiaryExists.returns(false);
        await expect(this.rewardsProxy.connect(beneficiary1).claimReward(
          0,
          proof,
          beneficiary1.address,
          claims[beneficiary1.address]
        )).to.be.revertedWith("Beneficiary does not exist");
      });

      it("verifies valid claim", async function () {
        let proof = merkleTree.getProof(makeElement(beneficiary1.address, claims[beneficiary1.address]));
        expect(await this.rewardsProxy.connect(beneficiary1).verifyClaim(
          0,
          proof,
          beneficiary1.address,
          claims[beneficiary1.address]
        )).to.be.true;
      });

      it("reverts claim from wrong sender", async function () {
        let proof = merkleTree.getProof(makeElement(beneficiary1.address, claims[beneficiary1.address]));
        await expect(this.rewardsProxy.connect(beneficiary2).claimReward(
          0,
          proof,
          beneficiary1.address,
          claims[beneficiary1.address]
        )).to.be.revertedWith("Sender must be beneficiary");
      });

      it("reverts when closing before end block", async function () {
        await expect(this.rewardsProxy.closeVault(0)).to.be.revertedWith("Vault has not ended");
      });

      it("reverts when reinitializing open vault", async function () {
        await expect(
          this.rewardsProxy.initializeVault(0, endTime, merkleRoot)
        ).to.be.revertedWith("Vault must not be open");
      });

      it("reverts close vault before end time", async function () {
        await expect(this.rewardsProxy.closeVault(0)).to.be.revertedWith("Vault has not ended");
      });

      describe("allows claim from beneficiary 1", function () {
        beforeEach(async function () {
          let proof = merkleTree.getProof(makeElement(beneficiary1.address, claims[beneficiary1.address]));
          result = await this.rewardsProxy.connect(beneficiary1).claimReward(
            0,
            proof,
            beneficiary1.address,
            claims[beneficiary1.address]
          );
        });

        it("emits a RewardClaimed event", async function () {
          expect(result).to.emit(this.rewardsProxy, "RewardClaimed").withArgs(0, beneficiary1.address, 500000);
        });

        it("vault has expected data", async function () {
          let vaultData = await this.rewardsProxy.getVault(0);
          expect(vaultData.currentBalance).to.equal(9500000);
          expect(vaultData.unclaimedShare).to.equal(parseEther("95").toString());
          expect(await this.rewardsProxy.hasClaimed(0, beneficiary1.address)).to.be.true;
        });

        it("has expected contract balance", async function () {
          expect(await this.mockPop.balanceOf(this.rewardsProxy.address)).to.equal(9500000);
        });

        it("reverts a second claim", async function () {
          let proof = merkleTree.getProof(makeElement(beneficiary1.address, claims[beneficiary1.address]));
          await expect(this.rewardsProxy.connect(beneficiary1).claimReward(
            0,
            proof,
            beneficiary1.address,
            claims[beneficiary1.address]
          )).to.be.revertedWith("Already claimed");
        });

        describe("allows claim from beneficiary 2", function () {
          beforeEach(async function () {
            let proof = merkleTree.getProof(makeElement(beneficiary2.address, claims[beneficiary2.address]));
            await this.rewardsProxy.connect(beneficiary2).claimReward(
              0,
              proof,
              beneficiary2.address,
              claims[beneficiary2.address]
            );
          });

          it("vault has expected data", async function () {
            let vaultData = await this.rewardsProxy.getVault(0);
            expect(vaultData.currentBalance).to.equal(9000000);
            expect(vaultData.unclaimedShare).to.equal(parseEther("90").toString());
            expect(await this.rewardsProxy.hasClaimed(0, beneficiary2.address)).to.be.true;
          });

          it("has expected contract balance", async function () {
            expect(await this.mockPop.balanceOf(this.rewardsProxy.address)).to.equal(9000000);
          });
        });

        describe("closes vault 0 after end time", function () {
          beforeEach(async function () {
            ethers.provider.send("evm_increaseTime", [endTime - Math.floor(Date.now() / 1000)]);
            ethers.provider.send("evm_mine");
          });

          it("redirect unclaimed rewards to owner when no other vaults open", async function () {
            await this.rewardsProxy.closeVault(0);
            expect(await this.mockPop.balanceOf(this.rewardsProxy.address)).to.equal(0);
          });

          //@todo open vault 1 for remaining rewards and close 0
        });
      });
    });

    describe("vault 0 is reinitialized", function () {
      beforeEach(async function () {
        result = await this.rewardsProxy.initializeVault(0, endTime, merkleRoot);
      });

      it("reverts when closing initialized vault", async function () {
        await expect(this.rewardsProxy.closeVault(0)).to.be.revertedWith("Vault must be open");
      });

      it("emits a VaultInitialized event", async function () {
        expect(result).to.emit(this.rewardsProxy, "VaultInitialized").withArgs(0, merkleRoot);
      });

      it("vault has expected values", async function () {
        let vaultData = await this.rewardsProxy.getVault(0);
        expect(vaultData.totalDeposited).to.equal(0);
        expect(vaultData.currentBalance).to.equal(0);
        expect(vaultData.unclaimedShare).to.equal(parseEther("100").toString());
        expect(vaultData.merkleRoot).to.equal(merkleRoot);
        expect(vaultData.endTime).to.equal(endTime);
        expect(vaultData.status).to.equal(VaultStatus.Initialized);
        expect(await this.rewardsProxy.hasClaimed(0, beneficiary1.address)).to.be.false;
        expect(await this.rewardsProxy.hasClaimed(0, beneficiary2.address)).to.be.false;
      });
    });
  });
});
