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
import { utils } from 'ethers';
import GrantElectionAdapter from '../../../../packages/contracts/scripts/helpers/GrantElectionAdapter.js';

interface GrantElection {
  id: string;
  startTime: string;
  endTime: string;
  grantTerm: number;
  grantShareType: string;
  awardeesCount: number;
  awardees: string[];
  description: string;
  active: boolean;
}

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
  const { contracts, setContracts } = useContext(ContractsContext);
  const [maxVotes, setMaxVotes] = useState<number>(0);
  const [votes, setVotes] = useState<any[]>([]);
  const [activeGrantElections, setActiveGrantElections] = useState<
    GrantElection[]
  >([]);
  const [closedGrantElections, setClosedGrantElections] = useState<
    GrantElection[]
  >([]);
  const [beneficiaries, setBeneficiaries] = useState([]);
  const [activeGrantRound, scrollToGrantRound] = useState<string>();
  const [grantRoundFilter, setGrantRoundFilter] = useState<IGrantRoundFilter>({
    active: true,
    closed: true,
  });

  useEffect(() => {
    if (!active) {
      activate(connectors.Network);
    }
  }, [active]);

  useEffect(() => {
    if (!contracts) {
      return;
    }
    if (account) {
      /* contracts?.pop?.balanceOf(account);
      contracts?.staking
        ?.getVoiceCredits(account)
        .then((res) => setMaxVotes(Number(utils.formatEther(res)))); */
    }
    GrantElectionAdapter.GrantElectionAdapter(contracts?.election)
      .getElectionMetadata(1)
      .then((res) => console.log(res));
  }, [contracts]);

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
      <div className="w-10/12 mx-auto">
        {[...activeGrantElections, ...closedGrantElections]
          .filter(
            (election) =>
              (election.active && grantRoundFilter.active) ||
              (!election.active && grantRoundFilter.closed),
          )
          .sort(
            (election1, election2) =>
              Number(election2.startTime) - Number(election1.startTime),
          )
          .map((election) => (
            <ElectionSection
              key={election.id}
              id={election.id}
              title={createElectionName(election)}
              description={election.description}
              grantTerm={election.grantTerm}
              isActiveElection={election.active}
              beneficiaries={beneficiaries}
              maxVotes={maxVotes}
              votes={election.active ? votes[election.grantTerm] : null}
              grantRounds={createGrantRounds(activeElections, closedElections)}
              isWalletConnected={library?.connection?.url === 'metamask'}
              grantRoundFilter={grantRoundFilter}
              assignVotes={assignVotes}
              connectWallet={connectWallet}
              submitVotes={submitVotes}
              scrollToGrantRound={scrollToGrantRound}
              setGrantRoundFilter={setGrantRoundFilter}
              scrollToMe={election.id === activeGrantRound}
              quadratic={false}
            />
          ))}
      </div>
    </div>
  );
}
