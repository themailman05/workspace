import { BeneficiaryGovernance } from '@popcorn/contracts/typechain';
import { IIpfsClient } from '../../IpfsClient/IpfsClient';
import addIpfsDataToProposal from '../../IpfsClient/addIpfsDataToProposal';
import { Proposal, ProposalType } from '@popcorn/utils';

export const BeneficiaryGovernanceAdapter = (
  contract: BeneficiaryGovernance,
  IpfsClient: () => IIpfsClient,
) => {
  return {
    getProposal: async (id: string): Promise<Proposal> => {
      const proposal = await contract.proposals(Number(id));
      return await addIpfsDataToProposal(IpfsClient, proposal, Number(id));
    },
    getAllProposals: async (proposalType: ProposalType): Promise<Proposal[]> => {
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
