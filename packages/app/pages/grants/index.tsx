import { useState } from 'react';
import { useEffect } from 'react';
import { useWeb3React } from '@web3-react/core';
import Sidebar from '../../containers/Grants/SideBar';
import GrantRound from 'containers/Grants/GrantRound';
import { Web3Provider } from '@ethersproject/providers';
import { connectors } from '../../containers/Web3/connectors';

//DATASTRUCTURE
//Do Grant rounds hold the indivividual grants
//Or do we get individual grants which contain infos about the grant round?

//Quadratic Voting for assigning Votes

//GET OPEN ELECTION
//????

//GET ACTIVE GRANTS (closed elections and still recieves money)
//call getActiveGrants in GrantRegistry
//call getActiveAwardees with the grantterms from before
//get ipfs hashes from the BeneficiaryRegistry with the previous Data
//get data from ipfs with those hashes

export function useEagerConnect() {
  const { activate, active } = useWeb3React();

  const [tried, setTried] = useState(false);

  useEffect(() => {
    
    connectors.Injected.isAuthorized().then((isAuthorized: boolean) => {
      console.log('authorized')
      if (isAuthorized) {
        activate(connectors.Injected, undefined, true).catch(() => {
          setTried(true);
        });
      } else {
        setTried(true);
      }
    });
  }, []); // intentionally only running on mount (make sure it's only mounted once :))

  // if the connection worked, wait until we get confirmation of that to flip the flag
  useEffect(() => {
    if (!tried && active) {
      setTried(true);
    }
  }, [tried, active]);

  return tried;
}

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
  const [maxVotes, setMaxVotes] = useState(0);
  const [remainingVotes, setRemainingVotes] = useState(0);
  const [activeGrants, setActiveGrants] = useState([]);
  const triedEager = useEagerConnect();
  
  useEffect(() => {
    if (!active) {
      activate(connectors.Network);
    }
  }, [active])

  useEffect(() => {
    library?.getNetwork().then((res) => console.log("getNetwork", res));
  }, [library])
  

  console.log('library', library);

  useEffect(() => {
    setMaxVotes(550);
    setActiveGrants(demoGrants);
    setRemainingVotes(540);
  }, []);

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
          <Sidebar remainingVotes={remainingVotes} maxVotes={maxVotes} />
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
