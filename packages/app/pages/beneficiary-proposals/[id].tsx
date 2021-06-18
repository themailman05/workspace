import BeneficiaryPage from 'components/Beneficiaries/BeneficiaryPage';
import { BeneficiaryProposal } from 'interfaces/beneficiaries';
import router from 'next/router';
import { useContext, useEffect } from 'react';
import { useState } from 'react';
import { ContractsContext } from 'context/Web3/contracts';
import { getIpfsHashFromBytes32 } from '@popcorn/utils/ipfsHashManipulation';

export default function BeneficiaryPageWrapper(): JSX.Element {
  const { contracts } = useContext(ContractsContext);
  const [proposal, setProposal] = useState<BeneficiaryProposal>();

  async function getProposal() {
    const proposalIndex = await contracts.beneficiaryGovernance.getProposalId(
      router.query.id as string,
    );
    const proposal = await contracts.beneficiaryGovernance.proposals(
      proposalIndex,
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

    setProposal({
      name: ipfsData.name,
      missionStatement: ipfsData.missionStatement,
      twitterUrl: ipfsData.twitterUrl,
      linkedinUrl: ipfsData.linkedinUrl,
      facebookUrl: ipfsData.facebookUrl,
      instagramUrl: ipfsData.instagramUrl,
      githubUrl: ipfsData.githubUrl,
      ethereumAddress: ipfsData.ethereumAddress,
      profileImage: ipfsData.profileImage,
      votesFor: proposal.yesCount,
      votesAgainst: proposal.noCount,
      status: Number(proposal.status.toString()),
      stageDeadline: deadline,
      additionalImages: ipfsData.additionalImages,
      headerImage: ipfsData.headerImage,
      proofOfOwnership: ipfsData.proofOfOwnership,
    });
  }

  useEffect(() => {
    if (contracts) {
      getProposal();
    }
  }, [contracts]);
  return (
    <BeneficiaryPage
      displayData={proposal as BeneficiaryProposal}
      isProposal={true}
    />
  );
}
