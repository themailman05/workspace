import { BeneficiaryApplication, Proposal } from "interfaces/interfaces";
import { IIpfsClient } from "./IpfsClient";

export default async function addIpfsDataToProposal(
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
