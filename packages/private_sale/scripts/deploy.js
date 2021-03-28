const { parseEther } = require("ethers/lib/utils");
const { parseFixed } = require("@ethersproject/bignumber");

async function main() {
  const [deployer, treasury, participant1, participant2] = await ethers.getSigners();
  console.log("Deployer", deployer.address);

  let TOKEN_MANAGER_ADDRESS, USDC_ADDRESS, POP_ADDRESS, TREASURY_ADDRESS;
  const DefaultSupply = parseEther("7500000");
  const PrivateSale = await ethers.getContractFactory("PrivateSale");

  if (["mainnet"].includes(hre.network.name)) {
    USDC_ADDRESS = "";
    POP_ADDRESS = "";
    TOKEN_MANAGER_ADDRESS = "";
    TREASURY_ADDRESS = "";
  } else if (["rinkeby", "hardhat"].includes(hre.network.name)) {
    const MockERC20 = await ethers.getContractFactory("MockERC20");
    const popcornUsdc = await MockERC20.deploy("PopcornUSDC", "POPUSDC", 6);
    await popcornUsdc.deployed();
    console.log("PopcornUSDC deployed to:", popcornUsdc.address);

    participant1Usdc = "500000";
    await popcornUsdc.mint(participant1.address, parseFixed(participant1Usdc, 6));
    console.log(`Minted ${participant1Usdc} POPUSDC to ${participant1.address}`);

    participant2Usdc = "1000000";
    await popcornUsdc.mint(participant2.address, parseFixed(participant2Usdc, 6));
    console.log(`Minted ${participant2Usdc} POPUSDC to ${participant2.address}`);

    USDC_ADDRESS = popcornUsdc.address;
    TOKEN_MANAGER_ADDRESS = "0x4b5af91d2489352e365478ca755875965ec5a3ee";
    POP_ADDRESS = "0xcc763df24b9b1d68194ba52e787b6760f04ffd72";
    TREASURY_ADDRESS = treasury.address;
  } else {
    console.error("Unsupported network " + hre.network.name);
    process.exit(1);
  }

  const privateSale = await PrivateSale.deploy(
    TOKEN_MANAGER_ADDRESS,
    POP_ADDRESS,
    USDC_ADDRESS,
    TREASURY_ADDRESS,
    DefaultSupply
  );
  await privateSale.deployed();

  console.log("PrivateSale deployed to:", privateSale.address);

  // Auto add participant for testnet
  if (["rinkeby", "hardhat"].includes(hre.network.name)) {
    await privateSale.allowParticipant(participant1.address, parseFixed(participant1Usdc, 6));
    console.log(`Allowance of $${participant1Usdc} granted for ${participant1.address}`);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
