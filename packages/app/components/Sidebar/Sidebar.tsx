import { ElectionMetadata, GrantElectionAdapter } from '@popcorn/utils/Contracts';
import calculateRemainingVotes from 'utils/calculateRemainingVotes';
import ActionButton from './ActionButton';
import VoteCounter from './VoteCounter';
import { PendingVotes } from '../../pages/grant-elections/[type]';

interface ISideBar {
  election?: ElectionMetadata;
  pendingVotes: PendingVotes;
  voiceCredits: number;
  isWalletConnected: boolean;
  connectWallet: () => void;
  submitVotes: Function;
  scrollToGrantRound: (grantId: number) => void;
}

export default function Sidebar({
  election,
  pendingVotes,
  voiceCredits,
  isWalletConnected,
  connectWallet,
  submitVotes,
  scrollToGrantRound,
}: ISideBar): JSX.Element {

  return (
    <div className="w-9/12 mx-auto">
      {election && GrantElectionAdapter().isActive(election) && (
        <>
          <VoteCounter
            election={election}
            maxVotes={voiceCredits}
            pendingVotes={pendingVotes}
            voiceCredits={voiceCredits}
          />
          <ActionButton
            election={election}
            hasLockedPop={voiceCredits > 0}
            isWalletConnected={isWalletConnected}
            connectWallet={connectWallet}
            submitVotes={submitVotes}
          />
        </>
      )}
      <ul className="mt-4">
        {/** 
        {grantYears?.map((grantYear, i) => (
          <YearSpoiler
            key={grantYear}
            year={grantYear}
            grantRounds={grantRounds.filter(
              (grantRound) => grantRound.year === grantYear,
            )}
            scrollToGrantRound={scrollToGrantRound}
            opened={i === 0}
            grantRoundFilter={grantRoundFilter}
          />
        ))}
            **/}
      </ul>
      
    </div>
  );
}
