import { getIpfsHashFromBytes32 } from '@popcorn/utils/ipfsHashManipulation';
import BeneficiaryGrid from 'components/Beneficiaries/BeneficiaryGrid';
import { BeneficiaryApplication } from 'interfaces/interfaces';
import { useContext, useEffect, useState } from 'react';
import { ContractsContext } from '../../context/Web3/contracts';

export default function BeneficiaryPage(): JSX.Element {
  const { contracts } = useContext(ContractsContext);
  const [benefeciaries, setBeneficiaries] = useState<BeneficiaryApplication[]>([]);

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
      return {
        organizationName: beneficiaryJson.name,
        missionStatement: beneficiaryJson.missionStatement,
        beneficiaryAddress: beneficiaryAddresses[0], // TODO: revert to beneficiaryJson.ethereumAddress 
        files: {
          profileImage: beneficiaryJson.profileImage,
          headerImage: beneficiaryJson?.headerImage,
          impactReports: beneficiaryJson?.impactReports,
          additionalImages: beneficiaryJson?.additionalImages,
        },
        links: {
          twitterUrl: beneficiaryJson?.twitterUrl,
          linkedinUrl: beneficiaryJson?.linkedinUrl,
          facebookUrl: beneficiaryJson?.linkedinUrl,
          instagramUrl: beneficiaryJson?.linkedinUrl,
          githubUrl: beneficiaryJson?.linkedinUrl,
          proofOfOwnership: beneficiaryJson?.linkedinUrl,
        },
      }
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
      beneficiaries={benefeciaries}
    />
  );
}
