const { expect } = require('chai');
const { parseEther } = require("ethers/lib/utils");

let contract;

describe('GrantElections', function () {

    before(async function () {
        [owner, beneficiary, nonOwner] = await ethers.getSigners();

        MockERC20 = await ethers.getContractFactory("MockERC20");
        this.mockPop = await MockERC20.deploy("TestPOP", "TPOP");
        await this.mockPop.mint(owner.address, parseEther("10"));
    });

    beforeEach(async function () {
        const Staking = await ethers.getContractFactory('GrantElections');
        this.contract = await Staking.deploy(this.mockPop.address, this.mockPop.address);
        await this.contract.deployed();
    });

    describe("vote", function () {
        it("should require voice credits", async function () {
            await expect(
                this.contract.vote([], [], 0)
            ).to.be.revertedWith("Voice credits are required");
        });

        it("should require beneficiaries", async function () {
            await expect(
                this.contract.vote([], [1], 0)
            ).to.be.revertedWith("Beneficiaries are required");
        });

        it("should require election open for voting", async function () {
            await expect(
                this.contract.vote([beneficiary.address], [1], 0)
            ).to.be.revertedWith("Election not open for voting");
        });
    });
});