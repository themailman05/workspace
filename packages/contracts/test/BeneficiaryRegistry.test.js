const { expect } = require("chai");

let contract;

describe("BeneficiaryRegistry", function () {
  let owner, unauthed;
  before(async function () {
    [owner, unauthed] = await ethers.getSigners();
    const Registry = await ethers.getContractFactory("BeneficiaryRegistry");
    const registry = await Registry.deploy();
    contract = await registry.deployed();
  });

  it("Should add a beneficiary to the registry", async function () {
    await contract.addBeneficiary(
      "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
      ethers.utils.formatBytes32String("testCid")
    );
    expect(
      await contract.beneficiaryExists(
        "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"
      )
    ).to.equal(true);
  });

  it("Should not allow an unauthorized address to add a beneficiary to the registry", async function () {
    const unauthedRegistry = contract.connect(unauthed);
    await expect(
      unauthedRegistry.addBeneficiary(
        "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
        ethers.utils.formatBytes32String("testCid")
      )
    ).to.be.revertedWith(
      "Only the contract governance may perform this action"
    );
  });

  it("Should not allow an unauthorized address to revoke a beneficiary", async function () {
    const unauthedRegistry = contract.connect(unauthed);
    await expect(
      unauthedRegistry.revokeBeneficiary(
        "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"
      )
    ).to.be.revertedWith(
      "Only the contract council may perform this action"
    );
  });

  it("Should revoke beneficiaries", async function () {
    await contract.revokeBeneficiary(
      "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"
    );
    expect(
      await contract.beneficiaryExists(
        "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"
      )
    ).to.equal(false);
  });

  it("Should get a beneficiary by address", async function () {
    await contract.addBeneficiary(
      "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
      ethers.utils.formatBytes32String("testCid")
    );
    expect(
      ethers.utils.parseBytes32String(
        await contract.getBeneficiary(
          "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"
        )
      )
    ).to.equal("testCid");
  });

  it("Should get a beneficiary by address (public)", async function () {
    const unauthedRegistry = contract.connect(unauthed);

    expect(
      ethers.utils.parseBytes32String(
        await unauthedRegistry.getBeneficiary(
          "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"
        )
      )
    ).to.equal("testCid");
  });

  it("Cannot nominate new governance as non-governance", async function () {
    await expect(
      contract.connect(unauthed).nominateNewGovernance(unauthed.address)
    ).to.be.revertedWith(
      "Only the contract governance may perform this action"
    );
  });

  it("Cannot nominate new council as non-council", async function () {
    await expect(
      contract.connect(unauthed).nominateNewCouncil(unauthed.address)
    ).to.be.revertedWith("Only the contract council may perform this action");
  });
});
