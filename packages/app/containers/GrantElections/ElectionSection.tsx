import GrantRound from '../../components/Grants/GrantRound';
import Sidebar from '../../components/Sidebar/Sidebar';
import { IGrantRoundFilter, PendingVotes, Vote } from 'pages/grant-elections/[type]';
import { Dispatch } from 'react';
import { ElectionMetadata } from '../../../utils/src/Contracts/GrantElection/GrantElectionAdapter';

interface IElectionSection {
  id: number;
  election: ElectionMetadata,
  voiceCredits: number;
  isWalletConnected: boolean;
  grantRoundFilter: IGrantRoundFilter;
  pendingVotes: PendingVotes;
  assignVotes: (grantTerm: number, vote: Vote) => void;
  connectWallet: () => void;
  submitVotes: Function;
  scrollToGrantRound: (grantId: number) => void;
  setGrantRoundFilter: Dispatch<IGrantRoundFilter>;
  scrollToMe: boolean;
  userIsEligibleBeneficiary?: boolean;
  registerForElection: (grant_term: number) => void;
  alreadyRegistered: boolean;
}


export default function ElectionSection({
  election,
  voiceCredits,
  isWalletConnected,
  submitVotes,
  pendingVotes,
  assignVotes,
  connectWallet,
  scrollToGrantRound,
  scrollToMe,
  userIsEligibleBeneficiary,
  registerForElection,
  alreadyRegistered,
}: IElectionSection): JSX.Element {
  return (
    <div className="flex flex-row">
      <div className="top-10 w-2/12 h-full sticky">
        <Sidebar
          pendingVotes={pendingVotes}
          election={election}
          voiceCredits={voiceCredits}
          isWalletConnected={isWalletConnected}
          connectWallet={connectWallet}
          submitVotes={submitVotes}
          scrollToGrantRound={scrollToGrantRound}
        />
      </div>
      <div className="w-10/12 mb-16">
        <GrantRound
          election={election}
          pendingVotes={pendingVotes}
          voiceCredits={voiceCredits}
          assignVotes={assignVotes}
          scrollToMe={scrollToMe}
          userIsEligibleBeneficiary={userIsEligibleBeneficiary}
          registerForElection={registerForElection}
          alreadyRegistered={alreadyRegistered}
        />
      </div>
    </div>
  );
}
