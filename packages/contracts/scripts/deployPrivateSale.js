const { parseEther } = require("ethers/lib/utils");
const { parseFixed } = require("@ethersproject/bignumber");

async function deployPrivateSale(ethers, hre) {
  const [deployer] = await ethers.getSigners();
  console.log("Deployer", deployer.address);

  this.participants = [
    "0xd3DB1c4E642BD2fC77398a48180925C5bB6462b2",
    "0x910BB5E4D06ce95bd55604DFCdd320DA5f6cA416",
  ];
  this.participantAmounts = ["500000", "750000"];

  const deployMockUSDC = async () => {
    const MockERC20 = await ethers.getContractFactory("MockERC20");
    this.mockUSDC = await MockERC20.deploy("PopcornUSDC", "POPUSDC", 6);
    await this.mockUSDC.deployed();
    console.log("PopcornUSDC deployed to:", this.mockUSDC.address);
    return this.mockUSDC;
  };

  const deployPrivateSale = async ({
    tokenManager,
    pop,
    usdc,
    treasury,
    defaultSupply,
  }) => {
    const PrivateSale = await ethers.getContractFactory("PrivateSale");
    this.privateSale = await PrivateSale.deploy(
      tokenManager,
      pop,
      usdc,
      treasury,
      defaultSupply
    );

    await this.privateSale.deployed();

    console.log("PrivateSale deployed to:", privateSale.address);
    return this.privateSale;
  };

  const mintTokens = async (mockUSDC) => {
    await mockUSDC.mint(
      this.participants[0],
      parseFixed(this.participantAmounts[0], 6)
    );
    console.log(
      `Minted ${this.participantAmounts[0]} POPUSDC to ${this.participants[0]}`
    );

    await mockUSDC.mint(
      this.participants[1],
      parseFixed(this.participantAmounts[1], 6)
    );

    console.log(
      `Minted ${this.participantAmounts[1]} POPUSDC to ${this.participants[1]}`
    );
  };

  const allowParticipants = async (privateSale) => {
    await privateSale.allowParticipant(
      this.participants[0],
      parseFixed(this.participantAmounts[0], 6)
    );

    console.log(
      `Allowance of $${this.participantAmounts[0]} granted for ${this.participants[0]}`
    );

    await privateSale.allowParticipant(
      this.participants[1],
      parseFixed(this.participantAmounts[1], 6)
    );

    console.log(
      `Allowance of $${this.participantAmounts[1]} granted for ${this.participants[1]}`
    );
  };


  if (["mainnet"].includes(hre.network.name)) {
    console.log("deploying private sale on mainnet ...");
    const props = {
      tokenManager: process.env.ADDR_TOKEN_MANAGER,
      pop: process.env.ADDR_POP,
      usdc: process.env.ADDR_USDC,
      treasury: process.env.ADDR_TREASURY,
      defaultSupply: parseEther(process.env.PRIVATE_SALE_DEFAULT_SUPPLY),
    };

    console.log(props);

    await deployPrivateSale(props);

    console.log('deployed private sale contract');

    console.log({ ... props, privateSale: this.privateSale.address});

  } else if (["rinkeby"].includes(hre.network.name)) {
    console.log('deploying mock usdc ...')
    const usdc = await deployMockUSDC();

    console.log('minting tokens ...')
    await mintTokens(usdc);
    
    console.log('deploying private sale ...');
    const props = {
      tokenManager: process.env.ADDR_TOKEN_MANAGER,
      pop: process.env.ADDR_POP,
      usdc: usdc.address,
      treasury: process.env.ADDR_TREASURY,
      defaultSupply: parseEther(process.env.PRIVATE_SALE_DEFAULT_SUPPLY),
    };
    const privateSale = await deployPrivateSale(props);

    await allowParticipants(privateSale);

    console.log ({ ...props, privateSale: this.privateSale.address});

  } else {
    console.error("Unsupported network " + hre.network.name);
    process.exit(1);
  }
}

module.exports = {
  deployPrivateSale,
};
