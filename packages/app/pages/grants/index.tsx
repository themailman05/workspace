import { useContext, useState } from 'react';
import { useEffect } from 'react';
import { useWeb3React } from '@web3-react/core';
import { Web3Provider } from '@ethersproject/providers';
import { connectors } from '../../containers/Web3/connectors';
import activeElections from '../../fixtures/activeElections.json';
import closedElections from '../../fixtures/closedElections.json';
import createGrantRounds from 'utils/createGrantRounds';
import ElectionSection from 'containers/GrantElections/ElectionSection';
import createElectionName from 'utils/createElectionName';
import NavBar from './../../containers/NavBar/NavBar';
import { ContractsContext } from '../../app/contracts';
import { GrantElectionAdapter, ElectionMetadata, ElectionState, ElectionTerm } from "@popcorn/utils/Contracts";
import { utils } from 'ethers';


export interface IGrantRoundFilter {
  active: boolean;
  closed: boolean;
}

export interface IVote {
  address: string;
  votes: number;
}

export interface IElectionVotes {
  votes: IVote[];
}

export default function GrantOverview() {
  const context = useWeb3React<Web3Provider>();
  const {
    connector,
    library,
    chainId,
    account,
    activate,
    deactivate,
    active,
    error,
  } = context;
  const { contracts } = useContext(ContractsContext);
  const [maxVotes, setMaxVotes] = useState<number>(0);
  const [votes, setVotes] = useState<any[]>([]);
  const [grantElections, setGrantElections] = useState<
  ElectionMetadata[]
  >([]);

  const [beneficiaries, setBeneficiaries] = useState([]);
  const [activeGrantRound, scrollToGrantRound] = useState<number>();
  const [grantRoundFilter, setGrantRoundFilter] = useState<IGrantRoundFilter>({
    active: true,
    closed: true,
  });

  const getElectionMetadata = async () => {
    const monthly = await GrantElectionAdapter(contracts?.election)
      .getElectionMetadata(0);
    const quarterly = await GrantElectionAdapter(contracts?.election).getElectionMetadata(1);
    const yearly = await GrantElectionAdapter(contracts?.election).getElectionMetadata(2);
    setGrantElections([monthly, quarterly, yearly]);
  }

  const getVoiceCredits = async (account) => {
    if (!account) return;
    const maxVotes = await contracts.staking.getVoiceCredits(account);
    setMaxVotes(+utils.formatEther(maxVotes).toString().split('.')[0]);
  }

  useEffect(() => {
    if (!contracts) {
      return;
    }
    getElectionMetadata();
    getVoiceCredits(account);

  }, [contracts, account]);

  useEffect(() => {
    if (!grantRoundFilter.active && !grantRoundFilter.closed) {
      setGrantRoundFilter({ active: true, closed: true });
    }
  }, [grantRoundFilter]);

  function connectWallet() {
    activate(connectors.Injected);
  }

  function assignVotes(grantTerm: number, vote: IVote): void {
    const votesCopy = [...votes];
    const updatedElection = [
      ...votesCopy[grantTerm].filter(
        (awardee) => awardee.address !== vote.address,
      ),
      vote,
    ];
    votesCopy.splice(grantTerm, 1, updatedElection);
    setVotes(votesCopy);
  }

  function submitVotes() {
    console.log('SUBMIT VOTES');
    console.log(
      votes.map((election) =>
        election.map((awardee) => [awardee.address, awardee.votes]),
      ),
    );
    console.log('__________________');
  }

  return (
    <div className="w-full">
      <NavBar />
      <div className="w-10/12 mx-auto mt-8">
        {[...grantElections]
          .filter(
            (election) =>
              (GrantElectionAdapter().isActive(election) && grantRoundFilter.active) ||
              (!GrantElectionAdapter().isActive(election) && grantRoundFilter.closed),
          )
          .sort(
            (election1, election2) =>
              Number(election2.startTime) - Number(election1.startTime),
          )
          .map((election) => (
            <ElectionSection
              key={election?.electionTerm}
              id={election?.electionTerm}
              title={createElectionName(election)}
              description={''}
              grantTerm={election?.electionTerm}
              isActiveElection={GrantElectionAdapter().isActive(election)}
              beneficiaries={election?.registeredBeneficiaries}
              maxVotes={maxVotes}
              votes={GrantElectionAdapter().isActive(election) ? votes[election.electionTerm] : null}
              grantRounds={createGrantRounds(activeElections, closedElections)}
              isWalletConnected={library?.connection?.url === 'metamask'}
              grantRoundFilter={grantRoundFilter}
              assignVotes={assignVotes}
              connectWallet={connectWallet}
              submitVotes={submitVotes}
              scrollToGrantRound={scrollToGrantRound}
              setGrantRoundFilter={setGrantRoundFilter}
              scrollToMe={election.electionTerm === activeGrantRound}
              quadratic={false}
            />
          ))}
      </div>
    </div>
  );
}
