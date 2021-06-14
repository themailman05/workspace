import { DummyBeneficiaryProposal } from '../../interfaces/beneficiaries';

import ChallengePeriodVoting from './ChallengePeriodVoting';
import CompletedVoting from './CompletedVoting';
import OpenVoting from './OpenVoting';

interface VotingProps {
  displayData: DummyBeneficiaryProposal;
  isTakedown: boolean;
}

export default function Voting({ displayData, isTakedown }: VotingProps) {
  return (
    <div>

      {displayData.currentStage === 'Open' ? (
        <OpenVoting displayData={displayData} isTakedown={isTakedown} />
      ) : displayData.currentStage === 'Challenge' ? (
        <ChallengePeriodVoting displayData={displayData} isTakedown={isTakedown}/>
      ) : (
        <CompletedVoting displayData={displayData} isTakedown={isTakedown}/>
      )}
      <div className="relative">
        <div className="absolute inset-0 flex items-center" aria-hidden="true">
          <div className="w-full border-t border-gray-300" />
        </div>
      </div>
    </div>
  );
}
