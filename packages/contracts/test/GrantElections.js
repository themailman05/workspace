const { expect } = require('chai');
const { parseEther } = require("ethers/lib/utils");

let contract;

describe('GrantElections', function () {

    before(async function () {
        [owner, rewarder, nonOwner] = await ethers.getSigners();

        MockERC20 = await ethers.getContractFactory("MockERC20");
        this.mockPop = await MockERC20.deploy("TestPOP", "TPOP");
        await this.mockPop.mint(owner.address, parseEther("10"));

        const Staking = await ethers.getContractFactory('Staking');
        this.stakingContract = await Staking.deploy(this.mockPop.address);
        await this.stakingContract.deployed();

        const BeneficiaryRegistry = await ethers.getContractFactory("BeneficiaryRegistry");
        this.beneficiaryRegistry = await BeneficiaryRegistry.deploy(); //issue without address?
        await this.beneficiaryRegistry.deployed();

    });

    beforeEach(async function () {
        const Staking = await ethers.getContractFactory('GrantElections');
        this.contract = await Staking.deploy(this.stakingContract.address, this.beneficiaryRegistry.address);
        await this.contract.deployed();
    });

    describe("vote", function () {
        it("should require election on voting process", async function () {
            await expect(
                this.contract.vote([], [], 0)
            ).to.be.revertedWith("Election not open for voting");
        });
    });
});