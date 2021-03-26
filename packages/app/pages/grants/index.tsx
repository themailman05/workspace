import { useState } from 'react';
import { useEffect } from 'react';
import { useWeb3React } from '@web3-react/core';
import Sidebar from '../../containers/Grants/Sidebar/Sidebar';
import GrantRound from 'containers/Grants/GrantRound';
import { JsonRpcSigner, Web3Provider } from '@ethersproject/providers';
import { connectors } from '../../containers/Web3/connectors';
import { Contract } from '@ethersproject/contracts';
import GrantRegistryAbi from '../../../contracts/artifacts/contracts/GrantRegistry.sol/GrantRegistry.json';
import BeneficiaryRegistryAbi from '../../../contracts/artifacts/contracts/BeneficiaryRegistry.sol/BeneficiaryRegistry.json';
import beneficiaryFixture from '../../fixtures/beneficiaries.json';
import activeElections from '../../fixtures/activeElections.json';
import closedElections from '../../fixtures/closedElections.json';

const GRANT_TERM = { MONTH: 0, QUARTER: 1, YEAR: 2 };

interface GrantElection {
  startTime: string;
  endTime: string;
  grantTerm: number;
  grantShareType: string;
  awardeesCount: number;
  awardees: string[];
  description: string;
}

export interface IGrantRoundFilter {
  active: boolean;
  closed: boolean;
}

function createGrantElectionName(election) {
  const grantTerm = ['Monthly', 'Quaterly', 'Yearly'];
  const startDate = new Date(Number(election.startTime) * 1000);
  return `${grantTerm[election.grantTerm]} - ${
    startDate.getMonth() + 1
  }/${startDate.getFullYear()}`;
}

function createGrantRounds(activeElections, closedElections) {
  const activeGrantRound = activeElections.map((election) => ({
    name: createGrantElectionName(election),
    id: `active-${election.grantTerm}-${election.startTime}`,
    active: true,
    year: new Date(Number(election.startTime) * 1000).getFullYear(),
  }));
  const closedGrantRound = closedElections.map((election) => ({
    name: createGrantElectionName(election),
    id: `closed-${election.grantTerm}-${election.startTime}`,
    active: false,
    year: new Date(Number(election.startTime) * 1000).getFullYear(),
  }));
  return [...activeGrantRound, ...closedGrantRound];
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
  const [remainingVotes, setRemainingVotes] = useState<number>(0);
  const [activeGrantElections, setActiveGrantElections] = useState([]);
  const [closedGrantElections, setClosedGrantElections] = useState([]);
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
      activeElections.map((election) => ({ ...election, active: true })),
    );
    setClosedGrantElections(
      closedElections.map((election) => ({ ...election, active: false })),
    );
    setBeneficiaries(beneficiaryFixture);
    setMaxVotes(550);
    setRemainingVotes(540);
  }, []);

  useEffect(() => {
    if (!active) {
      activate(connectors.Network);
      if (library?.connection?.url === 'metamask') {
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
    if (library?.connection?.url === 'metamask') {
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
    grantRegistry
      .getActiveGrant(GRANT_TERM.QUARTER)
      .then((activeGrant) => console.log('active Grant', activeGrant));
    grantRegistry
      .getActiveAwardees(GRANT_TERM.QUARTER)
      .then((activeAwardees) => console.log('active Awardees', activeAwardees));
    beneficiaryRegistry
      .getBeneficiary('0x70997970C51812dc3A010C7d01b50e0d17dc79C8')
      .then((res) => console.log('beneficiary', res));
  }, [grantRegistry, beneficiaryRegistry]);

  useEffect(() => {
    /* if (activeGrantElections.length) {
      setRemainingVotes(
        (prevState) =>
          maxVotes -
          activeGrantElections.reduce(
            (accumulator, currentValue) =>
              accumulator + currentValue.votesAssignedByUser,
            0,
          ),
      );
    } */
  }, [activeGrantElections]);

  function connectWallet() {
    activate(connectors.Injected);
  }

  function submitVotes() {}

  function assignVotes(id: string, votes: number): void {
    const activeGrantsCopy = [...activeGrantElections];
    const grantIndex = activeGrantsCopy.findIndex((grant) => grant.id === id);
    const updatedGrant = {
      ...activeGrantsCopy.find((grant) => grant.id === id),
      votesAssignedByUser: votes,
    };
    activeGrantsCopy.splice(grantIndex, 1, updatedGrant);
    setActiveGrantElections(activeGrantsCopy);
  }

  return (
    <div className="w-screen overflow-x-hidden">
      <header className="w-full h-10 bg-white"></header>
      <div className="w-screen flex flex-row mt-4">
        <div className="w-2/12 flex flex-col items-center">
          <Sidebar
            remainingVotes={remainingVotes}
            maxVotes={maxVotes}
            grantRounds={createGrantRounds(activeElections, closedElections)}
            isWalletConnected={library?.connection?.url === 'metamask'}
            connectWallet={connectWallet}
            submitVotes={submitVotes}
            scrollToGrantRound={scrollToGrantRound}
            grantRoundFilter={grantRoundFilter}
            setGrantRoundFilter={setGrantRoundFilter}
          />
        </div>
        <div className="w-10/12 flex flex-col">
          {[...activeGrantElections, ...closedGrantElections]
            .filter(
              (election) =>
                (election.active && grantRoundFilter.active) ||
                (!election.active && grantRoundFilter.closed),
            )
            .sort(
              (election1, election2) =>
                election2.startTime - election1.startTime,
            )
            .map((election) => (
              <GrantRound
                key={`${election.active ? 'active' : 'closed'}-${
                  election.grantTerm
                }-${election.startTime}`}
                id={`${election.active ? 'active' : 'closed'}-${
                  election.grantTerm
                }-${election.startTime}`}
                title={createGrantElectionName(election)}
                description={election.description}
                active={election.active}
                beneficiaries={beneficiaries.filter((beneficiary) =>
                  election.awardees.includes(beneficiary.address),
                )}
                assignVotes={null}
                remainingVotes={remainingVotes}
                scrollTo={
                  createGrantElectionName(election) === activeGrantRound
                }
              />
            ))}
        </div>
      </div>
    </div>
  );
}
