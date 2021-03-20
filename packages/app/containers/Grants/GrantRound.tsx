import { Check, Lock } from 'react-feather';
import GrantCard from './GrantCard';

interface IGrantRound {
  id: string;
  title: string;
  active: boolean;
  grants: any[];
  assignVotes: (id: string, votes: number) => void;
  remainingVotes: number;
}

export default function GrantRound({
  id,
  title,
  active,
  grants,
  assignVotes,
  remainingVotes,
}: IGrantRound): JSX.Element {
  return (
    <>
      <span className="flex flex-row flex-wrap items-center mb-4">
        <div className="h-8 w-8 mr-2 rounded-full border-4 border-white flex items-center justify-center flex-shrink-0">
          {active ? (
            <Check size={20} className="text-white" />
          ) : (
            <Lock size={20} className="text-white" />
          )}
        </div>
        <h2 className="text-3xl font-bold text-white">{title}</h2>
      </span>
      <div className="w-full flex flex-row flex-wrap items-center">
        {grants.length &&
          grants.map((grant) => (
            <GrantCard
              key={grant.id}
              id={grant.id}
              title={grant.title}
              description={grant.description}
              totalVotes={grant.totalVotes}
              votesAssignedByUser={grant.votesAssignedByUser}
              assignVotes={assignVotes}
              maxVotes={remainingVotes + grant.votesAssignedByUser}
              active={active}
            />
          ))}
      </div>
    </>
  );
}
