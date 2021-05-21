import { useContext, useEffect, useState } from 'react';
import { store } from 'app/store';
import { RadioGroup } from '@headlessui/react';


import { setDualActionModal } from '../../app/actions';
import { DummyBeneficiaryProposal } from '../../pages/beneficiary-proposals/interfaces';
const settings = [
  {
    name: 'Accept Proposal',
    description: 'This project would be available to anyone who has the link',
  },
  {
    name: 'Reject Proposal',
    description: 'Only members of this project would be able to access',
  },
];

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

const getTimeLeft = (stagingDeadline: Date): string => {
  const ms = stagingDeadline.getTime() - new Date().getTime();
  const seconds = Math.round((ms / 1000) % 60);
  const minutes = Math.round((ms / (1000 * 60)) % 60);
  const hours = Math.round((ms / (1000 * 60 * 60)) % 24);
  const hoursPadded = hours < 10 ? '0' + hours : hours;
  const minutesPadded = minutes < 10 ? '0' + minutes : minutes;
  const secondsPadded = seconds < 10 ? '0' + seconds : seconds;
  return hoursPadded + ':' + minutesPadded + ':' + secondsPadded;
};

// TODO: Add types
const Voting = (beneficiaryProposal: DummyBeneficiaryProposal) => {
  const { dispatch } = useContext(store);

  const [selected, setSelected] = useState(settings[0]);
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
    <div className="content-center mx-48">
      <p className="my-8 mx-5 text-3xl font-extrabold text-black sm:text-4xl lg:text-5xl text-center">
        {beneficiaryProposal.currentStage} vote on {beneficiaryProposal.name}
      </p>
      <p className="mb-4 text-base font-medium text-gray-900">
        The orginization is currently in the first phase of voting, users have
        48 hours to vote on the nomination. If the beneficiary passes with a
        majority, the process moves onto the challenge step.
      </p>

      <RadioGroup
        className="w-1/2 my-8"
        value={selected}
        onChange={setSelected}
      >
        <RadioGroup.Label className="sr-only">Privacy setting</RadioGroup.Label>
        <div className="bg-white rounded-md -space-y-px">
          {settings.map((setting, settingIdx) => (
            <RadioGroup.Option
              key={setting.name}
              value={setting}
              className={({ checked }) =>
                classNames(
                  settingIdx === 0 ? 'rounded-tl-md rounded-tr-md' : '',
                  settingIdx === settings.length - 1
                    ? 'rounded-bl-md rounded-br-md'
                    : '',
                  checked
                    ? 'bg-indigo-50 border-indigo-200 z-10'
                    : 'border-gray-200',
                  'relative border p-4 flex cursor-pointer focus:outline-none',
                )
              }
            >
              {({ active, checked }) => (
                <>
                  <span
                    className={classNames(
                      checked
                        ? 'bg-indigo-600 border-transparent'
                        : 'bg-white border-gray-300',
                      active ? 'ring-2 ring-offset-2 ring-indigo-500' : '',
                      'h-4 w-4 mt-0.5 cursor-pointer rounded-full border flex items-center justify-center',
                    )}
                    aria-hidden="true"
                  >
                    <span className="rounded-full bg-white w-1.5 h-1.5" />
                  </span>
                  <div className="ml-3 flex flex-col">
                    <RadioGroup.Label
                      as="span"
                      className={classNames(
                        checked ? 'text-indigo-900' : 'text-gray-900',
                        'block text-sm font-medium',
                      )}
                    >
                      {setting.name}
                    </RadioGroup.Label>
                    <RadioGroup.Description
                      as="span"
                      className={classNames(
                        checked ? 'text-indigo-700' : 'text-gray-500',
                        'block text-sm',
                      )}
                    >
                      {setting.description}
                    </RadioGroup.Description>
                  </div>
                </>
              )}
            </RadioGroup.Option>
          ))}
        </div>
      </RadioGroup>

      <div className="my-12">
        <button
          type="button"
          className="my-4 inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          onClick={() => {
            
          }}              
        >
          Cast Vote
        </button>

        <p className="mb-4 text-base font-medium text-gray-900">
          {beneficiaryProposal.votes} votes cast
        </p>
        {/* TODO: Calculate time left in DD:HH:MM:SS format. Recaclulate every second */}
        <p className="my-4 mt-1 text-sm text-gray-500">
          {beneficiaryProposal.stageDeadline.toString()} time left to cast a
          vote
        </p>
        <p className="my-4 mt-1 text-sm text-gray-500">
          {timeLeft} time left to cast a vote
        </p>
      </div>
    </div>
  );
};

export default Voting;
