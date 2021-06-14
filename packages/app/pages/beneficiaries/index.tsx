import { useContext, useEffect, useState } from 'react';
import { ContractsContext } from '../../context/Web3/contracts';
import BeneficiaryGrid from 'components/BeneficiaryGrid';
import { BeneficiaryCardProps } from 'interfaces/beneficiaries';
import { getIpfsHashFromBytes32 } from '@popcorn/utils/ipfsHashManipulation';

export default function BeneficiaryPageWrapper(): JSX.Element {
  const { contracts } = useContext(ContractsContext);
  const [beneficiaries, setBeneficiaries] = useState<BeneficiaryCardProps[]>(
    [],
  );

  async function getBeneficiaries() {
    const beneficiaryAddresses = await contracts.beneficiary.getBeneficiaryList();
    const ipfsHashes = await Promise.all(
      beneficiaryAddresses.map(async (address) => {
        return contracts.beneficiary.getBeneficiary(address);
      }),
    );
    const beneficiaryData = await (
      await Promise.all(
        ipfsHashes.map((ipfsHash) => {
          const url =
            'https://gateway.pinata.cloud/ipfs/' +
            getIpfsHashFromBytes32(ipfsHash);
          return fetch(url).then((response) => response.json());
        }),
      )
    ).map((beneficiaryJson) => {
      //TODO parse social media links
      const benefificaryCardData: BeneficiaryCardProps = {
        name: beneficiaryJson.name,
        missionStatement: beneficiaryJson.missionStatement,
        twitterUrl: '',
        linkedinUrl: '',
        facebookUrl: '',
        instagramUrl: '',
        githubUrl: '',
        ethereumAddress: beneficiaryJson.ethereumAddress,
        profileImage: `https://gateway.pinata.cloud/ipfs/${beneficiaryJson.profileImage}`,
      };
      return benefificaryCardData;
    });
    setBeneficiaries(beneficiaryData);
  }

  useEffect(() => {
    if (contracts) {
      getBeneficiaries();
    }
  }, [contracts]);

  console.log(beneficiaries);

  return <BeneficiaryGrid isProposal={false} cardProps={beneficiaries} />;
}
