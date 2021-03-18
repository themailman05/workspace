const { expect } = require("chai");
const { waffle } = require("hardhat");
const { parseEther } = require("ethers/lib/utils");
const { merklize, makeElement, generateClaims } = require("../scripts/merkle.js");
const IUniswapV2Factory = require("../artifacts/@uniswap/v2-core/contracts/interfaces/IUniswapV2Factory.sol/IUniswapV2Factory.json");
const IUniswapV2Router02 = require("../artifacts/@uniswap/v2-periphery/contracts/interfaces/IUniswapV2Router02.sol/IUniswapV2Router02.json");
const provider = waffle.provider;

describe('RewardsManager', function () {
  const VaultStatus = { "Initialized": 0, "Open": 1, "Closed": 2 };
  const RewardSplits = { "Staking": parseEther("33"), "Treasury": parseEther("33"), "Beneficiaries": parseEther("34") };
  const OwnerInitial = parseEther("10");
  const RewarderInitial = parseEther("5");
  let MockERC20, Staking, Treasury, BeneficiaryRegistry, RewardsManager;
  let owner, rewarder, beneficiary1, beneficiary2;
  let claims, merkleTree, merkleRoot;

  beforeEach(async function () {
    [owner, rewarder, beneficiary1, beneficiary2] = await ethers.getSigners();

    MockERC20 = await ethers.getContractFactory("MockERC20");
    this.mockPop = await MockERC20.deploy("TestPOP", "TPOP");
    await this.mockPop.mint(owner.address, OwnerInitial);
    await this.mockPop.mint(rewarder.address, RewarderInitial);

    this.mockAlt = await MockERC20.deploy("TestALT", "TALT");
    await this.mockAlt.mint(owner.address, OwnerInitial);

    Treasury = await ethers.getContractFactory("MockTreasury");
    this.mockTreasury = await waffle.deployMockContract(owner, Treasury.interface.format());

    Staking = await ethers.getContractFactory("MockStaking");
    this.mockStaking = await waffle.deployMockContract(owner, Staking.interface.format());

    BeneficiaryRegistry = await ethers.getContractFactory("BeneficiaryRegistry");
    this.mockBeneficiaryRegistry = await waffle.deployMockContract(owner, BeneficiaryRegistry.interface.format());
    await this.mockBeneficiaryRegistry.mock.beneficiaryExists.returns(true); //assume true

    this.mockUniswapV2Factory = await waffle.deployMockContract(owner, IUniswapV2Factory.abi);
    this.mockUniswapV2Router = await waffle.deployMockContract(owner, IUniswapV2Router02.abi);
    await this.mockUniswapV2Router.mock.factory.returns(this.mockUniswapV2Factory.address);

    RewardsManager = await ethers.getContractFactory("RewardsManager");
    this.rewardsManager = await RewardsManager.deploy(
      this.mockPop.address,
      this.mockStaking.address,
      this.mockTreasury.address,
      this.mockBeneficiaryRegistry.address,
      this.mockUniswapV2Router.address
    );
    await this.rewardsManager.deployed();

    claims = generateClaims(await provider.listAccounts());
    merkleTree = merklize(claims);
    merkleRoot = "0x" + merkleTree.getRoot().toString("hex");
  });

  it("should be constructed with correct addresses", async function () {
    expect(await this.rewardsManager.pop()).to.equal(this.mockPop.address);
    expect(await this.rewardsManager.staking()).to.equal(this.mockStaking.address);
    expect(await this.rewardsManager.treasury()).to.equal(this.mockTreasury.address);
    expect(await this.rewardsManager.beneficiaryRegistry()).to.equal(this.mockBeneficiaryRegistry.address);
    expect(await this.rewardsManager.uniswapV2Factory()).to.equal(this.mockUniswapV2Factory.address);
    expect(await this.rewardsManager.uniswapV2Router()).to.equal(this.mockUniswapV2Router.address);
  });

  it("should be initialized with correct splits", async function () {
    expect(await this.rewardsManager.rewardSplits(0)).to.equal(parseEther("33"));
    expect(await this.rewardsManager.rewardSplits(1)).to.equal(parseEther("33"));
    expect(await this.rewardsManager.rewardSplits(2)).to.equal(parseEther("34"));
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
      this.rewardsManager.connect(beneficiary1).setRewardSplits([20, 20, 60])
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

  describe("reward splits are set", function () {
    beforeEach(async function () {
      await this.rewardsManager.setRewardSplits([parseEther("20"), parseEther("20"), parseEther("60")]);
    });

    it("should have updated correct splits", async function () {
      expect(await this.rewardsManager.rewardSplits(0)).to.equal(parseEther("20"));
      expect(await this.rewardsManager.rewardSplits(1)).to.equal(parseEther("20"));
      expect(await this.rewardsManager.rewardSplits(2)).to.equal(parseEther("60"));
    });
  });

  it("should revert setting to same Staking", async function () {
    await expect(this.rewardsManager.setStaking(this.mockStaking.address)).to.be.revertedWith("Same Staking");
  });

  it("should revert setting to same Treasury", async function () {
    await expect(this.rewardsManager.setTreasury(this.mockTreasury.address)).to.be.revertedWith("Same Treasury");
  });

  it("should revert setting to same Beneficiary Registry", async function () {
    await expect(
      this.rewardsManager.setBeneficiaryRegistry(this.mockBeneficiaryRegistry.address)
    ).to.be.revertedWith("Same BeneficiaryRegistry");
  });

  describe("sets new dependent contracts", function () {
    it("sets new Staking", async function () {
      const newStaking = await waffle.deployMockContract(owner, Staking.interface.format());
      result = await this.rewardsManager.setStaking(newStaking.address);
      expect(await this.rewardsManager.staking()).to.equal(newStaking.address);
      expect(result).to.emit(this.rewardsManager, "StakingChanged")
        .withArgs(this.mockStaking.address, newStaking.address);
    });

    it("sets new Treasury", async function () {
      const newTreasury = await waffle.deployMockContract(owner, Treasury.interface.format());
      result = await this.rewardsManager.setTreasury(newTreasury.address);
      expect(await this.rewardsManager.treasury()).to.equal(newTreasury.address);
      expect(result).to.emit(this.rewardsManager, "TreasuryChanged")
        .withArgs(this.mockTreasury.address, newTreasury.address);
    });

    it("sets new BeneficiaryRegistry", async function () {
      const newBeneficiaryRegistry = await waffle.deployMockContract(owner, BeneficiaryRegistry.interface.format());
      result = await this.rewardsManager.setBeneficiaryRegistry(newBeneficiaryRegistry.address);
      expect(await this.rewardsManager.beneficiaryRegistry()).to.equal(newBeneficiaryRegistry.address);
      expect(result).to.emit(this.rewardsManager, "BeneficiaryRegistryChanged")
        .withArgs(this.mockBeneficiaryRegistry.address, newBeneficiaryRegistry.address);
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
      const vaultData = await this.rewardsManager.getVault(0);
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
      const vaultData = await this.rewardsManager.getVault(0);
      expect(vaultData.status).to.equal(VaultStatus.Open);
    });

    it("has expected previous pop balance", async function () {
      expect(await this.rewardsManager.previousPopBalance()).to.equal(0);
    });

    describe("open vault and send rewards", function () {
      beforeEach(async function () {
        firstReward = parseEther("0.1");
        stakingReward = firstReward.mul(RewardSplits.Staking).div(parseEther("100"));
        treasuryReward = firstReward.mul(RewardSplits.Treasury).div(parseEther("100"));
        beneficiariesReward = firstReward.mul(RewardSplits.Beneficiaries).div(parseEther("100"));
        result = await this.rewardsManager.openVault(0);
        await this.mockPop.connect(rewarder).transfer(this.rewardsManager.address, firstReward);
      });

      it("emits expected events", async function () {
        expect(result).to.emit(this.rewardsManager, "VaultOpened").withArgs(0);
      });

      it("contract has expected balance", async function () {
        expect(await this.mockPop.balanceOf(this.rewardsManager.address)).to.equal(firstReward);
      });

      it("reverts invalid claim", async function () {
        const proof = [makeElement(owner.address, "10")];
        await expect(
          this.rewardsManager.claimReward(0, proof, owner.address, "10")
        ).to.be.revertedWith("Invalid claim");
      });

      it("reverts claim when beneficiary does not exist", async function () {
        const proof = merkleTree.getProof(makeElement(beneficiary1.address, claims[beneficiary1.address]));
        await this.mockBeneficiaryRegistry.mock.beneficiaryExists.returns(false);
        await expect(this.rewardsManager.connect(beneficiary1).claimReward(
          0,
          proof,
          beneficiary1.address,
          claims[beneficiary1.address]
        )).to.be.revertedWith("Beneficiary does not exist");
      });

      it("verifies valid claim", async function () {
        const proof = merkleTree.getProof(makeElement(beneficiary1.address, claims[beneficiary1.address]));
        expect(await this.rewardsManager.connect(beneficiary1).verifyClaim(
          0,
          proof,
          beneficiary1.address,
          claims[beneficiary1.address]
        )).to.be.true;
      });

      it("reverts claim from wrong sender", async function () {
        const proof = merkleTree.getProof(makeElement(beneficiary1.address, claims[beneficiary1.address]));
        result = await expect(this.rewardsManager.connect(beneficiary2).claimReward(
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
          const proof = merkleTree.getProof(makeElement(beneficiary1.address, claims[beneficiary1.address]));
          result = await this.rewardsManager.connect(beneficiary1).claimReward(
            0,
            proof,
            beneficiary1.address,
            claims[beneficiary1.address]
          );
        });

        it("emits expected events", async function () {
          expect(result).to.emit(this.rewardsManager, "StakingDeposited")
            .withArgs(this.mockStaking.address, stakingReward);
          expect(result).to.emit(this.rewardsManager, "TreasuryDeposited")
            .withArgs(this.mockTreasury.address, treasuryReward);
          expect(result).to.emit(this.rewardsManager, "VaultDeposited").withArgs(0, beneficiariesReward);
          expect(result).to.emit(this.rewardsManager, "RewardsApplied").withArgs(firstReward);
          expect(result).to.emit(this.rewardsManager, "RewardClaimed")
            .withArgs(0, beneficiary1.address, beneficiary1Claim);
        });

        it("Staking has expected balance", async function () {
          expect(await this.mockPop.balanceOf(this.mockStaking.address)).to.equal(stakingReward);
        });

        it("Treasury has expected balance", async function () {
          expect(await this.mockPop.balanceOf(this.mockTreasury.address)).to.equal(treasuryReward);
        });

        it("contract has expected balance", async function () {
          expect(
            await this.mockPop.balanceOf(this.rewardsManager.address)
          ).to.equal(beneficiariesReward.sub(beneficiary1Claim));
        });

        it("has expected previous pop balance", async function () {
          expect(
            await this.rewardsManager.previousPopBalance()
          ).to.equal(beneficiariesReward.sub(beneficiary1Claim));
        });

        it("vault has expected data", async function () {
          const currentBalance = beneficiariesReward.sub(beneficiary1Claim);
          const unclaimedShare = parseEther("100").sub(claims[beneficiary1.address]);
          const vaultData = await this.rewardsManager.getVault(0);
          expect(vaultData.totalDeposited).to.equal(beneficiariesReward);
          expect(vaultData.currentBalance).to.equal(currentBalance);
          expect(vaultData.unclaimedShare).to.equal(unclaimedShare);
          expect(await this.rewardsManager.hasClaimed(0, beneficiary1.address)).to.be.true;
        });

        it("reverts a second claim", async function () {
          const proof = merkleTree.getProof(makeElement(beneficiary1.address, claims[beneficiary1.address]));
          await expect(this.rewardsManager.connect(beneficiary1).claimReward(
            0,
            proof,
            beneficiary1.address,
            claims[beneficiary1.address]
          )).to.be.revertedWith("Already claimed");
        });

        describe("send more rewards", function () {
          beforeEach(async function () {
            secondReward = parseEther("0.05");
            await this.mockPop.connect(rewarder).transfer(this.rewardsManager.address, secondReward);
          });

          it("has expected contract balance", async function () {
            const currentBalance = beneficiariesReward.sub(beneficiary1Claim).add(secondReward);
            expect(await this.mockPop.balanceOf(this.rewardsManager.address)).to.equal(currentBalance);
          });

          describe("allows claim from beneficiary 2", function () {
            beforeEach(async function () {
              stakingSecondReward = secondReward.mul(RewardSplits.Staking).div(parseEther("100"));
              treasurySecondReward = secondReward.mul(RewardSplits.Treasury).div(parseEther("100"));
              beneficiariesSecondReward = secondReward.mul(RewardSplits.Beneficiaries).div(parseEther("100"));
              beneficiary2Claim = beneficiariesReward
                .add(beneficiariesSecondReward)
                .sub(beneficiary1Claim)
                .mul(claims[beneficiary2.address])
                .div(parseEther("95"));
              const proof = merkleTree.getProof(makeElement(beneficiary2.address, claims[beneficiary2.address]));
              result = await this.rewardsManager.connect(beneficiary2).claimReward(
                0,
                proof,
                beneficiary2.address,
                claims[beneficiary2.address]
              );
            });

            it("emits expected events", async function () {
              expect(result).to.emit(this.rewardsManager, "StakingDeposited")
                .withArgs(this.mockStaking.address, stakingSecondReward);
              expect(result).to.emit(this.rewardsManager, "TreasuryDeposited")
                .withArgs(this.mockTreasury.address, treasurySecondReward);
              expect(result).to.emit(this.rewardsManager, "VaultDeposited")
                .withArgs(0, beneficiariesSecondReward);
              expect(result).to.emit(this.rewardsManager, "RewardsApplied").withArgs(secondReward);
            });

            it("vault has expected data", async function () {
              const currentBalance = beneficiariesReward
                .add(beneficiariesSecondReward)
                .sub(beneficiary1Claim)
                .sub(beneficiary2Claim);
              const unclaimedShare = parseEther("100")
                .sub(claims[beneficiary1.address])
                .sub(claims[beneficiary2.address]);
              const vaultData = await this.rewardsManager.getVault(0);
              expect(vaultData.totalDeposited).to.equal(beneficiariesReward.add(beneficiariesSecondReward));
              expect(vaultData.currentBalance).to.equal(currentBalance);
              expect(vaultData.unclaimedShare).to.equal(unclaimedShare);
              expect(await this.rewardsManager.hasClaimed(0, beneficiary2.address)).to.be.true;
            });

            it("has expected contract balance", async function () {
              const currentBalance = beneficiariesReward
                .add(beneficiariesSecondReward)
                .sub(beneficiary1Claim)
                .sub(beneficiary2Claim);
              expect(await this.mockPop.balanceOf(this.rewardsManager.address)).to.equal(currentBalance);
            });

            it("has expected previous pop balance", async function () {
              expect(await this.rewardsManager.previousPopBalance()).to.equal(
                beneficiariesReward.add(beneficiariesSecondReward).sub(beneficiary1Claim).sub(beneficiary2Claim)
              );
            });
          });

          describe("closes vault 0 after end time", function () {
            beforeEach(async function () {
              ethers.provider.send("evm_increaseTime", [endTime - Math.floor(Date.now() / 1000)]);
              ethers.provider.send("evm_mine");
              result = await this.rewardsManager.closeVault(0);
            });

            it("emits a VaultClosed event", async function () {
              expect(result).to.emit(this.rewardsManager, "VaultClosed").withArgs(0);
            });

            it("redirect unclaimed rewards to owner when no other vaults open", async function () {
              expect(await this.mockPop.balanceOf(this.rewardsManager.address)).to.equal(secondReward);
            });
          });

          describe("initialize and open vault 1", function () {
            beforeEach(async function () {
              currentTime = (await provider.getBlock("latest")).timestamp;
              endTime = currentTime + 11111;
              await this.rewardsManager.initializeVault(1, endTime, merkleRoot);
              await this.rewardsManager.openVault(1);
            });

            it("vault 1 has expected values", async function () {
              const vaultData = await this.rewardsManager.getVault(1);
              expect(vaultData.totalDeposited).to.equal(0);
              expect(vaultData.currentBalance).to.equal(0);
              expect(vaultData.unclaimedShare).to.equal(parseEther("100"));
              expect(vaultData.merkleRoot).to.equal(merkleRoot);
              expect(vaultData.endTime).to.equal(endTime);
              expect(vaultData.status).to.equal(VaultStatus.Open);
              expect(await this.rewardsManager.hasClaimed(1, beneficiary1.address)).to.be.false;
              expect(await this.rewardsManager.hasClaimed(1, beneficiary2.address)).to.be.false;
            });

            describe("close vault 0 and redirect remaining rewards to vault 1", function () {
              beforeEach(async function () {
                ethers.provider.send("evm_increaseTime", [endTime - Math.floor(Date.now() / 1000)]);
                ethers.provider.send("evm_mine");
                await this.rewardsManager.closeVault(0);
              });

              it("vault 1 has expected values", async function () {
                const currentBalance = beneficiariesReward.sub(beneficiary1Claim);
                const vaultData = await this.rewardsManager.getVault(1);
                expect(vaultData.totalDeposited).to.equal(currentBalance);
                expect(vaultData.currentBalance).to.equal(currentBalance);
                expect(vaultData.unclaimedShare).to.equal(parseEther("100"));
                expect(await this.rewardsManager.hasClaimed(1, beneficiary1.address)).to.be.false;
                expect(await this.rewardsManager.hasClaimed(1, beneficiary2.address)).to.be.false;
              });
            });
          });
        });

        describe("send alt token for reward swap", function () {
          beforeEach(async function () {
            altAmount = parseEther("1");
            await this.mockAlt.transfer(this.rewardsManager.address, altAmount);
          });

          it("has expected contract balance", async function () {
            expect(await this.mockAlt.balanceOf(this.rewardsManager.address)).to.equal(altAmount);
          });

          it("reverts with short path", async function () {
            await expect(
              this.rewardsManager.swapTokenForRewards([this.mockAlt.address], 100)
            ).to.be.revertedWith("Invalid swap path");
          });

          it("reverts with invalid amount", async function () {
            await expect(
              this.rewardsManager.swapTokenForRewards([this.mockAlt.address, this.mockPop.address], 0)
            ).to.be.revertedWith("Invalid amount");
          });

          it("reverts with invalid path", async function () {
            await expect(
              this.rewardsManager.swapTokenForRewards([this.mockAlt.address, this.mockAlt.address], 100)
            ).to.be.revertedWith("POP must be last in path");
          });

          describe("convert and apply rewards", function () {
            beforeEach(async function () {
              swapReward = parseEther("0.24");
              stakingSwapReward = swapReward.mul(RewardSplits.Staking).div(parseEther("100"));
              treasurySwapReward = swapReward.mul(RewardSplits.Treasury).div(parseEther("100"));
              beneficiariesSwapReward = swapReward.mul(RewardSplits.Beneficiaries).div(parseEther("100"));
              await this.mockUniswapV2Router.mock.swapExactTokensForTokens.returns([altAmount, swapReward]);
              await this.mockPop.transfer(this.rewardsManager.address, swapReward); //simulate swap
              result = await this.rewardsManager.swapTokenForRewards(
                [this.mockAlt.address, this.mockPop.address],
                swapReward
              );
            });

            it("emits expected events", async function () {
              expect(result).to.emit(this.rewardsManager, "TokenSwapped")
                .withArgs(this.mockAlt.address, altAmount, swapReward);
              expect(result).to.emit(this.rewardsManager, "StakingDeposited")
                .withArgs(this.mockStaking.address, stakingSwapReward);
              expect(result).to.emit(this.rewardsManager, "TreasuryDeposited")
                .withArgs(this.mockTreasury.address, treasurySwapReward);
              expect(result).to.emit(this.rewardsManager, "VaultDeposited")
                .withArgs(0, beneficiariesSwapReward);
              expect(result).to.emit(this.rewardsManager, "RewardsApplied").withArgs(swapReward);
            });

            it("vault has expected data", async function () {
              const currentBalance = beneficiariesReward.add(beneficiariesSwapReward).sub(beneficiary1Claim)
              const unclaimedShare = parseEther("100").sub(claims[beneficiary1.address])
              const vaultData = await this.rewardsManager.getVault(0);
              expect(vaultData.totalDeposited).to.equal(beneficiariesReward.add(beneficiariesSwapReward));
              expect(vaultData.currentBalance).to.equal(currentBalance);
              expect(vaultData.unclaimedShare).to.equal(unclaimedShare);
              expect(await this.rewardsManager.hasClaimed(0, beneficiary1.address)).to.be.true;
              expect(await this.rewardsManager.hasClaimed(0, beneficiary2.address)).to.be.false;
            });

            it("has expected contract balance", async function () {
              expect(await this.mockPop.balanceOf(this.rewardsManager.address)).to.equal(
                beneficiariesReward.add(beneficiariesSwapReward).sub(beneficiary1Claim)
              );
            });

            it("has expected previous pop balance", async function () {
              expect(await this.rewardsManager.previousPopBalance()).to.equal(
                beneficiariesReward.add(beneficiariesSwapReward).sub(beneficiary1Claim)
              );
            });
          });
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
        const vaultData = await this.rewardsManager.getVault(0);
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
