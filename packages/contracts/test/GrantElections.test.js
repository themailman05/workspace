const { expect } = require('chai');
const { parseEther } = require("ethers/lib/utils");

<<<<<<< HEAD

=======
>>>>>>> parent of d08b306... Revert "Register for grant elections if eligible on grants page"
let contract;

describe('GrantElections', function () {
    const GRANT_TERM = { MONTH: 0, QUARTER: 1, YEAR: 2 }
    before(async function () {
        [owner, rewarder, nonOwner, beneficiary] = await ethers.getSigners();

        MockERC20 = await ethers.getContractFactory("MockERC20");
        this.mockPop = await MockERC20.deploy("TestPOP", "TPOP");
        await this.mockPop.mint(owner.address, parseEther("10"));

        const Staking = await ethers.getContractFactory('Staking');
        this.stakingContract = await Staking.deploy(this.mockPop.address);
        await this.stakingContract.deployed();

        const BeneficiaryRegistry = await ethers.getContractFactory("BeneficiaryRegistry");
        this.beneficiaryRegistry = await BeneficiaryRegistry.deploy(); //issue without address?
        await this.beneficiaryRegistry.deployed();

        await this.beneficiaryRegistry.addBeneficiary(
        beneficiary.address,
        ethers.utils.formatBytes32String('Beneficiary Amir')
      ).then(response => console.log(response)).catch(err => console.log(err));

        const GrantElections = await ethers.getContractFactory('GrantElections');
        this.contract = await GrantElections.deploy(this.stakingContract.address, this.beneficiaryRegistry.address);
        await this.contract.deployed();

        // initialise a grant

        const GrantRegistry = await ethers.getContractFactory('GrantRegistry');

        this.grantRegistry = await GrantRegistry.deploy(this.beneficiaryRegistry.address);
        await this.grantRegistry.deployed();

        await this.grantRegistry.createGrant(
            GRANT_TERM.QUARTER,
            [beneficiary.address],
            [1]
        )

    });

    describe("vote", function () {
        it("should require election on voting process", async function () {
            await expect(
                this.contract.vote([], [], 0)
            ).to.be.revertedWith("Election not open for voting");
        });

        it("should initialise ", async function () {
            const initialised = await this.contract.initialize(1);
            console.log(initialised);
        });
    });
});