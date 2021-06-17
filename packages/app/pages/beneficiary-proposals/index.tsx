import BeneficiaryGrid from 'components/BeneficiaryGrid';
import { ContractsContext } from 'context/Web3/contracts';
import { useContext, useEffect, useState } from 'react';
import { getIpfsHashFromBytes32 } from '@popcorn/utils/ipfsHashManipulation';
import { ProposalCardProps } from 'interfaces/beneficiaries';

export default function BeneficiaryPageWrapper(): JSX.Element {
  const { contracts } = useContext(ContractsContext);
  const [proposals, setProposals] = useState<ProposalCardProps[]>([]);

  async function getProposals() {
    const numProposals =
      await contracts.beneficiaryGovernance.getNumberOfProposals();
    const proposals = await (
      await Promise.all(
        new Array(numProposals.toNumber()).fill(undefined).map(async (x, i) => {
          return contracts.beneficiaryGovernance.proposals(i);
        }),
      )
    ).filter((proposal) => proposal.proposalType === 0);

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
          profileImage: ipfsData.profileImage,
          votesFor: proposal.yesCount,
          votesAgainst: proposal.noCount,
          status: Number(proposal.status.toString()),
          stageDeadline: deadline,
        };
      }),
    );
    setProposals(proposalsData);
  }

  useEffect(() => {
    if (contracts) {
      getProposals();
    }
  }, [contracts]);

  return (
    <BeneficiaryGrid
      isProposal={true}
      cardProps={proposals}
      title={'Eligible Beneficiaries'}
      subtitle={
        'You choose which social initiatives are included in grant elections. Browse and vote on beneficiary nominations'
      }
    />
  );
}
