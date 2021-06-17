import { DummyBeneficiaryProposal, Status } from '../../interfaces/beneficiaries';
import ChallengePeriodVoting from './ChallengePeriodVoting';
import CompletedVoting from './CompletedVoting';
import OpenVoting from './OpenVoting';

interface VotingProps {
  displayData: DummyBeneficiaryProposal;
  isTakedown: boolean;
}

function ProposalVoting(displayData: DummyBeneficiaryProposal): JSX.Element {
  return displayData.status === Status.Open ? (
    <OpenVoting {... displayData} />
  ) : displayData.status === Status.Challenge ? (
    <ChallengePeriodVoting {... displayData} />
  ) : (
    <CompletedVoting {... displayData} />
  );
}

export default function Voting({ displayData, isTakedown }: VotingProps) {
  return (
    <div>
      {displayData.status === Status.Open ? (
        <OpenVoting {...displayData} />
      ) : displayData.status === Status.Challenge ? (
        <ChallengePeriodVoting {...displayData} />
      ) : (
        <ProposalVoting {...displayData} />
      )}
      <div className="relative">
        <div className="absolute inset-0 flex items-center" aria-hidden="true">
          <div className="w-full border-t border-gray-300" />
        </div>
      </div>
    </div>
  );
}
