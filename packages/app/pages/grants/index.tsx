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

const GRANT_TERM = { MONTH: 0, QUARTER: 1, YEAR: 2 };
//Quadratic Voting for assigning Votes

//GET OPEN ELECTION
//????

//GET ACTIVE GRANTS (closed elections and still recieves money)
//get ipfs hashes from the BeneficiaryRegistry with the previous Data
//get data from ipfs with those hashes

const demoGrants = [
  {
    id: '0',
    title: 'Handshake Development Fund (Panvala League)',
    description:
      "Handshake is a completely community-run decentralized blockchain built to dismantle ICANN's monopoly on top-level domains (.com, .net, .org, etc. are all top-level domains controlled by ICANN, who charges an $185,000 evaluation fee.",
    totalVotes: 40,
    votesAssignedByUser: 10,
  },
  {
    id: '1',
    title: 'Handshake',
    description:
      "Handshake is a completely community-run decentralized blockchain built to dismantle ICANN's monopoly on top-level domains (.com, .net, .org, etc. are all top-level domains controlled by ICANN, who charges an $185,000 evaluation fee.",
    totalVotes: 40,
    votesAssignedByUser: 0,
  },
  {
    id: '2',
    title: 'Handshake Development Fund (Panvala League)',
    description:
      "Handshake is a completely community-run decentralized blockchain built to dismantle ICANN's monopoly on top-level domains (.com, .net, .org, etc. are all top-level domains controlled by ICANN, who charges an $185,000 evaluation fee.",
    totalVotes: 40,
    votesAssignedByUser: 0,
  },
  {
    id: '3',
    title: 'Handshake Development Fund (Panvala League)',
    description:
      "Handshake is a completely community-run decentralized blockchain built to dismantle ICANN's monopoly on top-level domains (.com, .net, .org, etc. are all top-level domains controlled by ICANN, who charges an $185,000 evaluation fee.",
    totalVotes: 40,
    votesAssignedByUser: 0,
  },
  {
    id: '4',
    title: 'Handshake',
    description:
      "Handshake is a completely community-run decentralized blockchain built to dismantle ICANN's monopoly on top-level domains (.com, .net, .org, etc. are all top-level domains controlled by ICANN, who charges an $185,000 evaluation fee.",
    totalVotes: 40,
    votesAssignedByUser: 0,
  },
  {
    id: '5',
    title: 'Handshake Development Fund (Panvala League)',
    description:
      "Handshake is a completely community-run decentralized blockchain built to dismantle ICANN's monopoly on top-level domains (.com, .net, .org, etc. are all top-level domains controlled by ICANN, who charges an $185,000 evaluation fee.",
    totalVotes: 40,
    votesAssignedByUser: 0,
  },
  {
    id: '6',
    title: 'Handshake Development Fund (Panvala League)',
    description:
      "Handshake is a completely community-run decentralized blockchain built to dismantle ICANN's monopoly on top-level domains (.com, .net, .org, etc. are all top-level domains controlled by ICANN, who charges an $185,000 evaluation fee.",
    totalVotes: 40,
    votesAssignedByUser: 0,
  },
];

const GrantRegistryData = [
  {
    startTime: '',
    endTime: '',
    grantTerm: 0,
    grantShareType: '',
    awardeesCount: 4,
    awardees: ['0', '1', '2', '3'],
  },
  {
    startTime: '',
    endTime: '',
    grantTerm: 1,
    grantShareType: '',
    awardeesCount: 3,
    awardees: ['4', '5', '6'],
  },
  {
    startTime: '',
    endTime: '',
    grantTerm: 2,
    grantShareType: '',
    awardeesCount: 1,
    awardees: ['4'],
  },
];

export default function Test() {
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
  const [activeGrants, setActiveGrants] = useState([]);
  const [grantRegistry, setGrantRegistry] = useState<Contract>();
  const [beneficiaryRegistry, setBeneficiaryRegistry] = useState<Contract>();
  const [activeGrantRound, scrollToGrantRound] = useState<string>();

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
    if (grantRegistry && beneficiaryRegistry) {
      grantRegistry
        .getActiveGrant(GRANT_TERM.QUARTER)
        .then((activeGrant) => console.log('active Grant', activeGrant));
      grantRegistry
        .getActiveAwardees(GRANT_TERM.QUARTER)
        .then((activeAwardees) =>
          console.log('active Awardees', activeAwardees),
        );
      beneficiaryRegistry
        .getBeneficiary('0x70997970C51812dc3A010C7d01b50e0d17dc79C8')
        .then((res) => console.log('beneficiary', res));
    }
    //TODO get data from ipfs
    setActiveGrants(demoGrants);
    setMaxVotes(550);
    setRemainingVotes(540);
  }, [grantRegistry, beneficiaryRegistry]);

  useEffect(() => {
    if (activeGrants.length) {
      setRemainingVotes(
        (prevState) =>
          maxVotes -
          activeGrants.reduce(
            (accumulator, currentValue) =>
              accumulator + currentValue.votesAssignedByUser,
            0,
          ),
      );
    }
  }, [activeGrants]);

  function connectWallet() {
    activate(connectors.Injected);
  }

  function submitVotes() {}

  function assignVotes(id: string, votes: number): void {
    const activeGrantsCopy = [...activeGrants];
    const grantIndex = activeGrantsCopy.findIndex((grant) => grant.id === id);
    const updatedGrant = {
      ...activeGrantsCopy.find((grant) => grant.id === id),
      votesAssignedByUser: votes,
    };
    activeGrantsCopy.splice(grantIndex, 1, updatedGrant);
    setActiveGrants(activeGrantsCopy);
  }

  return (
    <div className="w-screen">
      <header className="w-full h-10 bg-white"></header>
      <div className="w-screen flex flex-row mt-4">
        <div className="w-2/12 flex flex-col items-center">
          <Sidebar
            remainingVotes={remainingVotes}
            maxVotes={maxVotes}
            grantRounds={[
              {
                name: 'Quaterly',
                address: '0',
                active: true,
                year: 2021,
              },
              {
                name: 'Monthly',
                address: '1',
                active: false,
                year: 2021,
              },
              {
                name: 'Yearly',
                address: '2',
                active: false,
                year: 2020,
              },
            ]}
            isWalletConnected={library?.connection?.url === 'metamask'}
            connectWallet={connectWallet}
            submitVotes={submitVotes}
            scrollToGrantRound={scrollToGrantRound}
          />
        </div>
        <div className="w-10/12 flex flex-col">
          <GrantRound
            id="2021"
            title="Yearly Grant - 2021"
            description="DescriptionText"
            active={true}
            grants={activeGrants}
            assignVotes={assignVotes}
            remainingVotes={remainingVotes}
            scrollTo={false} //{grantRound.address === activeGrantRound}
          />
        </div>
      </div>
    </div>
  );
}
