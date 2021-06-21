import {
  ElectionMetadata,
  GrantElectionAdapter,
} from '@popcorn/utils/Contracts';
import CardBody from 'components/CommonComponents/CardBody';
import GrantFunded from 'components/Grants/GrantFunded';
import VoteSlider from 'components/Grants/VoteSlider';
import { BaseBeneficiary } from 'interfaces/beneficiaries';
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
  displayData: BaseBeneficiary;
  electionProps?: ElectionProps;
}

export interface GrantSliderProps {
  displayData: BaseBeneficiary;
  electionProps: ElectionProps;
}

function GrantSlider({
  displayData,
  electionProps,
}: GrantSliderProps): JSX.Element {
  return (
    <div className="mt-6 flex items-center">
      <div className="flex-shrink-0">
        {GrantElectionAdapter().isActive(electionProps.election) ? (
          <VoteSlider
            beneficiary={displayData as BaseBeneficiary}
            electionProps={electionProps}
          />
        ) : (
          <GrantFunded
            beneficiary={displayData}
            election={electionProps.election}
            totalVotes={electionProps.totalVotes}
          />
        )}
      </div>
    </div>
  );
}

export default function BeneficiaryCard({
  displayData,
  electionProps,
}: BeneficiaryCardProps): JSX.Element {
  return (
    <div
      key={displayData?.ethereumAddress}
      className="flex flex-col rounded-lg shadow-lg overflow-hidden"
    >
      <Link href={`/beneficiaries/${displayData.ethereumAddress}`} passHref>
        <a>
          <CardBody
            imgUrl={`${process.env.IPFS_URL}${displayData?.profileImage}`}
            name={displayData?.name}
            missionStatement={displayData?.missionStatement}
          />
        </a>
      </Link>
      {electionProps ? (
        <GrantSlider displayData={displayData} electionProps={electionProps} />
      ) : (
        <></>
      )}
    </div>
  );
}
