import { Web3Provider } from "@ethersproject/providers";
import { useWeb3React } from "@web3-react/core";

interface IVoteCounter {
  remainingVotes: number;
  maxVotes: number;
}

export default function VoteCounter({
  remainingVotes,
  maxVotes,
}: IVoteCounter): JSX.Element {
  const context = useWeb3React<Web3Provider>();
  const {
    account,
    active
  } = context;
  if (!active || !account) {
    return <></>;
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
        {remainingVotes} / {maxVotes}
      </p>
    </div>
  );
}
