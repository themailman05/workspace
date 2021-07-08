import {
  BeneficiaryMap,
  BeneficiaryRegistryAdapter,
  IpfsClient,
} from '@popcorn/utils';
import { ElectionMetadata } from '@popcorn/utils/Contracts';
import { ContractsContext } from 'context/Web3/contracts';
import { BigNumber, utils } from 'ethers';
import { PendingVotes, Vote, Votes } from 'pages/grant-elections/[type]';
import { useContext, useEffect, useRef, useState } from 'react';
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
  const [beneficiaryApplicationMap, setBeneficiaryApplicationMap] =
    useState<BeneficiaryMap[]>();
  const { contracts } = useContext(ContractsContext);
  useEffect(() => {
    if (election) {
      setVotes(convertBlockchainVotesToVoiceCredits(election));
    }
  }, [election]);

  useEffect(() => {
    if (votes && election && contracts) {
      BeneficiaryRegistryAdapter(contracts.beneficiary, IpfsClient)
        .getBeneficiaryApplicationMap(election.registeredBeneficiaries)
        .then((beneficiaryApplicationMap) =>
          setBeneficiaryApplicationMap(beneficiaryApplicationMap),
        );
    }
  }, [votes, election, contracts]);

  useEffect(() => {
    if (ref.current && scrollToMe) {
      ref.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [scrollToMe]);
  return (
    election && (
      <div
        ref={ref}
        className="mb-16 w-full flex flex-row flex-wrap items-center"
      >
        {beneficiaryApplicationMap?.map(
          ({ address, beneficiaryApplication }) => (
            <BeneficiaryCard
              key={address}
              electionProps={{
                election: election,
                pendingVotes: pendingVotes,
                voiceCredits: voiceCredits,
                votesAssignedByUser: 0,
                assignVotes: assignVotes,
                totalVotes: votes[address],
              }}
              address={address}
              beneficiary={beneficiaryApplication}
            />
          ),
        )}
      </div>
    )
  );
}
