import { DummyBeneficiaryProposal } from '../../interfaces/beneficiaries';

import ChallengePeriodVoting from './ChallengePeriodVoting';
import CompletedVoting from './CompletedVoting';
import OpenVoting from './OpenVoting';

export default function Voting(beneficiaryProposal: DummyBeneficiaryProposal) {
  return (
    <div>
      {beneficiaryProposal.currentStage === 'Open' ? (
        <OpenVoting {...beneficiaryProposal} />
      ) : beneficiaryProposal.currentStage === 'Challenge' ? (
        <ChallengePeriodVoting {...beneficiaryProposal} />
      ) : (
        <CompletedVoting {...beneficiaryProposal} />
      )}
      <div className="relative">
        <div className="absolute inset-0 flex items-center" aria-hidden="true">
          <div className="w-full border-t border-gray-300" />
        </div>
      </div>
    </div>
  );
}
