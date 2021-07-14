import { BeneficiaryApplication } from '@popcorn/utils';
import { ElectionMetadata } from '@popcorn/utils/Contracts';
import { BigNumber, utils } from 'ethers';
import { PendingVotes, Vote, Votes } from 'pages/grant-elections/[type]';
import { useEffect, useRef, useState } from 'react';
import beneficiariesHashMap from '../../fixtures/beneficiaries.json';
import BeneficiaryCard from '../Beneficiaries/BeneficiaryCard';

interface IGrantRound {
  voiceCredits: number;
  votes?: Vote[];
  assignVotes?: (grantTerm: number, vote: Vote) => void;
  scrollToMe?: boolean;
  pendingVotes: PendingVotes;
  election?: ElectionMetadata;
}

const convertBlockchainVotesToVoiceCredits = (
  election: ElectionMetadata,
): Votes => {
  return election.votes.reduce(
    (votes, vote) => {
      votes[vote.beneficiary] = Number(
        utils.formatEther(BigNumber.from(vote.weight).pow(2)),
      ).toFixed(0);
      return votes;
    },
    { total: 0 },
  );
};

export default function GrantRound({
  voiceCredits,
  assignVotes,
  pendingVotes,
  election,
  scrollToMe = false,
}: IGrantRound): JSX.Element {
  const ref = useRef(null);
  const [votes, setVotes] = useState<Votes>({ total: 0 });
  const [beneficiariesWithMetadata, setBeneficiaries] = useState<
    BeneficiaryApplication[]
  >([]);

  useEffect(() => {
    if (election) {
      setVotes(convertBlockchainVotesToVoiceCredits(election));
    }
  }, [election]);

  const getBeneficiary = (address: string): BeneficiaryApplication => {
    const beneficiary =
      beneficiariesHashMap[process.env.CHAIN_ID || '31337'][
        address.toLowerCase()
      ];
    return beneficiary;
  };

  useEffect(() => {
    if (votes && election) {
      setBeneficiaries(
        election.registeredBeneficiaries.map((address) =>
          getBeneficiary(address),
        ),
      );
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
    <ul
      ref={ref}
      className="sm:grid sm:grid-cols-2 gap-x-2 gap-y-12 lg:grid-cols-3 mx-36"
    >
      {beneficiariesWithMetadata?.map((beneficiary) => (
        <BeneficiaryCard
          key={beneficiary.beneficiaryAddress}
          electionProps={{
            election: election,
            pendingVotes: pendingVotes,
            voiceCredits: voiceCredits,
            votesAssignedByUser: 0,
            assignVotes: assignVotes,
            totalVotes: votes[beneficiary.beneficiaryAddress],
          }}
          beneficiary={beneficiary}
        />
      ))}
    </ul>
  );
}
