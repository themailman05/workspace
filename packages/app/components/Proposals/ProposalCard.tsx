import CardBody from 'components/CommonComponents/CardBody';
import { Proposal } from 'interfaces/proposals';
import Link from 'next/link';
import VotingInformation from './Voting/VotingInformation';

export interface ProposalCardProps {
  displayData: Proposal;
  isProposal?: boolean;
  isTakedown?: boolean;
}

export default function ProposalCard({
  displayData,
  isTakedown = false,
}: ProposalCardProps): JSX.Element {
  return (
    <div
      key={displayData?.id}
      className="flex flex-col rounded-lg shadow-lg overflow-hidden bg-white"
    >
      <Link
        href={`${
          isTakedown
            ? '/beneficiary-proposals/takedowns/'
            : '/beneficiary-proposals/'
        }${displayData.id}`}
        passHref
      >
        <a>
          <CardBody
            imgUrl={`${process.env.IPFS_URL}${displayData?.profileImage}`}
            name={displayData?.name}
            missionStatement={displayData?.missionStatement}
          />
          <div className="flex-shrink-0 ">
            <VotingInformation {...(displayData as Proposal)} />
          </div>
        </a>
      </Link>
    </div>
  );
}
