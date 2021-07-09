import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { ethers } from "hardhat";
import { Experiment } from "../typechain";

let owner: SignerWithAddress,
  rewarder: SignerWithAddress,
  nonOwner: SignerWithAddress;
let contract: Experiment;

describe("experiment", function () {
  beforeEach(async function () {
    [owner, rewarder, nonOwner] = await ethers.getSigners();

    contract = await (
      await (await ethers.getContractFactory("Experiment")).deploy()
    ).deployed();
  });
  it("deletes items when modulo 1", async function () {
    await contract.deleteItems(1,10);
    await contract.addItem(333)
    const items = await contract.getItems();
    const sample = await contract.getSample();
    console.log(items);
    console.log(sample)
    console.log(await contract.items(19))
    await contract.clearSample()
    console.log(await contract.getSample())
    await contract.deleteItems(1,0);
    console.log(await contract.getItems())
  })

});
