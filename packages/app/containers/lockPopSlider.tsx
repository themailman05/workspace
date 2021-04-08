import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';

interface VoteSlider {
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
}: VoteSlider): JSX.Element {
  return (
    <>
      <span className="flex flex-row justify-between">
        <p className="">POP locked</p>
        <span className="text-base text-gray-500 flex flex-row">
          <p className="">{totalVotes}</p>
          {/* <p className="">
            {votesAssignedByUser}
          </p> */}
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
