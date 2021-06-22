import CardBody from 'components/CommonComponents/CardBody';
import { Proposal, ProposalType } from 'interfaces/proposals';
import Link from 'next/link';
import VotingInformation from './Voting/VotingInformation';

export interface ProposalCardProps {
  proposal: Proposal;
  proposalType: ProposalType;
}

export default function ProposalCard({
  proposal,
  proposalType = "Nomination",
}: ProposalCardProps): JSX.Element {
  return (
    <div
      key={proposal?.id}
      className="flex flex-col rounded-lg shadow-lg overflow-hidden bg-white"
    >
      <Link
        href={`${
          proposalType === "Takedown"
            ? '/beneficiary-proposals/takedowns/'
            : '/beneficiary-proposals/'
        }${proposal.id}`}
        passHref
      >
        <a>
          <CardBody
            imgUrl={`${process.env.IPFS_URL}${proposal?.profileImage}`}
            name={proposal?.name}
            missionStatement={proposal?.missionStatement}
          />
          <div className="flex-shrink-0 ">
            <VotingInformation {...(proposal as Proposal)} />
          </div>
        </a>
      </Link>
    </div>
  );
}
