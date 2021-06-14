import BeneficiaryPage from 'components/BeneficiaryPage';
import { ContractsContext } from 'context/Web3/contracts';
import { useRouter } from 'next/router';
import { useContext, useEffect, useState } from 'react';
import { getIpfsHashFromBytes32 } from '@popcorn/utils/ipfsHashManipulation';
import { BeneficiaryCardProps } from 'interfaces/beneficiaries';

export default function BeneficiaryPageWrapper(): JSX.Element {
  const { contracts } = useContext(ContractsContext);
  const [beneficiary, setBeneficiary] = useState<BeneficiaryCardProps>();

  async function getBeneficiary() {
    let search = window.location.search;
    let params = new URLSearchParams(search);
    let beneficiaryAddresses = params.get('address');

    const ipfsHash = await contracts.beneficiary.getBeneficiary(
      beneficiaryAddresses,
    );
    const url =
      'https://gateway.pinata.cloud/ipfs/' + getIpfsHashFromBytes32(ipfsHash);
    const beneficiaryData = await fetch(url).then((response) =>
      response.json(),
    );
    console.log({ beneficiaryData });
    // const benefificaryCardData: BeneficiaryCardProps = {
    //   name: beneficiaryData.name,
    //   missionStatement: beneficiaryData.missionStatement,
    //   twitterUrl: '',
    //   linkedinUrl: '',
    //   facebookUrl: '',
    //   instagramUrl: '',
    //   githubUrl: '',
    //   ethereumAddress: beneficiaryData.ethereumAddress,
    //   profileImage: `https://gateway.pinata.cloud/ipfs/${beneficiaryData.profileImage}`,
    // };
    setBeneficiary(beneficiaryData);
  }

  useEffect(() => {
    if (contracts) {
      getBeneficiary();
    }
  }, [contracts]);

  return (
    <BeneficiaryPage isProposal={false} beneficiaryProposal={beneficiary} />
  );
}
