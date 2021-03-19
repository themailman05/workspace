import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';
import GrantFunded from './GrantFunded';
import VoteSlider from './VoteSlider';

interface IGrantCard {
  id: string;
  title: string;
  description: string;
  totalVotes: number;
  votesAssignedByUser?: number;
  assignVotes?: (id: string, votes: number) => void;
  remainingVotes?: number;
  active: boolean;
}

export default function GrantCard({
  id,
  title,
  description,
  totalVotes,
  votesAssignedByUser,
  assignVotes,
  remainingVotes,
  active,
}: IGrantCard): JSX.Element {
  console.log(votesAssignedByUser);
  return (
    <div className="bg-white shadow-sm w-80 h-100 rounded-lg">
      <div className="w-full h-28 bg-red-300 rounded-t-lg" />
      <div className="w-full px-4 pb-3">
        <div className="h-14 mt-3">
          <h3 className="text-lg font-bold text-gray-700 leading-snug">
            {title}
          </h3>
        </div>
        <div className="h-36">
          <p className="text-sm text-gray-500">{description}</p>
        </div>
        <div className="">
          {active ? (
            <VoteSlider
              id={id}
              totalVotes={totalVotes}
              votesAssignedByUser={votesAssignedByUser}
              assignVotes={assignVotes}
              remainingVotes={remainingVotes}
            />
          ) : (
            <GrantFunded votes={totalVotes} />
          )}
        </div>
      </div>
    </div>
  );
}
