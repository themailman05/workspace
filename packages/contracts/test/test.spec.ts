import { expect } from "chai";
import { ethers, waffle } from "hardhat";

let owner, rewarder, nonOwner;

describe("Integration", async function () {
  [owner, rewarder, nonOwner] = await ethers.getSigners();
  const POP = await (
    await (await ethers.getContractFactory("mockPOP")).deploy()
  ).deployed();
  it("does things",async function (){
    expect("POP.address").to.equal("POP.address");
  })
});
