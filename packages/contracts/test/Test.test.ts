import { expect } from "chai";
import { waffle, ethers } from "hardhat";
import { parseEther } from "ethers/lib/utils";
import { DefendedHelper, MockERC20, Staking } from "../typechain";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { BigNumber } from "@ethersproject/bignumber";


let owner:SignerWithAddress
let contract:Test
describe("Test", function () {
  beforeEach(async function () {
    [owner] = await ethers.getSigners();
    const testFactory = await ethers.getContractFactory("Test");
    contract = (await testFactory.deploy()) as Test;
    await contract.deployed();
  });
  it("returns items", async function () {
    const first = await contract.getTest(0)
    console.log(first)
    const sec = await contract.getTest(1)
    console.log(sec)
    const third = await contract.getTest(2)
    console.log(third)

  })
});
