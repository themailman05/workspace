import GrantFunded from './GrantFunded';
import VoteSlider from './VoteSlider';
import Link from 'next/link';
import { PendingVotes, Vote } from 'pages/grant-elections/[type]';
import { ElectionMetadata } from '@popcorn/utils/Contracts';
import GrantElectionAdapter from '../../../utils/src/Contracts/GrantElection/GrantElectionAdapter';

export interface BeneficiaryMetadata {
  address: string;
  title: string;
  description: string;
  image: string;
  totalVotes: number;
}
interface IBeneficiaryCard {
  beneficiary: BeneficiaryMetadata;
  election: ElectionMetadata;
  votesAssignedByUser?: number;
  pendingVotes: PendingVotes;
  assignVotes?: (grantTerm: number, vote: Vote) => void;
  maxVotes?: number;
  voiceCredits?: number;
}

export default function BeneficiaryCard({
  election,
  beneficiary,
  pendingVotes,
  assignVotes,
  voiceCredits,
}: IBeneficiaryCard): JSX.Element {
  return (
    <div className="shadow-sm w-80 h-auto rounded-lg mr-8 mb-16 bg-white border-b border-gray-200 ">
      <Link href={`/beneficiary/${beneficiary?.address}`} passHref>
        <a>
          <div className="w-full h-32 rounded-t-lg">
            {beneficiary?.image && (
              <img
                className="w-100 h-auto md:w-100 md:h-auto md:rounded-t rounded-t mx-auto"
                src={beneficiary?.image}
                alt=""
                style={{ objectFit: 'cover', height: '140px' }}
              ></img>
            )}
          </div>
        </a>
      </Link>
      <div className="w-full px-4 pb-6 pt-6">
        <div className="h-10 mt-3">
          <Link href={`/beneficiary/${beneficiary?.address}`} passHref>
            <a>
              <h3 className="text-lg font-bold text-gray-800 leading-snug">
                {beneficiary?.title}
              </h3>
            </a>
          </Link>
        </div>
        <div className="h-32">
          <Link href={`/beneficiary/${beneficiary?.address}`} passHref>
            <a>
              <p className="text-sm text-gray-700">
                {beneficiary?.description}
              </p>
            </a>
          </Link>
        </div>
        <div className="">
          {GrantElectionAdapter().isActive(election) ? (
            <VoteSlider
              key={beneficiary?.address}
              beneficiary={beneficiary}
              election={election}
              pendingVotes={pendingVotes}
              assignVotes={assignVotes}
              voiceCredits={voiceCredits}
            />
          ) : (election.electionStateStringShort == "finalized") ? (
            <GrantFunded beneficiary={beneficiary} election={election} />
          ) : ''}
        </div>
      </div>
    </div>
  );
}
