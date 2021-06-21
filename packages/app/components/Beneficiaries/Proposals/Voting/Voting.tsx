import { BeneficiaryProposal, Status } from 'interfaces/proposals';
import ChallengePeriodVoting from './ChallengePeriodVoting';
import CompletedVoting from './CompletedVoting';
import OpenVoting from './OpenVoting';

interface VotingProps {
  displayData: BeneficiaryProposal;
  isTakedown: boolean;
}

export default function Voting({
  displayData,
  isTakedown,
}: VotingProps): JSX.Element {
  return (
    <div>
      {displayData?.status === Status.Open ? (
        <OpenVoting displayData={displayData} isTakedown={isTakedown} />
      ) : displayData?.status === Status.Challenge ? (
        <ChallengePeriodVoting
          displayData={displayData}
          isTakedown={isTakedown}
        />
      ) : (
        <CompletedVoting displayData={displayData} isTakedown={isTakedown} />
      )}
      <div className="relative">
        <div className="absolute inset-0 flex items-center" aria-hidden="true">
          <div className="w-full border-t border-gray-300" />
        </div>
      </div>
    </div>
  );
}
