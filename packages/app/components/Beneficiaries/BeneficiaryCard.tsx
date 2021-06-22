import {
  ElectionMetadata,
  GrantElectionAdapter,
} from '@popcorn/utils/Contracts';
import CardBody from 'components/CommonComponents/CardBody';
import GrantFunded from 'components/Grants/GrantFunded';
import VoteSlider from 'components/Grants/VoteSlider';
import { Beneficiary } from 'interfaces/beneficiaries';
import Link from 'next/link';
import { PendingVotes, Vote } from 'pages/grant-elections/[type]';

export interface ElectionProps {
  election: ElectionMetadata;
  votesAssignedByUser?: number;
  pendingVotes: PendingVotes;
  assignVotes?: (grantTerm: number, vote: Vote) => void;
  maxVotes?: number;
  voiceCredits?: number;
  totalVotes: number;
}

export interface BeneficiaryCardProps {
  beneficiary: Beneficiary;
  electionProps?: ElectionProps;
}

export interface GrantSliderProps {
  beneficiary: Beneficiary;
  electionProps: ElectionProps;
}

function GrantSlider({
  beneficiary,
  electionProps,
}: GrantSliderProps): JSX.Element {
  return (
    <div className="mt-6 flex items-center">
      <div className="flex-shrink-0">
        {GrantElectionAdapter().isActive(electionProps.election) ? (
          <VoteSlider
            beneficiary={beneficiary as Beneficiary}
            electionProps={electionProps}
          />
        ) : (
          <GrantFunded
            beneficiary={beneficiary}
            election={electionProps.election}
            totalVotes={electionProps.totalVotes}
          />
        )}
      </div>
    </div>
  );
}

export default function BeneficiaryCard({
  beneficiary,
  electionProps,
}: BeneficiaryCardProps): JSX.Element {
  return (
    <div
      key={beneficiary?.ethereumAddress}
      className="flex flex-col rounded-lg shadow-lg overflow-hidden"
    >
      <Link href={`/beneficiaries/${beneficiary.ethereumAddress}`} passHref>
        <a>
          <CardBody
            imgUrl={`${process.env.IPFS_URL}${beneficiary?.profileImage}`}
            name={beneficiary?.name}
            missionStatement={beneficiary?.missionStatement}
          />
        </a>
      </Link>
      {electionProps ? (
        <GrantSlider beneficiary={beneficiary} electionProps={electionProps} />
      ) : (
        <></>
      )}
    </div>
  );
}
