interface IVoteCounter {
  remainingVotes: number;
  maxVotes: number;
}

export default function VoteCounter({
  remainingVotes,
  maxVotes,
}: IVoteCounter): JSX.Element {
  return (
    <div className="w-full h-24 bg-white border border-gray-400 rounded-lg p-3 mb-2">
      <p className="font-medium text-gray-700">Your Votes</p>
      <p className="text-center text-2xl font-bold text-gray-700">
        {remainingVotes} / {maxVotes}
      </p>
    </div>
  );
}
