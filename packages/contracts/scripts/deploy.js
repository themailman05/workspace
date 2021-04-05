async function main() {
  // We get the contract to deploy
  const accounts = await ethers.getSigners();
  console.log(accounts);
  const deployer = accounts[0].address;
  console.log("deployer", deployer);
  const BeneficiaryRegistry = await ethers.getContractFactory(
    "BeneficiaryRegistry"
  );
  const beneficiaryRegistry = await BeneficiaryRegistry.deploy();

  const GrantRegistry = await ethers.getContractFactory("GrantRegistry");
  const grantRegistry = await GrantRegistry.deploy(beneficiaryRegistry.address);

  console.log("BeneficiaryRegistry deployed to:", beneficiaryRegistry.address);
  console.log("GrantRegistry deployed to:", grantRegistry.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
``;
