import BeneficiaryPage from 'components/BeneficiaryPage';
import { ContractsContext } from 'context/Web3/contracts';
import { useRouter } from 'next/router';
import { useContext, useEffect, useState } from 'react';
import { getIpfsHashFromBytes32 } from '@popcorn/utils/ipfsHashManipulation';
import { BeneficiaryCardProps, DummyBeneficiaryProposal } from 'interfaces/beneficiaries';

export default function BeneficiaryProposalPageWrapper(): JSX.Element {
  const router = useRouter();
  const { contracts } = useContext(ContractsContext);
  const [proposal, setProposal] = useState<DummyBeneficiaryProposal>();
  const { id } = router.query;
  async function getProposal() {
    const proposalId = await contracts.beneficiaryGovernance.getProposalId(
      id as string,
    );
    const proposal = await contracts.beneficiaryGovernance.proposals(
      proposalId,
    );
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

    const proposalData = {
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
      profileImage: ipfsData.profileImage,
      votesFor: proposal.yesCount,
      votesAgainst: proposal.noCount,
      status: Number(proposal.status.toString()),
      stageDeadline: deadline,
    };
    setProposal(proposalData as DummyBeneficiaryProposal);
  }

  useEffect(() => {
    if (contracts) {
      getProposal();
    }
  }, [contracts]);

  return <BeneficiaryPage isProposal={true} displayData={proposal} />;
}
