import { IGrantRoundFilter } from 'pages/grants';
import { useState } from 'react';
import { Dispatch } from 'react';
import { useEffect } from 'react';
import ActionButton from './ActionButton';
import FilterGrantRounds from './FilterGrantRounds';
import { IGrantRound } from './GrantRoundLink';
import VoteCounter from './VoteCounter';
import YearSpoiler from './YearSpoiler';

interface ISideBar {
  remainingVotes: number;
  maxVotes: number;
  grantRounds: IGrantRound[];
  isWalletConnected: boolean;
  connectWallet: () => void;
  submitVotes: () => void;
  scrollToGrantRound: (grantId: string) => void;
  grantRoundFilter: IGrantRoundFilter;
  setGrantRoundFilter: Dispatch<IGrantRoundFilter>;
}

export default function Sidebar({
  remainingVotes,
  maxVotes,
  grantRounds,
  isWalletConnected,
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
    <div className="w-8/12">
      <VoteCounter remainingVotes={remainingVotes} maxVotes={maxVotes} />
      <ActionButton
        hasLockedPop={maxVotes > 0}
        isWalletConnected={isWalletConnected}
        connectWallet={connectWallet}
        submitVotes={submitVotes}
      />
      <ul className="mt-4">
        {grantYears?.map((grantYear, i) => (
          <YearSpoiler
            year={grantYear}
            grantRounds={grantRounds.filter(
              (grantRound) => grantRound.year === grantYear,
            )}
            scrollToGrantRound={scrollToGrantRound}
            opened={i === 0}
            grantRoundFilter={grantRoundFilter}
          />
        ))}
      </ul>
      <FilterGrantRounds
        grantRoundFilter={grantRoundFilter}
        setGrantRoundFilter={setGrantRoundFilter}
      />
    </div>
  );
}
