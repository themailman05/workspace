import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';

interface IVoteSlider {
  id: string;
  totalVotes: number;
  votesAssignedByUser: number;
  maxVotes: number;
  assignVotes?: (id: string, votes: number) => void;
  quadratic: boolean;
}

export default function VoteSlider({
  id,
  totalVotes,
  votesAssignedByUser,
  maxVotes,
  assignVotes,
  quadratic,
}: IVoteSlider): JSX.Element {
  const sliderSteps = [
    [maxVotes * 0.25, '25%'],
    [maxVotes * 0.5, '50%'],
    [maxVotes * 0.75, '75%'],
    [maxVotes, '100%'],
  ];
  const sliderMarks = {};
  sliderSteps.forEach(function (step) {
    sliderMarks[step[0]] = step[1];
  });

  function handleSliderChange(value: number) {
    if (quadratic) {
      assignVotes(id, value ** 2);
    } else {
      assignVotes(id, value);
    }
  }

  return (
    <>
      <span className="flex flex-row justify-between">
        <p className="text-lg font-medium text-gray-700">Votes</p>
        <span className="text-base text-gray-700 flex flex-row">
          <p className="font-medium">{totalVotes}</p>
          <p className="mr-4">
            {votesAssignedByUser > 0 && `+${votesAssignedByUser}`}
          </p>
        </span>
      </span>
      {assignVotes && (
        <div className="w-11/12 ml-1">
          <Slider
            className="mt-2"
            value={votesAssignedByUser}
            onChange={(value) => handleSliderChange(value)}
            min={0}
            max={maxVotes}
            step={1}
            marks={sliderMarks}
          />
        </div>
      )}
    </>
  );
}
