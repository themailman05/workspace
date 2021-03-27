const { parseEther } = require("@ethersproject/units");
const { expect } = require("chai");
const { waffle, ethers } = require("hardhat");
const provider = waffle.provider;

describe('PrivateSale', function () {
  let owner, participant
  beforeEach(async function () {
    [owner, treasury, participant1, participant2] = await ethers.getSigners();

    let MockERC20 = await ethers.getContractFactory("MockERC20");
    this.mockPop = await MockERC20.deploy("TestPOP", "TPOP");
    await this.mockPop.mint(owner.address, parseEther("1000"));

    this.mockUsdc = await MockERC20.deploy("TestUSDC", "TUSDC");
    await this.mockPop.mint(participant1.address, parseEther("5000"));
    await this.mockPop.mint(participant2.address, parseEther("5000"));

    let MockTokenManager = await ethers.getContractFactory("MockTokenManager");
    this.mockTokenManager = await MockTokenManager.deploy();

    let PrivateSale = await ethers.getContractFactory("PrivateSale");
    this.privateSale = await PrivateSale.deploy(
      this.mockTokenManager.address,
      this.mockUsdc.address,
      this.mockPop.address,
      treasury.address,
      parseEther("7500000")
    );
    await this.privateSale.deployed();
  });

  it("should be constructed with expected values", async function () {
    expect(await this.privateSale.pop()).to.equal(this.mockPop.address);
  });
});
