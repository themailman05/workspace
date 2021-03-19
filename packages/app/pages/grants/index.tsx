import { Check, Lock } from 'react-feather';
import { useState } from 'react';
import { useEffect } from 'react';
import Sidebar from '../../containers/Grants/SideBar';
import GrantRound from 'containers/Grants/GrantRound';

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
  const [maxVotes, setMaxVotes] = useState(0);
  const [remainingVotes, setRemainingVotes] = useState(0);
  const [activeGrants, setActiveGrants] = useState([]);

  useEffect(() => {
    setMaxVotes(550);
    setActiveGrants(demoGrants);
    setRemainingVotes(540);
  }, []);

  useEffect(() => {
    if (activeGrants.length && remainingVotes > 0) {
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
