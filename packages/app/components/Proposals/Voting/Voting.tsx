import { Status } from '@popcorn/utils';
import React from 'react';
import CurrentStandings from '../CurrentStandings';
import ChallengePeriodVoting from './ChallengePeriodVoting';
import CompletedVoting from './CompletedVoting';
import OpenVoting from './OpenVoting';
import { VotingProps } from './VotingProps';

const Voting: React.FC<VotingProps> = ({
  proposal,
  hasVoted = false,
}): JSX.Element => (
  <div>
    {proposal?.status === Status.Open ? (
      <OpenVoting proposal={proposal} hasVoted={hasVoted} />
    ) : proposal?.status === Status.Challenge ? (
      <ChallengePeriodVoting proposal={proposal} hasVoted={hasVoted} />
    ) : (
      <CompletedVoting {...proposal} />
    )}
    {Object.keys(proposal).length > 0 && <CurrentStandings {...proposal} />}
  </div>
);
export default Voting;
