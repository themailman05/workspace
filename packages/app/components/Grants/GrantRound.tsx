import { Votes, Vote, PendingVotes } from 'pages/grant-elections/[type]';
import { useEffect, useState } from 'react';
import { useRef } from 'react';
import BeneficiaryCard, { BeneficiaryMetadata } from './BeneficiaryCard';
import beneficiariesHashMap from '../../fixtures/beneficiaries.json';
import { ElectionMetadata, GrantElectionAdapter } from '@popcorn/utils/Contracts';
import createElectionName from 'utils/createElectionName';


interface IGrantRound {
  voiceCredits: number;
  votes?: Vote[];
  assignVotes?: (grantTerm: number, vote: Vote) => void;
  scrollToMe?: boolean;
  pendingVotes: PendingVotes;
  election?: ElectionMetadata;
}

const convertBlockchainVotesToVoiceCredits = (election: ElectionMetadata): Votes => {
  return election.votes.reduce((votes, vote) => {
    votes[vote.beneficiary] = Math.pow(vote.weight, 2)
    return votes;
  }, { total: 0 });
}


export default function GrantRound({
  voiceCredits,
  assignVotes,
  pendingVotes,
  election,
  scrollToMe = false,
}: IGrantRound): JSX.Element {
  const ref = useRef(null);
  const [votes, setVotes] = useState<Votes>({ total: 0 });
  const [beneficiariesWithMetadata, setBeneficiaries] = useState<BeneficiaryMetadata[]>([]);

  useEffect(() => {
    if (election) {
      setVotes(convertBlockchainVotesToVoiceCredits(election));
    }
  }, [election]);

  const getBeneficiary = (address: string, votes): BeneficiaryMetadata => {
    const beneficiary = beneficiariesHashMap[address];
    beneficiary.totalVotes = votes[address];
    return beneficiary;
  }

  useEffect(() => {
    if (votes && election) {
      setBeneficiaries(election.registeredBeneficiaries.map((address) => getBeneficiary(address, votes)))
    }
  }, [votes, election]);


  useEffect(() => {
    if (ref.current && scrollToMe) {
      ref.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [scrollToMe]);
  if (!election) {
    return <></>;
  }

  return (
    <div ref={ref} className="mb-16 w-full">
      <span className="flex flex-row flex-wrap items-center mb-4">
        <div className="h-8 w-8 mr-2 flex items-center justify-center flex-shrink-0">
          {GrantElectionAdapter().isActive(election) ? (
            '🟢'
          ) : (
            '🔒'
          )}
        </div>
        <h2 className="text-3xl font-bold">🏆 {createElectionName(election)}</h2>
      </span>
      <p className="w-10/12">{/* description goes here */}</p>
      <div className="w-full flex flex-row flex-wrap items-center mt-4">
        {
          beneficiariesWithMetadata?.map((beneficiary) => (
            <BeneficiaryCard
              key={beneficiary.address}
              election={election}
              beneficiary={beneficiary}
              pendingVotes={pendingVotes}
              voiceCredits={voiceCredits}
              votesAssignedByUser={0}
              assignVotes={assignVotes}
            />
          ))}
      </div>
    </div>
  );
}
