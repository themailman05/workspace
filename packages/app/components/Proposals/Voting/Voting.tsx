import VotingDivider from 'components/CommonComponents/VotingDivider';
import { Proposal, Status } from 'interfaces/interfaces';
import ChallengePeriodVoting from './ChallengePeriodVoting';
import CompletedVoting from './CompletedVoting';
import OpenVoting from './OpenVoting';

interface VotingProps {
  proposal: Proposal;
}

export default function Voting({ proposal }: VotingProps): JSX.Element {
  return (
    <div>
      {proposal?.status === Status.Open ? (
        <OpenVoting {...proposal} />
      ) : proposal?.status === Status.Challenge ? (
        <ChallengePeriodVoting {...proposal} />
      ) : (
        <CompletedVoting {...proposal} />
      )}
      <VotingDivider />
    </div>
  );
}
