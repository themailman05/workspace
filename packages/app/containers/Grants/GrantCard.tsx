import GrantFunded from './GrantFunded';
import VoteSlider from './VoteSlider';
import Link from 'next/link';
import { Router, useRouter } from 'next/router';

interface IGrantCard {
  address: string;
  title: string;
  description: string;
  totalVotes: number;
  active: boolean;
  grantRoundId: string;
  votesAssignedByUser?: number;
  assignVotes?: (id: string, votes: number) => void;
  maxVotes?: number;
  quadratic: boolean;
}

export default function GrantCard({
  address,
  title,
  description,
  totalVotes,
  active,
  grantRoundId,
  votesAssignedByUser,
  assignVotes,
  maxVotes,
  quadratic,
}: IGrantCard): JSX.Element {
  const router = useRouter();

  return (
    <div className="bg-white shadow-sm w-80 h-100 rounded-lg mr-6 mb-6">
      <Link href={`beneficiary/${address}`} passHref>
        <a>
          <div className="w-full h-28 bg-red-300 rounded-t-lg" />
        </a>
      </Link>
      <div className="w-full px-4 pb-3">
        <div className="h-14 mt-3">
          <Link href={`beneficiary/${address}`} passHref>
            <a>
              <h3 className="text-lg font-bold text-gray-700 leading-snug">
                {title}
              </h3>
            </a>
          </Link>
        </div>
        <div className="h-36">
          <Link href={`beneficiary/${address}`} passHref>
            <a>
              <p className="text-sm text-gray-500">{description}</p>
            </a>
          </Link>
        </div>
        <div className="">
          {active ? (
            <VoteSlider
              id={address}
              totalVotes={totalVotes}
              votesAssignedByUser={votesAssignedByUser}
              assignVotes={assignVotes}
              maxVotes={maxVotes}
              quadratic={quadratic}
            />
          ) : (
            <GrantFunded votes={totalVotes} />
          )}
        </div>
      </div>
    </div>
  );
}
