import { BeneficiaryGovernance } from '@popcorn/contracts/typechain';
import {
  BeneficiaryApplication,
  Proposal,
  ProposalType,
} from 'interfaces/interfaces';
import { IIpfsClient } from './IpfsClient';

async function addIpfsDataToProposal(
  IpfsClient: () => IIpfsClient,
  proposal,
  proposalIndex: number,
): Promise<Proposal> {
  const beneficiaryApplication: BeneficiaryApplication = await IpfsClient().get(
    proposal.applicationCid,
  );
  const deadline = new Date(
    (Number(proposal.startTime.toString()) +
      Number(proposal.configurationOptions.votingPeriod.toString()) +
      Number(proposal.configurationOptions.vetoPeriod.toString())) *
      1000,
  );

  return {
    application: beneficiaryApplication,
    id: proposalIndex.toString(),
    proposalType: proposal.proposalType,
    status: Number(proposal.status.toString()),
    stageDeadline: deadline,
    votes: {
      for: proposal.yesCount,
      against: proposal.noCount,
    },
  };
}

export const ProposalAdapter = (
  contract: BeneficiaryGovernance,
  IpfsClient: () => IIpfsClient,
) => {
  return {
    getProposal: async (id): Promise<Proposal> => {
      const proposal = await contract.proposals(Number(id));
      return await addIpfsDataToProposal(IpfsClient, proposal, Number(id));
    },
    getProposals: async (proposalType: ProposalType): Promise<Proposal[]> => {
      const numProposals = await contract.getNumberOfProposals();
      const proposalIds = new Array(numProposals.toNumber()).fill(undefined);
      const allProposals = await Promise.all(
        proposalIds.map(async (x, i) => {
          const proposal = await contract.proposals(i);
          return { ...proposal, id: i };
        }),
      );
      const filteredProposals = allProposals.filter(
        (proposal) => proposal.proposalType === proposalType,
      );

      return await Promise.all(
        filteredProposals.map(
          async (proposal) =>
            await addIpfsDataToProposal(IpfsClient, proposal, proposal.id),
        ),
      );
    },
  };
};
