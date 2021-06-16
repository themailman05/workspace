import { DummyBeneficiaryProposal, Status } from '../../../interfaces/beneficiaries';
import OpenVoting from './OpenVoting';
import ChallengePeriodVoting from "./ChallengePeriodVoting";
import CompletedVoting from './CompletedVoting';

export default function Voting(displayData: DummyBeneficiaryProposal) {
  return (
    <div>
      {displayData.status === Status.Open ? (
        <OpenVoting {...displayData} />
      ) : displayData.status === Status.Challenge ? (
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
