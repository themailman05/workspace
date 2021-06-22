import CardBody from 'components/CommonComponents/CardBody';
import { Proposal } from 'interfaces/proposals';
import Link from 'next/link';
import VotingInformation from './Voting/VotingInformation';

export interface ProposalCardProps {
  proposal: Proposal;
  isProposal?: boolean;
  isTakedown?: boolean;
}

export default function ProposalCard({
  proposal,
  isTakedown = false,
}: ProposalCardProps): JSX.Element {
  return (
    <div
      key={proposal?.id}
      className="flex flex-col rounded-lg shadow-lg overflow-hidden bg-white"
    >
      <Link
        href={`${
          isTakedown
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
