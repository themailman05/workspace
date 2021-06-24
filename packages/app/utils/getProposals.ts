import { getIpfsHashFromBytes32 } from '@popcorn/utils/ipfsHashManipulation';
import { Contracts } from 'context/Web3/contracts';
import { BigNumber } from 'ethers';
import { Proposal, ProposalType } from 'interfaces/interfaces';

interface TypechainProposal {
  status: number;
  beneficiary: string;
  applicationCid: string;
  proposer: string;
  startTime: BigNumber;
  yesCount: BigNumber;
  noCount: BigNumber;
  voterCount: BigNumber;
  proposalType: number;
  configurationOptions: {
    votingPeriod: BigNumber;
    vetoPeriod: BigNumber;
    proposalBond: BigNumber;
  };
}

export async function getProposal(
  contracts: Contracts,
  proposalIndex: string,
): Promise<Proposal> {
  const proposal = (await contracts.beneficiaryGovernance.proposals(
    Number(proposalIndex),
  )) as TypechainProposal;
  return await addIpfsDataToProposal(proposal, Number(proposalIndex));
}

async function addIpfsDataToProposal(
  proposal: TypechainProposal,
  proposalIndex: number,
): Promise<Proposal> {
  const ipfsData = await fetch(
    `${process.env.IPFS_URL}${getIpfsHashFromBytes32(proposal.applicationCid)}`,
  ).then((response) => response.json());

  const deadline = new Date(
    (Number(proposal.startTime.toString()) +
      Number(proposal.configurationOptions.votingPeriod.toString()) +
      Number(proposal.configurationOptions.vetoPeriod.toString())) *
      1000,
  );

  return {
    id: proposalIndex.toString(),
    status: Number(proposal.status.toString()),
    stageDeadline: deadline,
    application: {
      organizationName: ipfsData.name,
      missionStatement: ipfsData.missionStatement,
      beneficiaryAddress: ipfsData.ethereumAddress,
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
    },
    votes: {
      for: proposal.yesCount,
      against: proposal.noCount,
    },
    proposalType: proposal.proposalType,
  };
}

export async function getProposals(
  contracts: Contracts,
  proposalType: ProposalType,
): Promise<Proposal[]> {
  const numProposals =
    await contracts.beneficiaryGovernance.getNumberOfProposals();

  const proposalIds = new Array(numProposals.toNumber()).fill(undefined);

  const allProposals = await Promise.all(
    proposalIds.map(async (x, i) => {
      const proposal = await contracts.beneficiaryGovernance.proposals(i);
      return { ...proposal, id: i };
    }),
  );
  const selectedProposals = allProposals.filter(
    (proposal) => proposal.proposalType === proposalType,
  );

  return await Promise.all(
    selectedProposals.map(
      async (proposal) => await addIpfsDataToProposal(proposal, proposal.id),
    ),
  );
}
