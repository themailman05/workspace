import { DummyBeneficiaryProposal } from '../../interfaces/beneficiaries';

import ChallengePeriodVoting from './ChallengePeriodVoting';
import CompletedVoting from './CompletedVoting';
import OpenVoting from './OpenVoting';

export default function Voting(displayData: DummyBeneficiaryProposal) {
  return (
    <div>
      {displayData.currentStage === 'Open' ? (
        <OpenVoting {...displayData} />
      ) : displayData.currentStage === 'Challenge' ? (
        <ChallengePeriodVoting {...displayData} />
      ) : (
        <CompletedVoting {...displayData} />
      )}
      <div className="relative">
        <div className="absolute inset-0 flex items-center" aria-hidden="true">
          <div className="w-full border-t border-gray-300" />
        </div>
      </div>
    </div>
  );
}
