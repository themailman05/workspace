import { expect } from "chai";
import { waffle, ethers } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { BigNumber } from "@ethersproject/bignumber";
import { Rounding } from "../typechain";


let owner: SignerWithAddress,
  rewarder: SignerWithAddress,
  nonOwner: SignerWithAddress;

let contract:Rounding;

describe("Rounding", function () {
  beforeEach(async function () {
    [owner, rewarder, nonOwner] = await ethers.getSigners();
    contract = await (await (await ethers.getContractFactory("Rounding")).deploy()).deployed()
  })

  it("rounds", async function(){
    const resultv1 = await contract.roundV1(1625044349);
    console.log(resultv1.toString())
    const resultv2 = await contract.roundV2(1625044349);
    console.log(resultv2.toString())
    const resultv11 = await contract.roundV1(1625043601);
    console.log(resultv11.toString())
    const resultv21 = await contract.roundV2(1625043601);
    console.log(resultv21.toString())
    const resultv12 = await contract.roundV1(1625047199);
    console.log(resultv12.toString())
    const resultv22 = await contract.roundV2(1625047199);
    console.log(resultv22.toString())
    const resultv13 = await contract.roundV1(1625047200);
    console.log(resultv13.toString())
    const resultv23 = await contract.roundV2(1625047200);
    console.log(resultv23.toString())
    const resultv14 = await contract.roundV1(1625045400);
    console.log(resultv14.toString())
    const resultv24 = await contract.roundV2(1625045400);
    console.log(resultv24.toString())
  })
  it("rounds now", async function(){
    const now = (await waffle.provider.getBlock("latest")).timestamp
    console.log(now.toString())
    const resultv1 = await contract.roundV1(now);
    console.log(resultv1.toString())
    const resultv2 = await contract.roundV2(now);
    console.log(resultv2.toString())
  })
})
    