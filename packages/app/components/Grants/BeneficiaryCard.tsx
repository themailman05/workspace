import GrantFunded from './GrantFunded';
import VoteSlider from './VoteSlider';
import Link from 'next/link';
import { IVote } from 'pages/grants';

interface IBeneficiaryCard {
  address: string;
  title: string;
  description: string;
  grantTerm: number;
  totalVotes: number;
  active: boolean;
  votesAssignedByUser?: number;
  assignVotes?: (grantTerm: number, vote: IVote) => void;
  maxVotes?: number;
  quadratic: boolean;
}

export default function BeneficiaryCard({
  address,
  title,
  description,
  totalVotes,
  active,
  grantTerm,
  votesAssignedByUser,
  assignVotes,
  maxVotes,
  quadratic,
}: IBeneficiaryCard): JSX.Element {
  return (
    <div
      className="shadow-sm w-80 h-100 rounded-lg mr-6 mb-6"
      style={{
        background: 'rgba(255, 255, 255, .5)',
        backdropFilter: 'blur(10px)',
      }}
    >
      <Link href={`beneficiary/${address}`} passHref>
        <a>
          <div className="w-full h-28 rounded-t-lg" />
        </a>
      </Link>
      <div className="w-full px-4 pb-3">
        <div className="h-14 mt-3">
          <Link href={`beneficiary/${address}`} passHref>
            <a>
              <h3 className="text-lg font-bold text-gray-800 leading-snug">
                {title}
              </h3>
            </a>
          </Link>
        </div>
        <div className="h-36">
          <Link href={`beneficiary/${address}`} passHref>
            <a>
              <p className="text-sm text-gray-700">{description}</p>
            </a>
          </Link>
        </div>
        <div className="">
          {active ? (
            <VoteSlider
              address={address}
              totalVotes={totalVotes}
              votesAssignedByUser={votesAssignedByUser}
              assignVotes={assignVotes}
              maxVotes={maxVotes}
              grantTerm={grantTerm}
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
