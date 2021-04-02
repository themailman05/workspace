import { useState } from 'react';
import { useEffect } from 'react';
import { useWeb3React } from '@web3-react/core';
import Sidebar from '../../containers/Grants/Sidebar/Sidebar';
import GrantRound from 'containers/Grants/GrantRound';
import { JsonRpcSigner, Web3Provider } from '@ethersproject/providers';
import { connectors } from '../../containers/Web3/connectors';
import { Contract } from '@ethersproject/contracts';
import GrantRegistryAbi from '../../abis/GrantRegistry.json';
import BeneficiaryRegistryAbi from '../../abis/BeneficiaryRegistry.json';
import beneficiaryFixture from '../../fixtures/beneficiaries.json';
import activeElections from '../../fixtures/activeElections.json';
import closedElections from '../../fixtures/closedElections.json';
import createGrantRounds from 'utils/createGrantRounds';
import ElectionSection from 'containers/Grants/ElectionSection';
import createElectionName from 'utils/createElectionName';
import getBeneficiariesForElection from 'utils/getBeneficiariesForElection';

const GRANT_TERM = { MONTH: 0, QUARTER: 1, YEAR: 2 };

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
  const [maxVotes, setMaxVotes] = useState<number>(0);
  const [votes, setVotes] = useState<any[]>([]);
  const [activeGrantElections, setActiveGrantElections] = useState<
    GrantElection[]
  >([]);
  const [closedGrantElections, setClosedGrantElections] = useState<
    GrantElection[]
  >([]);
  const [beneficiaries, setBeneficiaries] = useState([]);
  const [grantRegistry, setGrantRegistry] = useState<Contract>();
  const [beneficiaryRegistry, setBeneficiaryRegistry] = useState<Contract>();
  const [activeGrantRound, scrollToGrantRound] = useState<string>();
  const [grantRoundFilter, setGrantRoundFilter] = useState<IGrantRoundFilter>({
    active: true,
    closed: true,
  });

  useEffect(() => {
    //Get Demo Data
    setActiveGrantElections(
      activeElections.map((election) => ({
        ...election,
        id: `active-${election.grantTerm}-${election.startTime}`,
        active: true,
      })),
    );
    setClosedGrantElections(
      closedElections.map((election) => ({
        ...election,
        id: `closed-${election.grantTerm}-${election.startTime}`,
        active: false,
      })),
    );
    setBeneficiaries(beneficiaryFixture);
    setMaxVotes(550);
    const tempVotes = [[], [], []];
    activeElections.forEach(
      (election) =>
        (tempVotes[election.grantTerm] = election.awardees.map((awardee) => ({
          address: awardee,
          votes: 0,
        }))),
    );
    setVotes(tempVotes);
  }, []);

  useEffect(() => {
    if (!active) {
      activate(connectors.Network);
      if (library?.connection?.url === 'metamask' && chainId === 31337) {
        //TODO get pop -> to tell the user to either lock them or buy some
        //TODO get locked pop -> to vote or tell the user to lock pop
        //TODO swap the contract provider to signer so the user can vote
        //grantRegistry.connect(library.getSigner());
      }
    }
  }, [active]);

  useEffect(() => {
    if (!library) {
      return;
    }
    //Infura cant connect to the local network which is why we can instantiate the contracts only with metamask
    if (library?.connection?.url === 'metamask' && chainId === 31337) {
      setGrantRegistry(
        //TODO swap the hardhat addresses with the mainnet
        new Contract(
          '0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9',
          GrantRegistryAbi.abi,
          library,
        ),
      );
      setBeneficiaryRegistry(
        //TODO swap the hardhat addresses with the mainnet
        new Contract(
          '0x5FbDB2315678afecb367f032d93F642f64180aa3',
          BeneficiaryRegistryAbi.abi,
          library,
        ),
      );
    }
  }, [library]);

  useEffect(() => {
    if (!grantRegistry && !beneficiaryRegistry) {
      return;
    }
    //ONLY WORKING WITH DEMO / REAL DATA
    /* grantRegistry
      .getActiveGrant(GRANT_TERM.QUARTER)
      .then((activeGrant) => console.log('active Grant', activeGrant));
    grantRegistry
      .getActiveAwardees(GRANT_TERM.QUARTER)
      .then((activeAwardees) => console.log('active Awardees', activeAwardees));
    beneficiaryRegistry
      .getBeneficiary('0x70997970C51812dc3A010C7d01b50e0d17dc79C8')
      .then((res) => console.log('beneficiary', res)); */
  }, [grantRegistry, beneficiaryRegistry]);

  function connectWallet() {
    activate(connectors.Injected);
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

  function assignVotes(grantTerm: number, vote: IVote): void {
    console.log('grantTerm', grantTerm);
    console.log('vote', vote);
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

  return (
    <div className="w-full">
      <header className="w-full h-10 bg-white mb-8"></header>
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
            beneficiaries={getBeneficiariesForElection(
              beneficiaries,
              election.awardees,
            )}
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
  );
}
