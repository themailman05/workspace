import GrantRound from './GrantRound';
import Sidebar from './Sidebar/Sidebar';
import { IGrantRound } from './Sidebar/GrantRoundLink';
import { IGrantRoundFilter, IVote } from 'pages/grants';
import { Dispatch } from 'react';

interface IElectionSection {
  id: string;
  title: string;
  description: string;
  grantTerm: number;
  isActiveElection: boolean;
  beneficiaries: any[];
  maxVotes: number;
  votes?: IVote[];
  grantRounds: IGrantRound[];
  isWalletConnected: boolean;
  grantRoundFilter: IGrantRoundFilter;
  assignVotes: (grantTerm: number, vote: IVote) => void;
  connectWallet: () => void;
  submitVotes: () => void;
  scrollToGrantRound: (grantId: string) => void;
  setGrantRoundFilter: Dispatch<IGrantRoundFilter>;
  scrollToMe: boolean;
  quadratic: boolean;
}

export default function ElectionSection({
  id,
  title,
  description,
  grantTerm,
  isActiveElection,
  beneficiaries,
  maxVotes,
  votes,
  grantRounds,
  isWalletConnected,
  grantRoundFilter,
  assignVotes,
  connectWallet,
  submitVotes,
  scrollToGrantRound,
  setGrantRoundFilter,
  scrollToMe,
  quadratic,
}: IElectionSection): JSX.Element {
  return (
    <div className="flex flex-row">
      <div className="top-10 w-2/12 h-full sticky">
        <Sidebar
          votes={votes}
          maxVotes={maxVotes}
          grantRounds={grantRounds}
          isWalletConnected={isWalletConnected}
          grantTerm={grantTerm}
          grantRoundFilter={grantRoundFilter}
          isActiveElection={isActiveElection}
          connectWallet={connectWallet}
          submitVotes={submitVotes}
          scrollToGrantRound={scrollToGrantRound}
          setGrantRoundFilter={setGrantRoundFilter}
        />
      </div>
      <div className="w-10/12 mb-16">
        <GrantRound
          id={id}
          title={title}
          description={description}
          grantTerm={grantTerm}
          isActiveElection={isActiveElection}
          beneficiaries={beneficiaries}
          assignVotes={assignVotes}
          votes={votes}
          maxVotes={maxVotes}
          scrollToMe={scrollToMe}
          quadratic={quadratic}
        />
      </div>
    </div>
  );
}
