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

  it("Should not allow an unauthorized address to addd a beneficiary to the registry", async function () {
    const unauthedRegistry = contract.connect(unauthed);
    await expect(
      unauthedRegistry.addBeneficiary(
        "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
        ethers.utils.formatBytes32String("testCid")
      )
    ).to.be.revertedWith("!governance");
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

  it("Cannot nominate new owner as non-owner", async function () {
    await expect(
      contract.connect(unauthed).nominateNewOwner(unauthed.address)
    ).to.be.revertedWith("Only the contract owner may perform this action");
  });
});
