import { IVote } from 'pages/grant-elections';

export default function calculateRemainingVotes(
  maxVotes: number,
  votes: IVote[] | IVote,
): number {
  return Array.isArray(votes)
    ? maxVotes - votes.reduce((acc, curr) => acc + curr.votes, 0)
    : maxVotes - votes.votes;
}
