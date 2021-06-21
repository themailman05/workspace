import { BaseProposal } from 'interfaces/beneficiaries';
import Link from 'next/link';
import VotingInformation from './Proposals/Voting/VotingInformation';


export interface ProposalCardProps {
  displayData: BaseProposal;
  isProposal?: boolean;
  isTakedown?: boolean;
}

export default function ProposalCard({
  displayData,
  isTakedown = false,
}: ProposalCardProps): JSX.Element {
  return (
    <div
      key={displayData?.ethereumAddress}
      className="flex flex-col rounded-lg shadow-lg overflow-hidden"
    >
      <Link
        href={`${
          isTakedown
            ? '/beneficiary-proposals/takedowns/'
            : '/beneficiary-proposals/'
        }${displayData.ethereumAddress}`}
        passHref
      >
        <a>
          <div className="flex-shrink-0">
            <img
              className="h-48 w-full object-cover"
              src={`${process.env.IPFS_URL}${displayData?.profileImage}`}
              alt=""
            />
          </div>
          <div className="flex-1 bg-white p-6 flex flex-col justify-between">
            <div className="flex-1">
              <p className="text-xl font-semibold text-gray-900">
                {displayData?.name}
              </p>
              <p className="mt-3 text-base text-gray-500">
                {displayData?.missionStatement}
              </p>
            </div>
          </div>
        </a>
      </Link>
      <div className="mt-6 flex items-center">
        <div className="flex-shrink-0">
          <VotingInformation {...(displayData as BaseProposal)} />
        </div>
      </div>
    </div>
  );
}
