import BeneficiaryPage from 'components/BeneficiaryPage';
import { ContractsContext } from 'context/Web3/contracts';
import { useRouter } from 'next/router';
import { useContext, useEffect, useState } from 'react';
import { getIpfsHashFromBytes32 } from '@popcorn/utils/ipfsHashManipulation';
import { BeneficiaryCardProps } from 'interfaces/beneficiaries';

export default function BeneficiaryProposalPageWrapper(): JSX.Element {
  const router = useRouter();
  const { contracts } = useContext(ContractsContext);
  const [proposal, setProposal] = useState<BeneficiaryCardProps>();
  const { id } = router.query;
  async function getProposal() {
    const numProposals =
      await contracts.beneficiaryGovernance.getNumberOfProposals();
    const proposals = await Promise.all(
      new Array(numProposals.toNumber()).fill(undefined).map(async (x, i) => {
        return contracts.beneficiaryGovernance.proposals(i);
      }),
    );
    const proposalsData = await Promise.all(
      proposals.map(async (proposal) => {
        const ipfsData = await fetch(
          `${process.env.IPFS_URL}${getIpfsHashFromBytes32(
            proposal.applicationCid,
          )}`,
        ).then((response) => response.json());

        const deadline = new Date(
          (Number(proposal.startTime.toString()) +
            Number(proposal.configurationOptions.votingPeriod.toString()) +
            Number(proposal.configurationOptions.vetoPeriod.toString())) *
            1000,
        );
        return {
          name: ipfsData.name,
          missionStatement: ipfsData.missionStatement,
          twitterUrl: ipfsData.twitterUrl,
          linkedinUrl: ipfsData.linkedinUrl,
          facebookUrl: ipfsData.facebookUrl,
          instagramUrl: ipfsData.instagramUrl,
          githubUrl: ipfsData.githubUrl,
          ethereumAddress: ipfsData.ethereumAddress,
          additionalImages: ipfsData.additionalImages,
          impactReports: ipfsData.impactReports,
          proofOfOwnership: ipfsData.proofOfOwnership,
          headerImage: ipfsData.headerImage,
          profileImage: `${process.env.IPFS_URL}${ipfsData.profileImage}`,
          votesFor: proposal.yesCount,
          votesAgainst: proposal.noCount,
          status: Number(proposal.status.toString()),
          stageDeadline: deadline,
        };
      }),
    );

    setProposal(
      proposalsData.filter((proposalData) => {
        return proposalData.ethereumAddress === id;
      })[0] as BeneficiaryCardProps,
    );
  }

  useEffect(() => {
    if (contracts) {
      getProposal();
    }
  }, [contracts]);

  return <BeneficiaryPage isProposal={true} beneficiaryProposal={proposal} />;
}
