import { DummyBeneficiaryProposal } from '../../interfaces/beneficiaries';
import ChallengePeriodVoting from './Voting/ChallengePeriodVoting';
import CompletedVoting from './Voting/CompletedVoting';
import OpenVoting from './Voting/OpenVoting';

export default function Voting(displayData: DummyBeneficiaryProposal) {
  return (
    <div>
      {displayData.status === 0 ? (
        <OpenVoting {...displayData} />
      ) : displayData.status === 1 ? (
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
