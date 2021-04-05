import { IVote } from 'pages/grants';
import { useEffect } from 'react';
import { useRef } from 'react';
import { Check, Lock } from 'react-feather';
import calculateRemainingVotes from 'utils/calculateRemainingVotes';
import BeneficiaryCard from './BeneficiaryCard';

interface IGrantRound {
  id: string;
  title: string;
  description: string;
  grantTerm: number;
  maxVotes: number;
  isActiveElection: boolean;
  beneficiaries: any[];
  votes?: IVote[];
  assignVotes?: (grantTerm: number, vote: IVote) => void;
  scrollToMe?: boolean;
  quadratic?: boolean;
}

export default function GrantRound({
  id,
  title,
  description,
  grantTerm,
  maxVotes,
  isActiveElection,
  beneficiaries,
  votes,
  assignVotes,
  scrollToMe = false,
  quadratic = false,
}: IGrantRound): JSX.Element {
  const ref = useRef(null);

  useEffect(() => {
    if (ref.current && scrollToMe) {
      ref.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [scrollToMe]);

  return (
    <div ref={ref} className="mb-16 w-full">
      <span className="flex flex-row flex-wrap items-center mb-4">
        <div className="h-8 w-8 mr-2 rounded-full border-4 border-white flex items-center justify-center flex-shrink-0">
          {isActiveElection ? (
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
            <BeneficiaryCard
              key={beneficiary.address}
              address={beneficiary.address}
              title={beneficiary.title}
              description={beneficiary.description}
              totalVotes={beneficiary.totalVotes}
              votesAssignedByUser={
                votes &&
                votes.find((vote) => vote.address === beneficiary.address).votes
              }
              assignVotes={assignVotes}
              maxVotes={
                votes &&
                calculateRemainingVotes(maxVotes, votes) +
                  votes.find((vote) => vote.address === beneficiary.address)
                    .votes
              } //+ beneficiary.votesAssignedByUser
              active={isActiveElection}
              grantTerm={grantTerm}
              quadratic={quadratic}
            />
          ))}
      </div>
    </div>
  );
}
