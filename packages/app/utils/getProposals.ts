import { getIpfsHashFromBytes32 } from '@popcorn/utils/ipfsHashManipulation';
import { Contracts } from 'context/Web3/contracts';
import { BigNumber } from 'ethers';
import { BeneficiaryProposal } from 'interfaces/proposals';

// From typechain output
interface Proposal {
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

export async function getProposal(contracts: Contracts, proposalIndex: string) {
  const proposal = (await contracts.beneficiaryGovernance.proposals(
    Number(proposalIndex),
  )) as Proposal;
  return await addIpfsDataToProposal(proposal, Number(proposalIndex));
}

async function addIpfsDataToProposal(
  proposal: Proposal,
  proposalIndex: number,
): Promise<BeneficiaryProposal> {
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
    id: proposalIndex,
  };
}

export async function getProposals(contracts: Contracts, isTakedown = false) {
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
    (proposal) => proposal.proposalType === (isTakedown ? 1 : 0),
  );

  return await Promise.all(
    selectedProposals.map(
      async (proposal) => await addIpfsDataToProposal(proposal, proposal.id),
    ),
  );
}
