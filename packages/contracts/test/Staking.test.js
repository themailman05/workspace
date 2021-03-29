const { BigNumber } = require('@ethersproject/bignumber');
const { expect } = require('chai');
const { ethers, waffle } = require('hardhat');
// const { ethers } = require('hardhat');
const { parseEther } = require("ethers/lib/utils");

let stakingContract;
let MockERC20;
let account1;
let erc20;
let Staking;

describe.only('BeneficiaryRegistry', function () {
  let accounts;
  before(async () =>  {
    
    accounts = await ethers.getSigners();
    account1 = accounts[0];
    MockERC20 = await ethers.getContractFactory('MockERC20');
    erc20 = await MockERC20.deploy('TESTPOP', 'TPOP');
    await erc20.mint(account1.address, parseEther('10'));

    const staking = await ethers.getContractFactory('Staking');
    Staking = await staking.deploy(erc20.address);
    await Staking.deployed();
  });

  it('Should allow user to stake their whole balance', async function () {


    // const toNumber = BigNumber.from(result).toNumber();

    const currentBalance = await erc20.balanceOf(account1.address);
    console.log(currentBalance);

    erc20.connect(account1).approve(Staking.address, parseEther('1'));
    const result = await Staking.connect(account1).stake(parseEther('1'), 604800);

    expect(await erc20.balanceOf(Staking.address)).to.equal(parseEther('1'));
    //  

    // const account1Connected = await stakingContract.connect(account1).stake(3, 666666);
    // console.log(account1Connected)

  });

  // it('Should not allow an unauthorized address to addd a beneficiary to the registry', async function () {
  //   const unauthed = (await ethers.getSigners())[1];
  //   const unauthedRegistry = contract.connect(unauthed);
  //   await expect(
  //     unauthedRegistry.addBeneficiary(
  //       '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
  //       ethers.utils.formatBytes32String('testCid'),
  //     ),
  //   ).to.be.revertedWith('!governance');
  // });

  // it('Should revoke beneficiaries', async function () {
  //   await contract.revokeBeneficiary(
  //     '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
  //   )
  //   expect(
  //     await contract.beneficiaryExists(
  //       '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
  //     ),
  //   ).to.equal(false);
  // });

  // it('Should get a beneficiary by address', async function () {
  //   await contract.addBeneficiary(
  //     '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
  //     ethers.utils.formatBytes32String('testCid')
  //   )
  //   expect(
  //     ethers.utils.parseBytes32String(await contract.getBeneficiary(
  //       '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
  //     )),
  //   ).to.equal('testCid');
  // });

  // it('Should get a beneficiary by address (public)', async function () {
  //   const unauthed = (await ethers.getSigners())[1];
  //   const unauthedRegistry = contract.connect(unauthed);

  //   expect(
  //     ethers.utils.parseBytes32String(await unauthedRegistry.getBeneficiary(
  //       '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
  //     )),
  //   ).to.equal('testCid');

  // });

});
