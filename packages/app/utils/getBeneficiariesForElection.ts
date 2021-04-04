export default function getBeneficiariesForElection(beneficiaries, awardees) {
  const selectedBeneficiaries = beneficiaries.filter((beneficiary) =>
    awardees.includes(beneficiary.address),
  );
  console.log('selectedBeneficiaries', selectedBeneficiaries);
  return selectedBeneficiaries;
}
