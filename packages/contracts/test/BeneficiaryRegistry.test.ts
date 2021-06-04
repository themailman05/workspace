import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { ethers } from "hardhat";
import { BeneficiaryRegistry } from "../typechain";

let owner: SignerWithAddress,
  unauthed: SignerWithAddress,
  beneficiary: SignerWithAddress;
let registry: BeneficiaryRegistry;

describe("BeneficiaryRegistry", function () {
  beforeEach(async function () {
    [owner, unauthed, beneficiary] = await ethers.getSigners();
    registry = await (
      await (await ethers.getContractFactory("BeneficiaryRegistry")).deploy()
    ).deployed();
  });

  it("Should add a beneficiary to the registry", async function () {
    await registry.addBeneficiary(
      beneficiary.address,
      ethers.utils.formatBytes32String("testCid")
    );
    expect(await registry.beneficiaryExists(beneficiary.address)).to.equal(
      true
    );
  });

  it("Should not allow an unauthorized address to add a beneficiary to the registry", async function () {
    await expect(
      registry
        .connect(unauthed)
        .addBeneficiary(
          beneficiary.address,
          ethers.utils.formatBytes32String("testCid")
        )
    ).to.be.revertedWith(
      "Only the contract governance may perform this action"
    );
  });

  it("Should not allow an unauthorized address to revoke a beneficiary", async function () {
    await expect(
      registry.connect(unauthed).revokeBeneficiary(beneficiary.address)
    ).to.be.revertedWith("Only the contract council may perform this action");
  });

  it("Should revoke beneficiaries", async function () {
    await registry.addBeneficiary(
      beneficiary.address,
      ethers.utils.formatBytes32String("testCid")
    );
    await registry.connect(owner).revokeBeneficiary(beneficiary.address);
    expect(await registry.beneficiaryExists(beneficiary.address)).to.equal(
      false
    );
  });

  it("Should get a beneficiary by address", async function () {
    await registry.addBeneficiary(
      beneficiary.address,
      ethers.utils.formatBytes32String("testCid")
    );
    expect(
      ethers.utils.parseBytes32String(
        await registry.getBeneficiary(beneficiary.address)
      )
    ).to.equal("testCid");
  });

  it("Should get a beneficiary by address (public)", async function () {
    await registry.addBeneficiary(
      beneficiary.address,
      ethers.utils.formatBytes32String("testCid")
    );
    expect(
      ethers.utils.parseBytes32String(
        await registry.connect(unauthed).getBeneficiary(beneficiary.address)
      )
    ).to.equal("testCid");
  });

  it("Cannot nominate new governance as non-governance", async function () {
    await expect(
      registry.connect(unauthed).nominateNewGovernance(unauthed.address)
    ).to.be.revertedWith(
      "Only the contract governance may perform this action"
    );
  });

  it("Cannot nominate new council as non-council", async function () {
    await expect(
      registry.connect(unauthed).nominateNewCouncil(unauthed.address)
    ).to.be.revertedWith("Only the contract council may perform this action");
  });
});
