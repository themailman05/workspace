import BeneficiaryGrid from 'components/BeneficiaryGrid';
import { ContractsContext } from 'context/Web3/contracts';
import { useRouter } from 'next/router';
import { useContext, useEffect, useState } from 'react';
import { getIpfsHashFromBytes32 } from '@popcorn/utils/ipfsHashManipulation';
import { BeneficiaryCardProps } from 'interfaces/beneficiaries';

export default function BeneficiaryPageWrapper(): JSX.Element {
  const { contracts } = useContext(ContractsContext);
  const [proposals, setProposals] = useState<BeneficiaryCardProps[]>([]);

  async function getProposals() {
    //Where do the proposals get stored?
    const proposalAddresses =
      await contracts.beneficiary.getBeneficiaryList();
    const ipfsHashes = await Promise.all(
      proposalAddresses.map(async (address) => {
        return contracts.beneficiary.getBeneficiary(address);
      }),
    );
    const proposalsData = await (
      await Promise.all(
        ipfsHashes.map((ipfsHash) => {
          return fetch(
            `${process.env.IPFS_URL}${getIpfsHashFromBytes32(ipfsHash)}`,
          ).then((response) => response.json());
        }),
      )
    ).map((proposalJson) => {
      //TODO parse social media links
      const benefificaryCardData: BeneficiaryCardProps = {
        name: proposalJson.name,
        missionStatement: proposalJson.missionStatement,
        twitterUrl: '',
        linkedinUrl: '',
        facebookUrl: '',
        instagramUrl: '',
        githubUrl: '',
        dribbleUrl: '',
        ethereumAddress: proposalJson.ethereumAddress,
        profileImageURL: `${process.env.IPFS_URL}${proposalJson.profileImage}`,
      };
      return benefificaryCardData;
    });
    setProposals(proposalsData);
  }

  useEffect(() => {
    if (contracts) {
      getProposals();
    }
  }, [contracts]);

  console.log(proposals);
  return <BeneficiaryGrid isProposal={true} benefeciaries={proposals} />;
}
