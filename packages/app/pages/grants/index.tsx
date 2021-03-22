import { useState } from 'react';
import { useEffect } from 'react';
import { useWeb3React } from '@web3-react/core';
import Sidebar from '../../containers/Grants/Sidebar';
import GrantRound from 'containers/Grants/GrantRound';
import { JsonRpcSigner, Web3Provider } from '@ethersproject/providers';
import { connectors } from '../../containers/Web3/connectors';
import { Contract } from '@ethersproject/contracts';
import GrantRegistryAbi from '../../../contracts/artifacts/contracts/GrantRegistry.sol/GrantRegistry.json';
import BeneficiaryRegistryAbi from '../../../contracts/artifacts/contracts/BeneficiaryRegistry.sol/BeneficiaryRegistry.json';

//Quadratic Voting for assigning Votes

//GET OPEN ELECTION
//????

//GET ACTIVE GRANTS (closed elections and still recieves money)
//call getActiveGrants in GrantRegistry
//call getActiveAwardees with the grantterms from before
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
    grantTerm: '',
    grantShareType: '',
    awardeesCount: '',
    awardees: [''],
  },
  {
    startTime: '',
    endTime: '',
    grantTerm: '',
    grantShareType: '',
    awardeesCount: '',
    awardees: [''],
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
    setGrantRegistry(
      //TODO swap the hardhat addresses with the mainnet
      new Contract(
        '0xe7f1725e7734ce288f8367e1bb143e90bb3f0512',
        GrantRegistryAbi.abi,
        library,
      ),
    );
    setBeneficiaryRegistry(
      //TODO swap the hardhat addresses with the mainnet
      new Contract(
        '0x5fbdb2315678afecb367f032d93f642f64180aa3',
        BeneficiaryRegistryAbi.abi,
        library,
      ),
    );
  }, [library]);

  useEffect(() => {
    const activeGrant = grantRegistry.getActiveGrant();
    const activeAwardees = grantRegistry.getActiveAwardees(activeGrant[2]);
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
            isWalletConnected={library?.connection?.url === 'metamask'}
            connectWallet={connectWallet}
            submitVotes={submitVotes}
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
          />
        </div>
      </div>
    </div>
  );
}
