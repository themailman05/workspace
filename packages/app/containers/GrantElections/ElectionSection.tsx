import GrantRound from '../../components/Grants/GrantRound';
import Sidebar from '../../components/Sidebar/Sidebar';
import { IGrantRound } from '../../components/Sidebar/GrantRoundLink';
import { IGrantRoundFilter, IVote } from 'pages/grant-elections';
import { Dispatch } from 'react';

interface IElectionSection {
  id: number;
  title: string;
  description: string;
  grantTerm: number;
  isActiveElection: boolean;
  beneficiaries: any[];
  maxVotes: number;
  voiceCredits: number;
  votes?: IVote[];
  grantRounds: IGrantRound[];
  isWalletConnected: boolean;
  grantRoundFilter: IGrantRoundFilter;
  assignVotes: (grantTerm: number, vote: IVote) => void;
  connectWallet: () => void;
  submitVotes: () => void;
  scrollToGrantRound: (grantId: number) => void;
  setGrantRoundFilter: Dispatch<IGrantRoundFilter>;
  scrollToMe: boolean;
  quadratic: boolean;
  userIsEligibleBeneficiary?: boolean;
  registerForElection: (grant_term: number) => void;
  alreadyRegistered: boolean;
}


export default function ElectionSection({
  id,
  title,
  description,
  grantTerm,
  isActiveElection,
  beneficiaries,
  maxVotes,
  voiceCredits,
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
  userIsEligibleBeneficiary,
  registerForElection,
  alreadyRegistered,
}: IElectionSection): JSX.Element {
  return (
    <div className="flex flex-row">
      <div className="top-10 w-2/12 h-full sticky">
        <Sidebar
          votes={votes}
          voiceCredits={voiceCredits}
          maxVotes={maxVotes}
          grantRounds={grantRounds}
          isWalletConnected={isWalletConnected}
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
          voiceCredits={voiceCredits}
          grantTerm={grantTerm}
          isActiveElection={isActiveElection}
          beneficiaries={beneficiaries}
          assignVotes={assignVotes}
          votes={votes}
          maxVotes={maxVotes}
          scrollToMe={scrollToMe}
          quadratic={quadratic}
          userIsEligibleBeneficiary={userIsEligibleBeneficiary}
          registerForElection={registerForElection}
          alreadyRegistered={alreadyRegistered}
        />
      </div>
    </div>
  );
}
