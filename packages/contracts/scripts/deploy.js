async function main() {
  // We get the contract to deploy
  const [deployer] = await ethers.getSigners();
  console.log("Deployer", deployer.address);

  const BeneficiaryRegistry = await ethers.getContractFactory(
    "BeneficiaryRegistry"
  );
  const beneficiaryRegistry = await BeneficiaryRegistry.deploy();
  await beneficiaryRegistry.deployed();

  console.log("BeneficiaryRegistry deployed to:", beneficiaryRegistry.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
``;
