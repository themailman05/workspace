import { Proposal } from '@popcorn/utils';

export interface VotingProps {
  proposal: Proposal;
  hasVoted?: boolean;
}
