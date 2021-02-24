const { expect } = require('chai');

describe('RewardsManager', function () {
  let owner, beneficiary1, beneficiary2;

  beforeEach(async function () {
    [owner, beneficiary1, beneficiary2] = await ethers.getSigners();
    let MockERC20 = await ethers.getContractFactory("MockERC20");
    this.pop = await MockERC20.deploy("TestPOP", "TPOP");
    let RewardsManager = await ethers.getContractFactory("RewardsManager");
    this.rewards = await RewardsManager.deploy(this.pop.address);
    rewardsBalance = "10000000000";
    await this.pop.mint(this.rewards.address, rewardsBalance);
  });

  it("should be constructed with POP token", async function () {
    expect(await this.rewards.pop()).to.equal(this.pop.address);
  });

  it("should have expected POP balance", async function () {
    expect(await this.pop.balanceOf(this.rewards.address)).to.equal(rewardsBalance);
  })
});
