import { BeneficiaryGovernance } from '@popcorn/contracts/typechain';
import { Proposal, ProposalType } from 'interfaces/interfaces';
import { IIpfsClient } from './IpfsClient';
import addIpfsDataToProposal from './addIpfsDataToProposal';

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
