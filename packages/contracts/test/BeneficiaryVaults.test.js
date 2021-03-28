const { expect } = require("chai");
const { waffle } = require("hardhat");
const { parseEther } = require("ethers/lib/utils");
const { merklize, makeElement, generateClaims } = require("../scripts/merkle.js");
const provider = waffle.provider;

describe('BeneficiaryVaults', function () {
  const VaultStatus = { "Initialized": 0, "Open": 1, "Closed": 2 };
  const OwnerInitial = parseEther("10");
  const RewarderInitial = parseEther("5");
  let MockERC20, BeneficiaryRegistry;
  let owner, rewarder, beneficiary1, beneficiary2;
  let claims, merkleTree, merkleRoot;

  beforeEach(async function () {
    [owner, rewarder, beneficiary1, beneficiary2] = await ethers.getSigners();

    MockERC20 = await ethers.getContractFactory("MockERC20");
    this.mockPop = await MockERC20.deploy("TestPOP", "TPOP", 18);
    await this.mockPop.mint(owner.address, OwnerInitial);
    await this.mockPop.mint(rewarder.address, RewarderInitial);

    BeneficiaryRegistry = await ethers.getContractFactory("BeneficiaryRegistry");
    this.mockBeneficiaryRegistry = await waffle.deployMockContract(owner, BeneficiaryRegistry.interface.format());
    await this.mockBeneficiaryRegistry.mock.beneficiaryExists.returns(true); //assume true

    BeneficiaryVaults = await ethers.getContractFactory("BeneficiaryVaults");
    this.beneficiaryVaults = await BeneficiaryVaults.deploy(this.mockPop.address, this.mockBeneficiaryRegistry.address);

    claims = generateClaims(await provider.listAccounts());
    merkleTree = merklize(claims);
    merkleRoot = "0x" + merkleTree.getRoot().toString("hex");
  });

  it("should be constructed with correct addresses", async function () {
    expect(await this.beneficiaryVaults.pop()).to.equal(this.mockPop.address);
    expect(await this.beneficiaryVaults.beneficiaryRegistry()).to.equal(this.mockBeneficiaryRegistry.address);
  });

  it("reverts when trying to get uninitialized vault", async function () {
    await expect(this.beneficiaryVaults.getVault(0)).to.be.revertedWith("Uninitialized vault slot");
  });

  it("reverts when trying to get invalid vault", async function () {
    await expect(this.beneficiaryVaults.getVault(4)).to.be.revertedWith("Invalid vault id");
  });

  it("reverts when trying to initialize an invalid vault id", async function () {
    const currentBlock = (await provider.getBlock("latest")).number;
    await expect(
      this.beneficiaryVaults.initializeVault(4, currentBlock + 1, merkleRoot)
    ).to.be.revertedWith("Invalid vault id");
  });

  it("reverts when trying to initialize an invalid end block", async function () {
    const currentBlock = (await provider.getBlock("latest")).number;
    await expect(
      this.beneficiaryVaults.initializeVault(0, currentBlock, merkleRoot)
    ).to.be.revertedWith("Invalid end block");
  });

  it("cannot tranfer ownership as non-owner", async function () {
    await expect(
      this.beneficiaryVaults.connect(beneficiary1).transferOwnership(beneficiary1.address)
    ).to.be.revertedWith("Ownable: caller is not the owner");
  });

  it("should revert setting to same Beneficiary Registry", async function () {
    await expect(
      this.beneficiaryVaults.setBeneficiaryRegistry(this.mockBeneficiaryRegistry.address)
    ).to.be.revertedWith("Same BeneficiaryRegistry");
  });

  describe("sets new dependent contracts", function () {
    it("sets new BeneficiaryRegistry", async function () {
      const newBeneficiaryRegistry = await waffle.deployMockContract(owner, BeneficiaryRegistry.interface.format());
      result = await this.beneficiaryVaults.setBeneficiaryRegistry(newBeneficiaryRegistry.address);
      expect(await this.beneficiaryVaults.beneficiaryRegistry()).to.equal(newBeneficiaryRegistry.address);
      expect(result).to.emit(this.beneficiaryVaults, "BeneficiaryRegistryChanged")
        .withArgs(this.mockBeneficiaryRegistry.address, newBeneficiaryRegistry.address);
    });
  });

  describe("vault 0 is initialized", function () {
    beforeEach(async function () {
      currentTime = (await provider.getBlock("latest")).timestamp;
      endTime = currentTime + 10000;
      result = await this.beneficiaryVaults.initializeVault(0, endTime, merkleRoot);
    });

    it("reverts when closing initialized vault", async function () {
      await expect(this.beneficiaryVaults.closeVault(0)).to.be.revertedWith("Vault must be open");
    });

    it("reverts when distributing to no open vaults", async function () {
      await expect(this.beneficiaryVaults.distributeRewards()).to.be.revertedWith("No open vaults");
    });

    it("emits a VaultInitialized event", async function () {
      expect(result).to.emit(this.beneficiaryVaults, "VaultInitialized").withArgs(0, merkleRoot);
    });

    it("vault has expected values", async function () {
      const vaultData = await this.beneficiaryVaults.getVault(0);
      expect(vaultData.totalAllocated).to.equal(0);
      expect(vaultData.currentBalance).to.equal(0);
      expect(vaultData.unclaimedShare).to.equal(parseEther("100"));
      expect(vaultData.merkleRoot).to.equal(merkleRoot);
      expect(vaultData.endTime).to.equal(endTime);
      expect(vaultData.status).to.equal(VaultStatus.Initialized);
      expect(await this.beneficiaryVaults.hasClaimed(0, beneficiary1.address)).to.be.false;
      expect(await this.beneficiaryVaults.hasClaimed(0, beneficiary2.address)).to.be.false;
    });

    describe("opens vault 0", function () {
      beforeEach(async function () {
        result = await this.beneficiaryVaults.openVault(0);
      });

      it("emits expected events", async function () {
        expect(result).to.emit(this.beneficiaryVaults, "VaultOpened").withArgs(0);
      });

      it("vault has expected values", async function () {
        const vaultData = await this.beneficiaryVaults.getVault(0);
        expect(vaultData.status).to.equal(VaultStatus.Open);
        expect(await this.beneficiaryVaults.hasClaimed(0, beneficiary1.address)).to.be.false;
        expect(await this.beneficiaryVaults.hasClaimed(0, beneficiary2.address)).to.be.false;
      });

      it("contract has expected balance", async function () {
        expect(await this.mockPop.balanceOf(this.beneficiaryVaults.address)).to.equal(0);
      });

      it("contract has expected vaulted balance", async function () {
        expect(await this.beneficiaryVaults.totalVaultedBalance()).to.equal(0);
      });

      it("reverts claim with no reward", async function () {
        const proof = merkleTree.getProof(makeElement(beneficiary1.address, claims[beneficiary1.address]));
        await expect(
          this.beneficiaryVaults.connect(beneficiary1).claimReward(0, proof, beneficiary1.address, claims[beneficiary1.address])
        ).to.be.revertedWith("No reward");
      });

      describe("deposits reward and distribute to vaults", function () {
        beforeEach(async function () {
          firstReward = parseEther("1");
          await this.mockPop.connect(rewarder).transfer(this.beneficiaryVaults.address, firstReward);
          result = await this.beneficiaryVaults.distributeRewards();
        });

        it("contract has expected balance", async function () {
          expect(await this.mockPop.balanceOf(this.beneficiaryVaults.address)).to.equal(firstReward);
        });

        it("contract has expected vaulted balance", async function () {
          expect(await this.beneficiaryVaults.totalVaultedBalance()).to.equal(firstReward);
        });

        it("emits expected events", async function () {
          expect(result).to.emit(this.beneficiaryVaults, "RewardAllocated").withArgs(0, firstReward);
          expect(result).to.emit(this.beneficiaryVaults, "RewardsDistributed").withArgs(firstReward);
        });

        it("reverts invalid claim", async function () {
          const proof = [makeElement(owner.address, "10")];
          await expect(
            this.beneficiaryVaults.claimReward(0, proof, owner.address, "10")
          ).to.be.revertedWith("Invalid claim");
        });

        it("reverts claim when beneficiary does not exist", async function () {
          const proof = merkleTree.getProof(makeElement(beneficiary1.address, claims[beneficiary1.address]));
          await this.mockBeneficiaryRegistry.mock.beneficiaryExists.returns(false);
          await expect(this.beneficiaryVaults.connect(beneficiary1).claimReward(
            0,
            proof,
            beneficiary1.address,
            claims[beneficiary1.address]
          )).to.be.revertedWith("Beneficiary does not exist");
        });

        it("verifies valid claim", async function () {
          const proof = merkleTree.getProof(makeElement(beneficiary1.address, claims[beneficiary1.address]));
          expect(await this.beneficiaryVaults.connect(beneficiary1).verifyClaim(
            0,
            proof,
            beneficiary1.address,
            claims[beneficiary1.address]
          )).to.be.true;
        });

        it("reverts claim from wrong sender", async function () {
          const proof = merkleTree.getProof(makeElement(beneficiary1.address, claims[beneficiary1.address]));
          result = await expect(this.beneficiaryVaults.connect(beneficiary2).claimReward(
            0,
            proof,
            beneficiary1.address,
            claims[beneficiary1.address]
          )).to.be.revertedWith("Sender must be beneficiary");
        });

        it("reverts when closing before end block", async function () {
          await expect(this.beneficiaryVaults.closeVault(0)).to.be.revertedWith("Vault has not ended");
        });

        it("reverts when reinitializing open vault", async function () {
          await expect(
            this.beneficiaryVaults.initializeVault(0, endTime, merkleRoot)
          ).to.be.revertedWith("Vault must not be open");
        });

        it("reverts close vault before end time", async function () {
          await expect(this.beneficiaryVaults.closeVault(0)).to.be.revertedWith("Vault has not ended");
        });

        describe("claim from beneficiary 1", function () {
          beforeEach(async function () {
            beneficiary1Claim = firstReward.mul(claims[beneficiary1.address]).div(parseEther("100"));
            const proof = merkleTree.getProof(makeElement(beneficiary1.address, claims[beneficiary1.address]));
            result = await this.beneficiaryVaults.connect(beneficiary1).claimReward(
              0,
              proof,
              beneficiary1.address,
              claims[beneficiary1.address]
            );
          });

          it("emits expected events", async function () {
            expect(result).to.emit(this.beneficiaryVaults, "RewardClaimed")
              .withArgs(0, beneficiary1.address, beneficiary1Claim);
          });

          it("contract has expected balance", async function () {
            expect(
              await this.mockPop.balanceOf(this.beneficiaryVaults.address)
            ).to.equal(firstReward.sub(beneficiary1Claim));
          });

          it("contract has expected vaulted balance", async function () {
            expect(await this.beneficiaryVaults.totalVaultedBalance()).to.equal(firstReward.sub(beneficiary1Claim));
          });

          it("vault has expected data", async function () {
            const currentBalance = firstReward.sub(beneficiary1Claim);
            const unclaimedShare = parseEther("100").sub(claims[beneficiary1.address]);
            const vaultData = await this.beneficiaryVaults.getVault(0);
            expect(vaultData.totalAllocated).to.equal(firstReward);
            expect(vaultData.currentBalance).to.equal(currentBalance);
            expect(vaultData.unclaimedShare).to.equal(unclaimedShare);
            expect(await this.beneficiaryVaults.hasClaimed(0, beneficiary1.address)).to.be.true;
          });

          it("reverts a second claim", async function () {
            const proof = merkleTree.getProof(makeElement(beneficiary1.address, claims[beneficiary1.address]));
            await expect(this.beneficiaryVaults.connect(beneficiary1).claimReward(
              0,
              proof,
              beneficiary1.address,
              claims[beneficiary1.address]
            )).to.be.revertedWith("Already claimed");
          });

          describe("deposit more rewards and distribute", function () {
            beforeEach(async function () {
              secondReward = parseEther("0.05");
              await this.mockPop.connect(rewarder).transfer(this.beneficiaryVaults.address, secondReward);
              result = await this.beneficiaryVaults.connect(rewarder).distributeRewards();
            });

            it("has expected contract balance", async function () {
              const currentBalance = firstReward.sub(beneficiary1Claim).add(secondReward);
              expect(await this.mockPop.balanceOf(this.beneficiaryVaults.address)).to.equal(currentBalance);
            });

            it("contract has expected vaulted balance", async function () {
              const currentBalance = firstReward.sub(beneficiary1Claim).add(secondReward);
              expect(await this.beneficiaryVaults.totalVaultedBalance()).to.equal(currentBalance);
            });

            it("emits expected events", async function () {
              expect(result).to.emit(this.beneficiaryVaults, "RewardAllocated").withArgs(0, secondReward);
              expect(result).to.emit(this.beneficiaryVaults, "RewardsDistributed").withArgs(secondReward);
            });

            describe("claim from beneficiary 2", function () {
              beforeEach(async function () {
                beneficiary2Claim = firstReward
                  .add(secondReward)
                  .sub(beneficiary1Claim)
                  .mul(claims[beneficiary2.address])
                  .div(parseEther("100").sub(claims[beneficiary1.address]));
                const proof = merkleTree.getProof(makeElement(beneficiary2.address, claims[beneficiary2.address]));
                result = await this.beneficiaryVaults.connect(beneficiary2).claimReward(
                  0,
                  proof,
                  beneficiary2.address,
                  claims[beneficiary2.address]
                );
              });

              it("emits expected events", async function () {
                expect(result).to.emit(this.beneficiaryVaults, "RewardClaimed")
                  .withArgs(0, beneficiary2.address, beneficiary2Claim);
              });

              it("vault has expected data", async function () {
                const currentBalance = firstReward.add(secondReward).sub(beneficiary1Claim).sub(beneficiary2Claim);
                const unclaimedShare = parseEther("100").sub(claims[beneficiary1.address]).sub(claims[beneficiary2.address]);
                const vaultData = await this.beneficiaryVaults.getVault(0);
                expect(vaultData.totalAllocated).to.equal(firstReward.add(secondReward));
                expect(vaultData.currentBalance).to.equal(currentBalance);
                expect(vaultData.unclaimedShare).to.equal(unclaimedShare);
                expect(await this.beneficiaryVaults.hasClaimed(0, beneficiary2.address)).to.be.true;
              });

              it("has expected contract balance", async function () {
                const currentBalance = firstReward.add(secondReward).sub(beneficiary1Claim).sub(beneficiary2Claim);
                expect(await this.mockPop.balanceOf(this.beneficiaryVaults.address)).to.equal(currentBalance);
              });

              it("contract has expected vaulted balance", async function () {
                const currentBalance = firstReward.sub(beneficiary1Claim).add(secondReward).sub(beneficiary2Claim);
                expect(await this.beneficiaryVaults.totalVaultedBalance()).to.equal(currentBalance);
              });
            });

            describe("closes vault 0 after end time", function () {
              beforeEach(async function () {
                ethers.provider.send("evm_increaseTime", [endTime - Math.floor(Date.now() / 1000)]);
                ethers.provider.send("evm_mine");
                result = await this.beneficiaryVaults.closeVault(0);
              });

              it("emits a VaultClosed event", async function () {
                expect(result).to.emit(this.beneficiaryVaults, "VaultClosed").withArgs(0);
              });

              it("has expected contract balance", async function () {
                expect(
                  await this.mockPop.balanceOf(this.beneficiaryVaults.address)
                ).to.equal(firstReward.add(secondReward).sub(beneficiary1Claim));
              });

              it("contract has expected vaulted balance", async function () {
                expect(await this.beneficiaryVaults.totalVaultedBalance()).to.equal(0);
              });

              it("vault has expected data", async function () {
                const vaultData = await this.beneficiaryVaults.getVault(0);
                expect(vaultData.totalAllocated).to.equal(firstReward.add(secondReward));
                expect(vaultData.currentBalance).to.equal(0);
              });
            });

            describe("initialize and open vault 1", function () {
              beforeEach(async function () {
                currentTime = (await provider.getBlock("latest")).timestamp;
                endTime = currentTime + 11111;
                await this.beneficiaryVaults.initializeVault(1, endTime, merkleRoot);
                await this.beneficiaryVaults.openVault(1);
              });

              it("vault 1 has expected values", async function () {
                const vaultData = await this.beneficiaryVaults.getVault(1);
                expect(vaultData.totalAllocated).to.equal(0);
                expect(vaultData.currentBalance).to.equal(0);
                expect(vaultData.unclaimedShare).to.equal(parseEther("100"));
                expect(vaultData.merkleRoot).to.equal(merkleRoot);
                expect(vaultData.endTime).to.equal(endTime);
                expect(vaultData.status).to.equal(VaultStatus.Open);
                expect(await this.beneficiaryVaults.hasClaimed(1, beneficiary1.address)).to.be.false;
                expect(await this.beneficiaryVaults.hasClaimed(1, beneficiary2.address)).to.be.false;
              });

              describe("close vault 0 and redirect remaining rewards to vault 1", function () {
                beforeEach(async function () {
                  ethers.provider.send("evm_increaseTime", [endTime - Math.floor(Date.now() / 1000)]);
                  ethers.provider.send("evm_mine");
                  await this.beneficiaryVaults.closeVault(0);
                });

                it("contract has expected vaulted balance", async function () {
                  const currentBalance = firstReward.add(secondReward).sub(beneficiary1Claim);
                  expect(await this.beneficiaryVaults.totalVaultedBalance()).to.equal(currentBalance);
                });

                it("vault 1 has expected values", async function () {
                  const currentBalance = firstReward.add(secondReward).sub(beneficiary1Claim);
                  const vaultData = await this.beneficiaryVaults.getVault(1);
                  expect(vaultData.totalAllocated).to.equal(currentBalance);
                  expect(vaultData.currentBalance).to.equal(currentBalance);
                  expect(vaultData.unclaimedShare).to.equal(parseEther("100"));
                  expect(await this.beneficiaryVaults.hasClaimed(1, beneficiary1.address)).to.be.false;
                  expect(await this.beneficiaryVaults.hasClaimed(1, beneficiary2.address)).to.be.false;
                });
              });
            });
          });
        });
      });
    });

    describe("vault 0 is reinitialized", function () {
      beforeEach(async function () {
        result = await this.beneficiaryVaults.initializeVault(0, endTime, merkleRoot);
      });

      it("reverts when closing initialized vault", async function () {
        await expect(this.beneficiaryVaults.closeVault(0)).to.be.revertedWith("Vault must be open");
      });

      it("emits a VaultInitialized event", async function () {
        expect(result).to.emit(this.beneficiaryVaults, "VaultInitialized").withArgs(0, merkleRoot);
      });

      it("vault has expected values", async function () {
        const vaultData = await this.beneficiaryVaults.getVault(0);
        expect(vaultData.totalAllocated).to.equal(0);
        expect(vaultData.currentBalance).to.equal(0);
        expect(vaultData.unclaimedShare).to.equal(parseEther("100"));
        expect(vaultData.merkleRoot).to.equal(merkleRoot);
        expect(vaultData.endTime).to.equal(endTime);
        expect(vaultData.status).to.equal(VaultStatus.Initialized);
        expect(await this.beneficiaryVaults.hasClaimed(0, beneficiary1.address)).to.be.false;
        expect(await this.beneficiaryVaults.hasClaimed(0, beneficiary2.address)).to.be.false;
      });
    });
  });
});
