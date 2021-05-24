import { useContext, useEffect, useState } from 'react';
import { store } from 'app/store';
import { RadioGroup } from '@headlessui/react';

import { setDualActionModal } from '../../app/actions';
import { DummyBeneficiaryProposal } from '../../pages/beneficiary-proposals/interfaces';
import CurrentStandings from './CurrentStandings';

const settings = [
  {
    name: 'Vote For Proposal',
    description: 'Beneficiary would be eligible for grants',
  },
  {
    name: 'Reject Proposal',
    description: 'Beneficiary would not be eligible for grants',
  },
];

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

// TODO: Add types
const OpenVoting = (beneficiaryProposal: DummyBeneficiaryProposal) => {
  const { dispatch } = useContext(store);
  const [selected, setSelected] = useState(settings[0]);

  return (
    <div className="content-center mx-48">
      <p className="my-8 mx-5 text-3xl text-black sm:text-4xl lg:text-5xl text-center">
        {beneficiaryProposal.currentStage} vote on {beneficiaryProposal.name}
      </p>
      <div className="grid my-2 justify-items-stretch">
        <span className="mx-4  w-1/2 justify-self-center flex flex-row justify-between">
          <p className="mb-4 text-base font-medium text-gray-900">
            The organization is currently in the first phase of voting, users
            have 48 hours to vote on the nomination. If the beneficiary passes
            with a majority, the process moves onto the challenge step.
          </p>
        </span>
      </div>
      <div className="grid my-2 justify-items-stretch">
        <RadioGroup
          className="w-1/2 justify-self-center"
          value={selected}
          onChange={setSelected}
        >
          <RadioGroup.Label className="sr-only">
            Privacy setting
          </RadioGroup.Label>
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
      </div>

      <div className="grid my-2 justify-items-stretch">
        <button
          type="button"
          className="my-4 justify-self-center inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          onClick={() => {
            dispatch(
              setDualActionModal({
                content:
                  'You are about to submit your vote. You will not be able to vote again for this grant election after you submit your vote. \
                 Confirm to continue.',
                title: 'Confirm Vote',
                onConfirm: {
                  label: 'Confirm Vote',
                  onClick: () => {
                    window.alert('mehul');
                  },
                },
                onDismiss: {
                  label: 'Cancel',
                  onClick: () => setDualActionModal(false),
                },
              }),
            );
          }}
        >
          Cast Vote
        </button>

        <CurrentStandings {...beneficiaryProposal} />
      </div>
    </div>
  );
};

export default OpenVoting;
