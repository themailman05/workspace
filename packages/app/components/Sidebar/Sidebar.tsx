import { IGrantRoundFilter, IVote } from 'pages/grant-elections';
import { useState } from 'react';
import { Dispatch } from 'react';
import { useEffect } from 'react';
import calculateRemainingVotes from 'utils/calculateRemainingVotes';
import ActionButton from './ActionButton';
import FilterGrantRounds from './FilterGrantRounds';
import { IGrantRound } from './GrantRoundLink';
import VoteCounter from './VoteCounter';

interface ISideBar {
  votes?: IVote[];
  maxVotes: number;
  voiceCredits: number;
  grantRounds: IGrantRound[];
  isWalletConnected: boolean;
  isActiveElection: boolean;
  connectWallet: () => void;
  submitVotes: () => void;
  scrollToGrantRound: (grantId: number) => void;
  grantRoundFilter: IGrantRoundFilter;
  setGrantRoundFilter: Dispatch<IGrantRoundFilter>;
}

export default function Sidebar({
  votes,
  maxVotes,
  voiceCredits,
  grantRounds,
  isWalletConnected,
  isActiveElection,
  connectWallet,
  submitVotes,
  scrollToGrantRound,
  grantRoundFilter,
  setGrantRoundFilter,
}: ISideBar): JSX.Element {
  const [grantYears, setGrantYears] = useState<number[]>([]);

  useEffect(() => {
    const years = [];
    grantRounds?.forEach(
      (grantRound) =>
        !years.includes(grantRound?.year) && years.push(grantRound?.year),
    );
    years.sort().reverse();
    setGrantYears(years);
  }, []);

  return (
    <div className="w-9/12 mx-auto">
      {isActiveElection && (
        <>
          <VoteCounter
            remainingVotes={votes && calculateRemainingVotes(maxVotes, votes)}
            maxVotes={maxVotes}
            voiceCredits={voiceCredits}
          />
          <ActionButton
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
      <FilterGrantRounds
        grantRoundFilter={grantRoundFilter}
        setGrantRoundFilter={setGrantRoundFilter}
      />
    </div>
  );
}
