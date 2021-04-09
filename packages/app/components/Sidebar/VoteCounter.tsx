import { PendingVotes } from '../../pages/grant-elections/[type]';
import { ElectionMetadata } from '../../../utils/src/Contracts/GrantElection/GrantElectionAdapter';

interface VoteCounter {
  election: ElectionMetadata;
  pendingVotes: PendingVotes;
  maxVotes: number;
  voiceCredits: number;
}

export default function VoteCounter({
  election,
  pendingVotes,
  maxVotes,
  voiceCredits,
}: VoteCounter): JSX.Element {
  if (!voiceCredits) {
    return (
    <figure className="bg-gray-100 rounded-xl p-6 mb-8">
        <div className="pt-6 space-y-4">
          <blockquote>
            <p className="text-lg font-semibold">
            🚀 
            </p>
            <p className="text-md">Grant elections are currently active! </p>
          </blockquote>
          <figcaption>
            <div>
            Vote for your favorite organizations to receive funding!
          </div>
          </figcaption>
        </div>
       </figure>);
  }
  return (
      <div
        className="w-full h-24 rounded-lg p-3 mb-2"
        style={{
          background: 'rgba(255, 255, 255, .5)',
          backdropFilter: 'blur(10px)',
        }}
      >
        <p className="font-medium text-gray-800">Your Votes</p>
        <p className="text-center text-2xl font-bold text-gray-800">
          {pendingVotes[election.electionTerm].total} / {maxVotes}
        </p>
      </div>
  );
}
