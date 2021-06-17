import { DummyBeneficiaryProposal } from '../../interfaces/beneficiaries';

import TakedownChallengePeriodVoting from './TakedownChallengePeriodVoting';
import TakedownCompletedVoting from './TakedownCompletedVoting';
import TakedownOpenVoting from './TakedownOpenVoting';

export default function Voting(displayData: DummyBeneficiaryProposal) {
  return (
    <div>
      {displayData.currentStage === 'Open' ? (
        <TakedownOpenVoting {...displayData} />
      ) : displayData.currentStage === 'Challenge' ? (
        <TakedownChallengePeriodVoting {...displayData} />
      ) : (
        <TakedownCompletedVoting {...displayData} />
      )}
      <div className="relative">
        <div className="absolute inset-0 flex items-center" aria-hidden="true">
          <div className="w-full border-t border-gray-300" />
        </div>
      </div>
    </div>
  );
}
