import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { BigNumber } from "@ethersproject/bignumber";
import { Region } from "../typechain";

let stakingFund: BigNumber;

let owner: SignerWithAddress,
  rewarder: SignerWithAddress,
  nonOwner: SignerWithAddress;

let contract:Region;

describe("Region", function () {
  beforeEach(async function () {
    [owner, rewarder, nonOwner] = await ethers.getSigners();
    const regionFactory = await ethers.getContractFactory("Region");
    contract = await (await regionFactory.deploy()).deployed();
  });
  it("works", async function(){
  })
});
