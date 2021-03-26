import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';

interface IVoteSlider {
  id: string;
  totalVotes: number;
  votesAssignedByUser: number;
  maxVotes: number;
  assignVotes: (id: string, votes: number) => void;
}

export default function VoteSlider({
  id,
  totalVotes,
  votesAssignedByUser,
  maxVotes,
  assignVotes,
}: IVoteSlider): JSX.Element {
  return (
    <>
      <span className="flex flex-row justify-between">
        <p className="text-lg font-medium text-gray-700">Votes</p>
        <span className="text-base text-gray-700 flex flex-row">
          <p className="font-medium">{totalVotes}</p>
          <p className="">
            {votesAssignedByUser > 0 && `+${votesAssignedByUser}`}
          </p>
        </span>
      </span>
      <Slider
        className="mt-2"
        value={votesAssignedByUser}
        onChange={(val) => assignVotes(id, val)}
        min={0}
        max={maxVotes}
        step={1}
      />
    </>
  );
}
