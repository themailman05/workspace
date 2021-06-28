import Divider from 'components/CommonComponents/Divider';
import ProgressBar from 'components/ProgressBar';
import { DateTime } from 'luxon';
import { useEffect, useState } from 'react';
import {
  bigNumberToNumber,
  formatAndRoundBigNumber,
} from '@popcorn/utils/formatBigNumber';
import { Proposal } from '@popcorn/utils/';

const getTimeLeft = (stageDeadline: Date): string => {
  const date1 = DateTime.fromISO(new Date().toISOString());
  // TODO: Remove conditional below when we get deadline from contract
  const date2 = stageDeadline
    ? DateTime.fromISO(stageDeadline.toISOString())
    : DateTime.fromISO(new Date().toISOString());
  const diff = date2.diff(date1, ['hours', 'minutes', 'seconds']).toObject();
  return diff.hours + ':' + diff.minutes + ':' + parseInt(diff.seconds);
};

export default function CurrentStandings(proposal: Proposal): JSX.Element {
  const [timeLeft, setTimeLeft] = useState<string>(
    getTimeLeft(proposal?.stageDeadline),
  );
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(getTimeLeft(proposal?.stageDeadline));
    }, 1000);
    return () => clearInterval(interval);
  }, []);
  return (
    <div>
      <div className="grid my-2 justify-items-stretch">
        <span className="mx-4  w-1/2 justify-self-center flex flex-row justify-between">
          <p className="text-lg font-medium text-gray-700">Votes For</p>
          <span className="text-base text-gray-700 flex flex-row">
            <p>{formatAndRoundBigNumber(proposal?.votes?.for)}</p>
          </span>
        </span>
      </div>

      <div className="grid my-2 justify-items-stretch">
        <span className="mx-4  w-1/2 justify-self-center flex flex-row justify-between  pb-2">
          <ProgressBar
            progress={
              (100 * bigNumberToNumber(proposal?.votes?.for)) /
              bigNumberToNumber(
                proposal?.votes?.for.add(proposal?.votes?.against),
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
            <p>{formatAndRoundBigNumber(proposal?.votes?.against)}</p>
          </span>
        </span>
      </div>

      <div className="grid my-2 justify-items-stretch">
        <span className="mx-4  w-1/2 justify-self-center flex flex-row justify-between border-b-2 pb-2">
          <ProgressBar
            progress={
              (100 * bigNumberToNumber(proposal?.votes?.against)) /
              bigNumberToNumber(
                proposal?.votes?.for.add(proposal?.votes?.against),
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
                proposal?.votes?.for.add(proposal?.votes?.against),
              )}
            </p>
          </span>
        </span>
      </div>

      <div className="grid my-2 justify-items-stretch">
        <p className="my-4  w-1/2 justify-self-center mt-1 text-sm text-gray-500">
          Current voting period ends at{' '}
          {proposal?.stageDeadline && proposal?.stageDeadline.toLocaleString()}
        </p>
        <p className="my-4 w-1/2 justify-self-center mt-1 text-sm text-gray-500">
          {timeLeft !== '00:00:00'
            ? timeLeft + ' left to cast a vote'
            : 'Voting period has ended'}
        </p>
      </div>
      <Divider />
    </div>
  );
}
