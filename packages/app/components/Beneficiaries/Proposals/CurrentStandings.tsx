import ProgressBar from 'components/ProgressBar';
import { BeneficiaryProposal } from 'interfaces/proposals';
import { DateTime } from 'luxon';
import { useEffect, useState } from 'react';
import {
  bigNumberToNumber,
  formatAndRoundBigNumber,
} from 'utils/formatBigNumber';

const getTimeLeft = (stageDeadline: Date): string => {
  const date1 = DateTime.fromISO(new Date().toISOString());
  // TODO: Remove conditional below when we get deadline from contract
  const date2 = stageDeadline
    ? DateTime.fromISO(stageDeadline.toISOString())
    : DateTime.fromISO(new Date().toISOString());
  const diff = date2.diff(date1, ['hours', 'minutes', 'seconds']).toObject();
  return diff.hours + ':' + diff.minutes + ':' + parseInt(diff.seconds);
};

export default function CurrentStandings(
  displayData: BeneficiaryProposal,
): JSX.Element {
  const [timeLeft, setTimeLeft] = useState<string>(
    getTimeLeft(displayData?.stageDeadline),
  );
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(getTimeLeft(displayData?.stageDeadline));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div>
      <div className="grid my-2 justify-items-stretch">
        <span className="mx-4  w-1/2 justify-self-center flex flex-row justify-between">
          <p className="text-lg font-medium text-gray-700">Votes For</p>
          <span className="text-base text-gray-700 flex flex-row">
            <p>{formatAndRoundBigNumber(displayData?.votesFor)}</p>
          </span>
        </span>
      </div>

      <div className="grid my-2 justify-items-stretch">
        <span className="mx-4  w-1/2 justify-self-center flex flex-row justify-between  pb-2">
          <ProgressBar
            progress={
              (100 * bigNumberToNumber(displayData?.votesFor)) /
              bigNumberToNumber(
                displayData?.votesFor.add(displayData?.votesAgainst),
              )
            }
            progressColor={'bg-green-300'}
          />
        </span>
      </div>
      <div className="grid my-2 justify-items-stretch">
        <span className="mx-4  w-1/2 justify-self-center flex flex-row justify-between">
          <p className="text-lg font-medium text-gray-700">Votes Against</p>
          <span className="text-base text-gray-700 flex flex-row">
            <p>{formatAndRoundBigNumber(displayData?.votesAgainst)}</p>
          </span>
        </span>
      </div>

      <div className="grid my-2 justify-items-stretch">
        <span className="mx-4  w-1/2 justify-self-center flex flex-row justify-between border-b-2 pb-2">
          <ProgressBar
            progress={
              (100 * bigNumberToNumber(displayData?.votesAgainst)) /
              bigNumberToNumber(
                displayData?.votesFor.add(displayData?.votesAgainst),
              )
            }
            progressColor={'bg-red-400'}
          />
        </span>
      </div>

      <div className="grid my-2 justify-items-stretch">
        <span className="mx-4  w-1/2 justify-self-center flex flex-row justify-between">
          <p className="text-lg font-medium text-gray-700">Total Votes</p>
          <span className="text-base text-gray-700 flex flex-row">
            <p>
              {formatAndRoundBigNumber(
                displayData?.votesFor.add(displayData?.votesAgainst),
              )}
            </p>
          </span>
        </span>
      </div>

      <div className="grid my-2 justify-items-stretch">
        <p className="my-4  w-1/2 justify-self-center mt-1 text-sm text-gray-500">
          Current voting period ends at{' '}
          {displayData?.stageDeadline &&
            displayData?.stageDeadline.toLocaleString()}
        </p>
        <p className="my-4 w-1/2 justify-self-center mt-1 text-sm text-gray-500">
          {timeLeft !== '00:00:00'
            ? timeLeft + ' left to cast a vote'
            : 'Voting period has ended'}
        </p>
      </div>
    </div>
  );
}
