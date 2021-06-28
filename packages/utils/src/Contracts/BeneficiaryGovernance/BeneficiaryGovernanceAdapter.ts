import { BeneficiaryGovernance } from '@popcorn/contracts/typechain';
import { IIpfsClient } from '../../IpfsClient/IpfsClient';
import addIpfsDataToProposal from '../../IpfsClient/addIpfsDataToProposal';
import { Proposal, ProposalType } from '@popcorn/utils';

export type AsyncReturnType<T extends (...args: any) => any> = T extends (
  ...args: any
) => Promise<infer U>
  ? U
  : T extends (...args: any) => infer U
  ? U
  : any;

export const BeneficiaryGovernanceAdapter = (
  contract: BeneficiaryGovernance,
  IpfsClient: () => IIpfsClient,
) => {
  type proposalReturnType = AsyncReturnType<typeof contract.proposals>;
  return {
    getProposal: async (id: string): Promise<Proposal> => {
      const proposal: proposalReturnType = await contract.proposals(Number(id));
      return await addIpfsDataToProposal(IpfsClient, proposal, Number(id));
    },
    getAllProposals: async (
      proposalType: ProposalType,
    ): Promise<Proposal[]> => {
      const numProposals = await contract.getNumberOfProposals();
      const proposalIds = new Array(numProposals.toNumber()).fill(undefined);
      const proposalData: { proposal: proposalReturnType; id: number }[] =
        await Promise.all(
          proposalIds.map(async (x, i) => {
            const proposal = await contract.proposals(i);
            return { proposal, id: i };
          }),
        );
      const filteredProposalData = proposalData.filter(
        (proposalData) => proposalData.proposal.proposalType === proposalType,
      );
      return await Promise.all(
        filteredProposalData.map(
          async (proposalData, index) =>
            await addIpfsDataToProposal(
              IpfsClient,
              proposalData.proposal,
              proposalData.id,
            ),
        ),
      );
    },
  };
};
