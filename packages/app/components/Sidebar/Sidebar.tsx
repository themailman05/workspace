import {
  ElectionMetadata,
  GrantElectionAdapter,
} from '@popcorn/utils/Contracts';
import calculateRemainingVotes from 'utils/calculateRemainingVotes';
import ActionButton from './ActionButton';
import VoteCounter from './VoteCounter';
import { PendingVotes } from '../../pages/grant-elections/[type]';
import { RegisterHolder } from '@popcorn/ui/components/grantPage';
import { Check } from 'react-feather';

interface ISideBar {
  election?: ElectionMetadata;
  pendingVotes: PendingVotes;
  voiceCredits: number;
  isWalletConnected: boolean;
  connectWallet: () => void;
  submitVotes: Function;
  scrollToGrantRound: (grantId: number) => void;
  userIsEligibleBeneficiary: boolean;
  alreadyRegistered: boolean;
  registerForElection: (grant_term: number) => void;
}

export default function Sidebar({
  election,
  pendingVotes,
  voiceCredits,
  isWalletConnected,
  connectWallet,
  submitVotes,
  scrollToGrantRound,
  userIsEligibleBeneficiary,
  alreadyRegistered,
  registerForElection,
}: ISideBar): JSX.Element {
  function returnButtons() {
    if (alreadyRegistered) {
      return (
        <span className="flex flex-row items-center justify-center ml-10">
          <p className="text-lg text-black-700 font-bold mr-4 ml-15 gray-color">
            Registered
          </p>
          <div className="h-10 w-10 mr-2 rounded-full border-4 gray-color flex items-center justify-center flex-shrink-0">
            <Check size={32} className="gray-color" />
          </div>
        </span>
      );
    }
    if (userIsEligibleBeneficiary) {
      return (
        <RegisterHolder>
          <button
            onClick={() => registerForElection(election.electionTerm)} //
            className="button button-secondary w-full mt-4"
          >
            Register for election
          </button>
        </RegisterHolder>
      );
    }
    return;
  }

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
          {returnButtons()}
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
