import { useEffect } from 'react';
import { useState } from 'react';
import GrantRoundLink, { IGrantRound } from './GrantRoundLink';
import { IGrantRoundFilter } from './Sidebar';

interface IYearSpoiler {
  year: number;
  grantRounds: IGrantRound[];
  scrollToGrantRound: (grantAddress: string) => void;
  grantRoundFilter: IGrantRoundFilter;
  opened?: boolean;
}

export default function YearSpoiler({
  year,
  grantRounds,
  scrollToGrantRound,
  grantRoundFilter,
  opened = false,
}: IYearSpoiler): JSX.Element {
  const [showGrants, setGrantVisibility] = useState<boolean>(false);

  useEffect(() => {
    setGrantVisibility(opened);
  }, []);

  return (
    <div>
      <a
        className="text-white text-base cursor-pointer"
        onClick={() => setGrantVisibility((prevState) => !prevState)}
      >
        {year}
      </a>
      {showGrants && (
        <ul>
          {grantRounds
            ?.filter(
              (grantRound) => grantRoundFilter.active && grantRound.active,
            )
            .map((grantRound) => (
              <GrantRoundLink
                key={`${grantRound.address}-GrantLink`}
                grantRound={grantRound}
                scrollToGrantRound={scrollToGrantRound}
              />
            ))}
          {grantRounds
            ?.filter(
              (grantRound) => grantRoundFilter.closed && !grantRound.active,
            )
            .map((grantRound) => (
              <GrantRoundLink
                key={`${grantRound.address}-GrantLink`}
                grantRound={grantRound}
                scrollToGrantRound={scrollToGrantRound}
              />
            ))}
        </ul>
      )}
    </div>
  );
}
