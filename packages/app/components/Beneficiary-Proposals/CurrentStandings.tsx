import { useEffect, useState } from 'react';
import {DummyBeneficiaryProposal} from '../../interfaces/beneficiaries'
import ProgressBar from '../ProgressBar';

const getTimeLeft = (stageDeadline: Date): string => {
  const ms = stageDeadline.getTime() - new Date().getTime();
  if (ms <= 0) {
    return '00:00:00';
  }
  const seconds = Math.round((ms / 1000) % 60);
  const minutes = Math.round((ms / (1000 * 60)) % 60);
  const hours = Math.round((ms / (1000 * 60 * 60)) % 24);
  const hoursPadded = hours < 10 ? '0' + hours : hours;
  const minutesPadded = minutes < 10 ? '0' + minutes : minutes;
  const secondsPadded = seconds < 10 ? '0' + seconds : seconds;
  return hoursPadded + ':' + minutesPadded + ':' + secondsPadded;
};

const CurrentStandings = (
  beneficiaryProposal: DummyBeneficiaryProposal,
): JSX.Element => {
  const [timeLeft, setTimeLeft] = useState<string>(
    getTimeLeft(beneficiaryProposal.stageDeadline),
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(getTimeLeft(beneficiaryProposal.stageDeadline));
    }, 1000);
    return () => clearInterval(interval);
  }, []);
  return (
    <div>
      <div className="grid my-2 justify-items-stretch">
        <span className="mx-4  w-1/2 justify-self-center flex flex-row justify-between">
          <p className="text-lg font-medium text-gray-700">Votes For</p>
          <span className="text-base text-gray-700 flex flex-row">
            <p>{beneficiaryProposal.votesFor}</p>
          </span>
        </span>
      </div>

      <div className="grid my-2 justify-items-stretch">
        <span className="mx-4  w-1/2 justify-self-center flex flex-row justify-between  pb-2">
          <ProgressBar
            progress={
              (100 * beneficiaryProposal.votesFor) /
              (beneficiaryProposal.votesFor + beneficiaryProposal.votesAgainst)
            }
            progressColor={'bg-green-300'}
          />
        </span>
      </div>
      <div className="grid my-2 justify-items-stretch">
        <span className="mx-4  w-1/2 justify-self-center flex flex-row justify-between">
          <p className="text-lg font-medium text-gray-700">Votes Against</p>
          <span className="text-base text-gray-700 flex flex-row">
            <p>{beneficiaryProposal.votesAgainst}</p>
          </span>
        </span>
      </div>

      <div className="grid my-2 justify-items-stretch">
        <span className="mx-4  w-1/2 justify-self-center flex flex-row justify-between border-b-2 pb-2">
          <ProgressBar
            progress={
              (100 * beneficiaryProposal.votesAgainst) /
              (beneficiaryProposal.votesFor + beneficiaryProposal.votesAgainst)
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
              {beneficiaryProposal.votesFor + beneficiaryProposal.votesAgainst}
            </p>
          </span>
        </span>
      </div>

      <div className="grid my-2 justify-items-stretch">
        <p className="my-4  w-1/2 justify-self-center mt-1 text-sm text-gray-500">
          Current voting period ends at{' '}
          {beneficiaryProposal.stageDeadline.toLocaleString()}
        </p>
        <p className="my-4 w-1/2 justify-self-center mt-1 text-sm text-gray-500">
          {timeLeft !== '00:00:00'
            ? timeLeft + ' left to cast a vote'
            : 'Voting period has ended'}
        </p>
      </div>
    </div>
  );
};

export default CurrentStandings;
