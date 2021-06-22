import { Proposal, Status } from 'interfaces/proposals';
import ChallengePeriodVoting from './ChallengePeriodVoting';
import CompletedVoting from './CompletedVoting';
import OpenVoting from './OpenVoting';

interface VotingProps {
  proposal: Proposal;
  isTakedown: boolean;
}

export default function Voting({
  proposal,
  isTakedown,
}: VotingProps): JSX.Element {
  return (
    <div>
      {proposal?.status === Status.Open ? (
        <OpenVoting proposal={proposal} isTakedown={isTakedown} />
      ) : proposal?.status === Status.Challenge ? (
        <ChallengePeriodVoting
          proposal={proposal}
          isTakedown={isTakedown}
        />
      ) : (
        <CompletedVoting proposal={proposal} isTakedown={isTakedown} />
      )}
      <div className="relative">
        <div className="absolute inset-0 flex items-center" aria-hidden="true">
          <div className="w-full border-t border-gray-300" />
        </div>
      </div>
    </div>
  );
}
