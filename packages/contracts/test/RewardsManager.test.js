const { expect } = require("chai");
const { waffle } = require("hardhat");
const { parseEther } = require("ethers/lib/utils");
const IUniswapV2Factory = require("../artifacts/@uniswap/v2-core/contracts/interfaces/IUniswapV2Factory.sol/IUniswapV2Factory.json");
const IUniswapV2Router02 = require("../artifacts/@uniswap/v2-periphery/contracts/interfaces/IUniswapV2Router02.sol/IUniswapV2Router02.json");

describe("RewardsManager", function () {
  const RewardSplits = {
    Staking: parseEther("32"),
    Treasury: parseEther("32"),
    Insurance: parseEther("2"),
    BeneficiaryVaults: parseEther("34"),
  };
  const OwnerInitial = parseEther("10");
  const RewarderInitial = parseEther("5");
  let MockERC20,
    Staking,
    Treasury,
    Insurance,
    BeneficiaryVaults,
    RewardsManager;
  let owner, rewarder, nonOwner;

  beforeEach(async function () {
    [owner, rewarder, nonOwner] = await ethers.getSigners();

    MockERC20 = await ethers.getContractFactory("MockERC20");
    this.mockPop = await MockERC20.deploy("TestPOP", "TPOP");
    await this.mockPop.mint(owner.address, OwnerInitial);
    await this.mockPop.mint(rewarder.address, RewarderInitial);

    this.mockAlt = await MockERC20.deploy("TestALT", "TALT");
    await this.mockAlt.mint(owner.address, OwnerInitial);

    Treasury = await ethers.getContractFactory("MockTreasury");
    this.mockTreasury = await waffle.deployMockContract(
      owner,
      Treasury.interface.format()
    );

    Insurance = await ethers.getContractFactory("MockInsurance");
    this.mockInsurance = await waffle.deployMockContract(
      owner,
      Insurance.interface.format()
    );

    Staking = await ethers.getContractFactory("MockStaking");
    this.mockStaking = await waffle.deployMockContract(
      owner,
      Staking.interface.format()
    );

    BeneficiaryVaults = await ethers.getContractFactory("BeneficiaryVaults");
    this.mockBeneficiaryVaults = await waffle.deployMockContract(
      owner,
      BeneficiaryVaults.interface.format()
    );

    this.mockUniswapV2Factory = await waffle.deployMockContract(
      owner,
      IUniswapV2Factory.abi
    );
    this.mockUniswapV2Router = await waffle.deployMockContract(
      owner,
      IUniswapV2Router02.abi
    );
    await this.mockUniswapV2Router.mock.factory.returns(
      this.mockUniswapV2Factory.address
    );

    RewardsManager = await ethers.getContractFactory("RewardsManager");
    this.rewardsManager = await RewardsManager.deploy(
      this.mockPop.address,
      this.mockStaking.address,
      this.mockTreasury.address,
      this.mockInsurance.address,
      this.mockBeneficiaryVaults.address,
      this.mockUniswapV2Router.address
    );
    await this.rewardsManager.deployed();
  });

  it("should be constructed with correct addresses", async function () {
    expect(await this.rewardsManager.POP()).to.equal(this.mockPop.address);
    expect(await this.rewardsManager.staking()).to.equal(
      this.mockStaking.address
    );
    expect(await this.rewardsManager.treasury()).to.equal(
      this.mockTreasury.address
    );
    expect(await this.rewardsManager.insurance()).to.equal(
      this.mockInsurance.address
    );
    expect(await this.rewardsManager.beneficiaryVaults()).to.equal(
      this.mockBeneficiaryVaults.address
    );
    expect(await this.rewardsManager.uniswapV2Router()).to.equal(
      this.mockUniswapV2Router.address
    );
  });

  it("should be initialized with correct splits", async function () {
    expect(await this.rewardsManager.rewardSplits(0)).to.equal(
      parseEther("32")
    );
    expect(await this.rewardsManager.rewardSplits(1)).to.equal(
      parseEther("32")
    );
    expect(await this.rewardsManager.rewardSplits(2)).to.equal(parseEther("2"));
    expect(await this.rewardsManager.rewardSplits(3)).to.equal(
      parseEther("34")
    );
  });


  it("reverts when setting reward splits as non-owner", async function () {
    await expect(
      this.rewardsManager.connect(nonOwner).setRewardSplits([20, 18, 2, 60])
    ).to.be.revertedWith("Only the contract owner may perform this action");
  });

  it("reverts when setting invalid reward splits", async function () {
    await expect(
      this.rewardsManager.setRewardSplits([19, 19, 2, 60])
    ).to.be.revertedWith("Invalid split");
  });

  it("reverts when setting invalid total reward splits", async function () {
    await expect(
      this.rewardsManager.setRewardSplits([
        parseEther("20.000000001"),
        parseEther("18"),
        parseEther("2"),
        parseEther("60"),
      ])
    ).to.be.revertedWith("Invalid split total");
  });

  it("reverts when setting out of bounds reward splits", async function () {
    await expect(
      this.rewardsManager.setRewardSplits([
        parseEther("9"),
        parseEther("9"),
        parseEther("2"),
        parseEther("80"),
      ])
    ).to.be.revertedWith("Invalid split");
  });

  it("cannot nominate new owner as non-owner", async function () {
    await expect(
      this.rewardsManager.connect(nonOwner).nominateNewOwner(nonOwner.address)
    ).to.be.revertedWith("Only the contract owner may perform this action");
  });

  describe("reward splits are set", function () {
    beforeEach(async function () {
      newRewardSplits = [
        parseEther("20"),
        parseEther("18"),
        parseEther("2"),
        parseEther("60"),
      ];
      result = await this.rewardsManager.setRewardSplits(newRewardSplits);
    });

    it("should emit RewardSplitsUpdated event", async function () {
      expect(result)
        .to.emit(this.rewardsManager, "RewardSplitsUpdated")
        .withArgs(newRewardSplits);
    });

    it("should have updated correct splits", async function () {
      expect(await this.rewardsManager.rewardSplits(0)).to.equal(
        parseEther("20")
      );
      expect(await this.rewardsManager.rewardSplits(1)).to.equal(
        parseEther("18")
      );
      expect(await this.rewardsManager.rewardSplits(2)).to.equal(
        parseEther("2")
      );
      expect(await this.rewardsManager.rewardSplits(3)).to.equal(
        parseEther("60")
      );
    });
  });

  it("should revert setting to same Staking", async function () {
    await expect(
      this.rewardsManager.setStaking(this.mockStaking.address)
    ).to.be.revertedWith("Same Staking");
  });

  it("should revert setting to same Treasury", async function () {
    await expect(
      this.rewardsManager.setTreasury(this.mockTreasury.address)
    ).to.be.revertedWith("Same Treasury");
  });

  it("should revert setting to same Insurance", async function () {
    await expect(
      this.rewardsManager.setInsurance(this.mockInsurance.address)
    ).to.be.revertedWith("Same Insurance");
  });

  it("should revert setting to same BeneficiaryVaults", async function () {
    await expect(
      this.rewardsManager.setBeneficiaryVaults(
        this.mockBeneficiaryVaults.address
      )
    ).to.be.revertedWith("Same BeneficiaryVaults");
  });

  describe("sets new dependent contracts", function () {
    it("sets new Staking", async function () {
      const newStaking = await waffle.deployMockContract(
        owner,
        Staking.interface.format()
      );
      result = await this.rewardsManager.setStaking(newStaking.address);
      expect(await this.rewardsManager.staking()).to.equal(newStaking.address);
      expect(result)
        .to.emit(this.rewardsManager, "StakingChanged")
        .withArgs(this.mockStaking.address, newStaking.address);
    });

    it("sets new Insurance", async function () {
      const newInsurance = await waffle.deployMockContract(
        owner,
        Insurance.interface.format()
      );
      result = await this.rewardsManager.setInsurance(newInsurance.address);
      expect(await this.rewardsManager.insurance()).to.equal(
        newInsurance.address
      );
      expect(result)
        .to.emit(this.rewardsManager, "InsuranceChanged")
        .withArgs(this.mockInsurance.address, newInsurance.address);
    });

    it("sets new Treasury", async function () {
      const newTreasury = await waffle.deployMockContract(
        owner,
        Treasury.interface.format()
      );
      result = await this.rewardsManager.setTreasury(newTreasury.address);
      expect(await this.rewardsManager.treasury()).to.equal(
        newTreasury.address
      );
      expect(result)
        .to.emit(this.rewardsManager, "TreasuryChanged")
        .withArgs(this.mockTreasury.address, newTreasury.address);
    });

    it("sets new BeneficiaryVaults", async function () {
      const newBeneficiaryVaults = await waffle.deployMockContract(
        owner,
        BeneficiaryVaults.interface.format()
      );
      result = await this.rewardsManager.setBeneficiaryVaults(
        newBeneficiaryVaults.address
      );
      expect(await this.rewardsManager.beneficiaryVaults()).to.equal(
        newBeneficiaryVaults.address
      );
      expect(result)
        .to.emit(this.rewardsManager, "BeneficiaryVaultsChanged")
        .withArgs(
          this.mockBeneficiaryVaults.address,
          newBeneficiaryVaults.address
        );
    });
  });

  describe("send rewards", function () {
    beforeEach(async function () {
      firstReward = parseEther("0.1");
      stakingReward = firstReward
        .mul(RewardSplits.Staking)
        .div(parseEther("100"));
      treasuryReward = firstReward
        .mul(RewardSplits.Treasury)
        .div(parseEther("100"));
      insuranceReward = firstReward
        .mul(RewardSplits.Insurance)
        .div(parseEther("100"));
      beneficiaryVaultsReward = firstReward
        .mul(RewardSplits.BeneficiaryVaults)
        .div(parseEther("100"));
      await this.mockPop
        .connect(rewarder)
        .transfer(this.rewardsManager.address, firstReward);
    });

    it("contract has expected balance", async function () {
      expect(
        await this.mockPop.balanceOf(this.rewardsManager.address)
      ).to.equal(firstReward);
    });

    describe("rewards are distributed", function () {
      beforeEach(async function () {
        result = await this.rewardsManager.distributeRewards();
      });

      it("emits expected events", async function () {
        expect(result)
          .to.emit(this.rewardsManager, "StakingDeposited")
          .withArgs(this.mockStaking.address, stakingReward);
        expect(result)
          .to.emit(this.rewardsManager, "TreasuryDeposited")
          .withArgs(this.mockTreasury.address, treasuryReward);
        expect(result)
          .to.emit(this.rewardsManager, "InsuranceDeposited")
          .withArgs(this.mockInsurance.address, insuranceReward);
        expect(result)
          .to.emit(this.rewardsManager, "BeneficiaryVaultsDeposited")
          .withArgs(
            this.mockBeneficiaryVaults.address,
            beneficiaryVaultsReward
          );
        expect(result)
          .to.emit(this.rewardsManager, "RewardsDistributed")
          .withArgs(firstReward);
      });

      it("has expected contract balance", async function () {
        expect(
          await this.mockPop.balanceOf(this.rewardsManager.address)
        ).to.equal(0);
      });

      it("Staking has expected balance", async function () {
        expect(await this.mockPop.balanceOf(this.mockStaking.address)).to.equal(
          stakingReward
        );
      });

      it("Treasury has expected balance", async function () {
        expect(
          await this.mockPop.balanceOf(this.mockTreasury.address)
        ).to.equal(treasuryReward);
      });

      it("Insurance has expected balance", async function () {
        expect(
          await this.mockPop.balanceOf(this.mockInsurance.address)
        ).to.equal(insuranceReward);
      });

      it("BeneficiaryVaults has expected balance", async function () {
        expect(
          await this.mockPop.balanceOf(this.mockBeneficiaryVaults.address)
        ).to.equal(beneficiaryVaultsReward);
      });

      describe("send more rewards", function () {
        beforeEach(async function () {
          secondReward = parseEther("0.05");
          await this.mockPop
            .connect(rewarder)
            .transfer(this.rewardsManager.address, secondReward);
        });

        it("has expected contract balance", async function () {
          expect(
            await this.mockPop.balanceOf(this.rewardsManager.address)
          ).to.equal(secondReward);
        });

        describe("new rewards are distributed", function () {
          beforeEach(async function () {
            stakingSecondReward = secondReward
              .mul(RewardSplits.Staking)
              .div(parseEther("100"));
            treasurySecondReward = secondReward
              .mul(RewardSplits.Treasury)
              .div(parseEther("100"));
            insuranceSecondReward = secondReward
              .mul(RewardSplits.Insurance)
              .div(parseEther("100"));
            beneficiaryVaultsSecondReward = secondReward
              .mul(RewardSplits.BeneficiaryVaults)
              .div(parseEther("100"));
            result = await this.rewardsManager.distributeRewards();
          });

          it("emits expected events", async function () {
            expect(result)
              .to.emit(this.rewardsManager, "StakingDeposited")
              .withArgs(this.mockStaking.address, stakingSecondReward);
            expect(result)
              .to.emit(this.rewardsManager, "TreasuryDeposited")
              .withArgs(this.mockTreasury.address, treasurySecondReward);
            expect(result)
              .to.emit(this.rewardsManager, "InsuranceDeposited")
              .withArgs(this.mockInsurance.address, insuranceSecondReward);
            expect(result)
              .to.emit(this.rewardsManager, "BeneficiaryVaultsDeposited")
              .withArgs(
                this.mockBeneficiaryVaults.address,
                beneficiaryVaultsSecondReward
              );
            expect(result)
              .to.emit(this.rewardsManager, "RewardsDistributed")
              .withArgs(secondReward);
          });

          it("has expected contract balance", async function () {
            expect(
              await this.mockPop.balanceOf(this.rewardsManager.address)
            ).to.equal(0);
          });

          it("Staking has expected balance", async function () {
            expect(
              await this.mockPop.balanceOf(this.mockStaking.address)
            ).to.equal(stakingReward.add(stakingSecondReward));
          });

          it("Treasury has expected balance", async function () {
            expect(
              await this.mockPop.balanceOf(this.mockTreasury.address)
            ).to.equal(treasuryReward.add(treasurySecondReward));
          });

          it("Insurance has expected balance", async function () {
            expect(
              await this.mockPop.balanceOf(this.mockInsurance.address)
            ).to.equal(insuranceReward.add(insuranceSecondReward));
          });

          it("BeneficiaryVaults has expected balance", async function () {
            expect(
              await this.mockPop.balanceOf(this.mockBeneficiaryVaults.address)
            ).to.equal(
              beneficiaryVaultsReward.add(beneficiaryVaultsSecondReward)
            );
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
        expect(
          await this.mockAlt.balanceOf(this.rewardsManager.address)
        ).to.equal(altAmount);
      });

      it("reverts with short path", async function () {
        await expect(
          this.rewardsManager.swapTokenForRewards([this.mockAlt.address], 100)
        ).to.be.revertedWith("Invalid swap path");
      });

      it("reverts with invalid amount", async function () {
        await expect(
          this.rewardsManager.swapTokenForRewards(
            [this.mockAlt.address, this.mockPop.address],
            0
          )
        ).to.be.revertedWith("Invalid amount");
      });

      it("reverts with invalid path", async function () {
        await expect(
          this.rewardsManager.swapTokenForRewards(
            [this.mockAlt.address, this.mockAlt.address],
            100
          )
        ).to.be.revertedWith("POP must be last in path");
      });

      describe("execute token swap for pop rewards", function () {
        beforeEach(async function () {
          swapReward = parseEther("0.24");
          await this.mockUniswapV2Router.mock.swapExactTokensForTokens.returns([
            altAmount,
            swapReward,
          ]);
          await this.mockPop.transfer(this.rewardsManager.address, swapReward); //simulate swap
          result = await this.rewardsManager.swapTokenForRewards(
            [this.mockAlt.address, this.mockPop.address],
            swapReward
          );
        });

        it("emits expected events", async function () {
          expect(result)
            .to.emit(this.rewardsManager, "TokenSwapped")
            .withArgs(this.mockAlt.address, altAmount, swapReward);
        });

        it("has expected contract balance", async function () {
          expect(
            await this.mockPop.balanceOf(this.rewardsManager.address)
          ).to.equal(firstReward.add(swapReward));
        });
      });
    });
  });
});
