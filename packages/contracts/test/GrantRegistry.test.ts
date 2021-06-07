import { expect } from "chai";
import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { BeneficiaryRegistry, GrantRegistry} from "../typechain";

let beneficiaryRegistry:BeneficiaryRegistry;
let grantRegistry:GrantRegistry;
let owner: SignerWithAddress,
  nonOwner: SignerWithAddress;
const GRANT_TERM = { MONTH: 0, QUARTER: 1, YEAR: 2 };

describe("GrantRegistry", function () {
  beforeEach(async function () {
    [owner, nonOwner] = await ethers.getSigners();
    beneficiaryRegistry = await (await (await ethers.getContractFactory(
      "BeneficiaryRegistry"
    )).deploy()).deployed() as BeneficiaryRegistry;
    grantRegistry = await (await (await ethers.getContractFactory("GrantRegistry")).deploy(
      beneficiaryRegistry.address
    )).deployed() as GrantRegistry;
  });

  it("Should create a monthly grant with a registered beneficiary", async function () {
    await beneficiaryRegistry.addBeneficiary(
      "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
      ethers.utils.formatBytes32String("testCid")
    );

    await grantRegistry.createGrant(
      GRANT_TERM.QUARTER,
      ["0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"],
      [1] // shares
    );
    expect(
      (await grantRegistry.getActiveGrant(GRANT_TERM.QUARTER)).length
    ).to.equal(5);

    expect(
      (await grantRegistry.getActiveAwardees(GRANT_TERM.QUARTER))[0]
    ).to.equal("0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266");
  });

  it("Cannot nominate new owner as non-owner", async function () {
    await expect(
      grantRegistry.connect(nonOwner).nominateNewGovernance(nonOwner.address)
    ).to.be.revertedWith("Only the contract governance may perform this action");
  });
});
