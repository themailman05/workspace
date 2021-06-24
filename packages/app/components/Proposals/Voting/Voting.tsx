import { Proposal, ProposalType, Status } from 'interfaces/interfaces';
import ChallengePeriodVoting from './ChallengePeriodVoting';
import CompletedVoting from './CompletedVoting';
import OpenVoting from './OpenVoting';

interface VotingProps {
  proposal: Proposal;
  proposalType: ProposalType;
}

export default function Voting({
  proposal,
  proposalType = 0,
}: VotingProps): JSX.Element {
  return (
    <div>
      {proposal?.status === Status.Open ? (
        <OpenVoting proposal={proposal} proposalType={proposalType} />
      ) : proposal?.status === Status.Challenge ? (
        <ChallengePeriodVoting
          proposal={proposal}
          proposalType={proposalType}
        />
      ) : (
        <CompletedVoting proposal={proposal} proposalType={proposalType} />
      )}
      <div className="relative">
        <div className="absolute inset-0 flex items-center" aria-hidden="true">
          <div className="w-full border-t border-gray-300" />
        </div>
      </div>
    </div>
  );
}
