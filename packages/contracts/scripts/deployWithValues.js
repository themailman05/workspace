const GRANT_TERM = { MONTH: 0, QUARTER: 1, YEAR: 2 };
// This script creates two beneficiaries and one quarterly grant that they are both eligible for. Run this
// Run this instead of the normal deploy.js script
async function main() {
  // We get the contract to deploy
  const accounts = await ethers.getSigners();
  const deployer = accounts[0].address;
  console.log("deployer", deployer);
  const BeneficiaryRegistry = await ethers.getContractFactory(
    "BeneficiaryRegistry"
  );
  const beneficiaryRegistry = await BeneficiaryRegistry.deploy(); //issue without address?
  const BeneficiaryRegistercontract = await beneficiaryRegistry.deployed();

  let firstBeneficiaryAddress = "0x22f5413C075Ccd56D575A54763831C4c27A37Bdb";
  let secondBeneficiaryAddress = "0x849664E1F06693103c4852c232034Ae7A8C42736";
  await BeneficiaryRegistercontract.addBeneficiary(
    firstBeneficiaryAddress,
    ethers.utils.formatBytes32String("Beneficiary Amir")
  )
    .then((response) => console.log(response))
    .catch((err) => console.log(err));

  await BeneficiaryRegistercontract.addBeneficiary(
    secondBeneficiaryAddress,
    ethers.utils.formatBytes32String("Beneficiary Leon")
  )
    .then((response) => console.log(response))
    .catch((err) => console.log(err));

  const beneficiaryExists = await BeneficiaryRegistercontract.beneficiaryExists(
    firstBeneficiaryAddress
  );
  console.log("beneficiary exists:", beneficiaryExists);

  const GrantRegistry = await ethers.getContractFactory("GrantRegistry");
  const grantRegistry = await GrantRegistry.deploy(beneficiaryRegistry.address);
  const GrantRegistryContract = await grantRegistry.deployed();

  await GrantRegistryContract.createGrant(
    GRANT_TERM.QUARTER,
    [firstBeneficiaryAddress, secondBeneficiaryAddress],
    [1, 2]
  );

  const activeAwardees = await GrantRegistryContract.getActiveAwardees(
    GRANT_TERM.QUARTER
  );
  console.log("active awardees: ", activeAwardees);

  console.log("BeneficiaryRegistry deployed to:", beneficiaryRegistry.address);
  console.log("GrantRegistry deployed to:", grantRegistry.address);

  return {
    beneficiaryRegistryAddress: beneficiaryRegistry.address,
    grantRegistryAddress: grantRegistry.address,
  };
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
