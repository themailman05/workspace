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
    <div className="w-full">
      <span className="flex flex-row justify-between">
        <p className="text-gray-600">Locked Pop</p>
        <span className="text-gray-600 flex flex-row">
          <p className="">
            {votesAssignedByUser}/{maxVotes}
          </p>
        </span>
      </span>
      <Slider
        className="mt-2 w-10/12"
        value={votesAssignedByUser}
        onChange={(val) => assignVotes(id, val)}
        min={0}
        max={maxVotes}
        step={1}
      />
    </div>
  );
}
