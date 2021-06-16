import { useContext, useEffect, useState } from 'react';
import { ContractsContext } from '../../context/Web3/contracts';
import BeneficiaryGrid from 'components/BeneficiaryGrid';
import { BeneficiaryCardProps } from 'interfaces/beneficiaries';
import { getIpfsHashFromBytes32 } from '@popcorn/utils/ipfsHashManipulation';

export default function BeneficiaryPageWrapper(): JSX.Element {
  const { contracts } = useContext(ContractsContext);
  const [benefeciaries, setBeneficiaries] = useState<BeneficiaryCardProps[]>(
    [],
  );

  async function getBeneficiaries() {
    const beneficiaryAddresses =
      await contracts.beneficiary.getBeneficiaryList();

    const ipfsHashes = await Promise.all(
      beneficiaryAddresses.map(async (address) => {
        return contracts.beneficiary.getBeneficiary(address);
      }),
    );
    const beneficiaryData = await (
      await Promise.all(
        ipfsHashes.map((ipfsHash) => {
          return fetch(
            `${process.env.IPFS_URL}${getIpfsHashFromBytes32(ipfsHash)}`,
          ).then((response) => response.json());
        }),
      )
    ).map((beneficiaryJson) => {
      const benefificaryCardData: BeneficiaryCardProps = {
        name: beneficiaryJson.name,
        missionStatement: beneficiaryJson.missionStatement,
        twitterUrl: beneficiaryJson.twitterUrl,
        linkedinUrl: beneficiaryJson.linkedinUrl,
        facebookUrl: beneficiaryJson.facebookUrl,
        instagramUrl: beneficiaryJson.instagramUrl,
        githubUrl: beneficiaryJson.githubUrl,
        ethereumAddress: beneficiaryJson.ethereumAddress,
        profileImage: beneficiaryJson.profileImage,
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

  return (
    <BeneficiaryGrid
      title={'Eligible Beneficiaries'}
      subtitle={
        'Beneficiary organizations that have passed the voting process and are eligible to receive grants'
      }
      isProposal={false}
      cardProps={benefeciaries}
    />
  );
}
