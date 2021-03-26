import { useEffect } from 'react';
import { useRef } from 'react';
import { Check, Lock } from 'react-feather';
import GrantCard from './GrantCard';

interface IGrantRound {
  id: string;
  title: string;
  description: string;
  active: boolean;
  beneficiaries: any[];
  remainingVotes: number;
  assignVotes?: (id: string, votes: number) => void;
  scrollTo?: boolean;
  quadratic?: boolean;
}

export default function GrantRound({
  id,
  title,
  description,
  active,
  beneficiaries,
  remainingVotes,
  assignVotes,
  scrollTo = false,
  quadratic = false,
}: IGrantRound): JSX.Element {
  const ref = useRef(null);

  useEffect(() => {
    if (ref.current && scrollTo) {
      ref.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [scrollTo]);

  return (
    <div ref={ref} className="mb-16 w-full">
      <span className="flex flex-row flex-wrap items-center mb-4">
        <div className="h-8 w-8 mr-2 rounded-full border-4 border-white flex items-center justify-center flex-shrink-0">
          {active ? (
            <Check size={20} className="text-white" />
          ) : (
            <Lock size={16} className="text-white" />
          )}
        </div>
        <h2 className="text-3xl font-bold text-white">{title}</h2>
      </span>
      <p className="text-white w-10/12">{description}</p>
      <div className="w-full flex flex-row flex-wrap items-center mt-4">
        {beneficiaries.length &&
          beneficiaries.map((beneficiary) => (
            <GrantCard
              key={beneficiary.address}
              address={beneficiary.address}
              title={beneficiary.title}
              description={beneficiary.description}
              totalVotes={beneficiary.totalVotes}
              votesAssignedByUser={beneficiary.votesAssignedByUser}
              assignVotes={assignVotes}
              maxVotes={remainingVotes} //+ beneficiary.votesAssignedByUser
              active={active}
              grantRoundId={id}
              quadratic={quadratic}
            />
          ))}
      </div>
    </div>
  );
}
