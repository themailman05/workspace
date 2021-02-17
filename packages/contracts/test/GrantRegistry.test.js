const { expect } = require('chai');

let beneficiaryRegistryContract;
let grantRegistryContract;

const GRANT_TERM_MONTH = 1;
const GRANT_TERM_QUARTER = 2;
const GRANT_TERM_YEAR = 3;

describe('GrantRegistry', function () {
  before(async function () {
    const BeneficiaryRegistry = await ethers.getContractFactory(
      'BeneficiaryRegistry',
    );
    const beneficiaryRegistry = await BeneficiaryRegistry.deploy();
    const GrantRegistry = await ethers.getContractFactory('GrantRegistry');
    const grantRegistry = await GrantRegistry.deploy(
      beneficiaryRegistry.address,
    );
    beneficiaryRegistryContract = await beneficiaryRegistry.deployed();
    grantRegistryContract = await grantRegistry.deployed();
  });

  it('Should create a monthly grant with a registered beneficiary', async function () {
    await beneficiaryRegistryContract.addBeneficiary(
      '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
      ethers.utils.formatBytes32String('testCid'),
    );

    await grantRegistryContract.createGrant(
      GRANT_TERM_QUARTER,
      ['0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266'],
      [1], // shares
    );
    expect(
      (await grantRegistryContract.getActiveGrant(GRANT_TERM_QUARTER)).length,
    ).to.equal(5);

    expect(
      (await grantRegistryContract.getActiveAwardees(GRANT_TERM_QUARTER))[0],
    ).to.equal('0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266');
  });
});
