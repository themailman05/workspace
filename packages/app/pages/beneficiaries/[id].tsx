import { ContractsContext } from 'context/Web3/contracts';
import { useRouter } from 'next/router';
import { useContext, useEffect, useState } from 'react';
import { getIpfsHashFromBytes32 } from '@popcorn/utils/ipfsHashManipulation';
import BeneficiaryPage from 'components/Beneficiaries/BeneficiaryPage';
import { BeneficiaryApplication } from '../../interfaces/interfaces';
export default function SingleBeneficiaryPage(): JSX.Element {
  const router = useRouter();
  const { contracts } = useContext(ContractsContext);
  const [benefeciary, setBeneficiary] = useState<BeneficiaryApplication>();

  async function getBeneficiary() {
    const ipfsHash = await contracts.beneficiary.getBeneficiary(
      router.query.id as string,
    );
    const ipfsData = await fetch(
      `${process.env.IPFS_URL}${getIpfsHashFromBytes32(ipfsHash)}`,
    ).then((response) => response.json());
    const beneficiaryApplication: BeneficiaryApplication = {
      organizationName: ipfsData.name,
      missionStatement: ipfsData.missionStatement,
      beneficiaryAddress: ipfsData.beneficiaryAddress,
      files: {
        profileImage: ipfsData.profileImage,
        headerImage: ipfsData?.headerImage,
        impactReports: ipfsData?.impactReports,
        additionalImages: ipfsData?.additionalImages,
      },
      links: {
        twitterUrl: ipfsData?.twitterUrl,
        linkedinUrl: ipfsData?.linkedinUrl,
        facebookUrl: ipfsData?.linkedinUrl,
        instagramUrl: ipfsData?.linkedinUrl,
        githubUrl: ipfsData?.linkedinUrl,
        proofOfOwnership: ipfsData?.linkedinUrl,
      },
    };
    setBeneficiary(beneficiaryApplication);
  }

  useEffect(() => {
    if (contracts) {
      getBeneficiary();
    }
  }, [contracts]);

  return <BeneficiaryPage beneficiary={benefeciary} />;
}
