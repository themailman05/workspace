import { RadioGroup } from '@headlessui/react';
import { setDualActionModal } from 'context/actions';
import { store } from 'context/store';
import { ContractsContext } from 'context/Web3/contracts';
import { Proposal } from 'interfaces/interfaces';
import { useContext, useState } from 'react';
import CurrentStandings from '../CurrentStandings';

enum VoteOptions {
  Yay,
  Nay,
}

export default function OpenVoting(proposal: Proposal): JSX.Element {
  const { dispatch } = useContext(store);
  const [selected, setSelected] = useState<VoteOptions>(VoteOptions.Yay);
  const { contracts } = useContext(ContractsContext);

  return (
    <div className="content-center mx-48">
      <p className="my-8 mx-5 text-3xl text-black sm:text-4xl lg:text-5xl text-center">
        {proposal?.status} vote on {proposal?.application?.organizationName}
      </p>
      <div className="grid my-2 justify-items-stretch">
        <span className="mx-4  w-1/2 justify-self-center flex flex-row justify-between">
          <p className="mb-4 text-base font-medium text-gray-900">
            The organization is currently in the first phase of{' '}
            {proposal.proposalType === 1 ? 'takedown' : ''} voting, users have
            48 hours to cast their vote. If the beneficiary{' '}
            {proposal.proposalType === 1 ? 'takedown' : ''} proposal passes with
            a majority, the process moves onto the challenge period.
          </p>
        </span>
      </div>
      <div className="grid my-2 justify-items-stretch">
        <RadioGroup
          className="w-1/2 justify-self-center"
          value={selected}
          onChange={(x) => {
            setSelected(x);
          }}
        >
          <div className="bg-white rounded-md -space-y-px">
            <RadioGroup.Option
              value={VoteOptions.Yay}
              className={({ checked }) =>
                `rounded-tl-md rounded-tr-md relative border p-4 flex cursor-pointer focus:outline-none ${
                  checked ? 'bg-indigo-50 border-indigo-200' : 'border-gray-200'
                }`
              }
            >
              {({ active, checked }) => (
                <>
                  <span
                    className={`h-4 w-4 mt-0.5 cursor-pointer rounded-full border flex items-center justify-center ${
                      checked
                        ? 'bg-indigo-600 border-transparent'
                        : 'bg-white border-gray-300'
                    } ${active ? 'ring-2 ring-offset-2 ring-indigo-500' : ''}`}
                    aria-hidden="true"
                  >
                    <span className="rounded-full bg-white w-1.5 h-1.5" />
                  </span>
                  <div className="ml-3 flex flex-col">
                    <RadioGroup.Label
                      as="span"
                      className={`block text-sm font-medium ${
                        checked ? 'text-indigo-900' : 'text-gray-900'
                      }`}
                    >
                      Vote For Proposal
                    </RadioGroup.Label>
                    <RadioGroup.Description
                      as="span"
                      className={`block text-sm ${
                        checked ? 'text-indigo-700' : 'text-gray-500'
                      }`}
                    >
                      {proposal.proposalType === 1
                        ? 'Beneficiary would become ineligible for grants'
                        : 'Beneficiary would become eligible for grants'}
                    </RadioGroup.Description>
                  </div>
                </>
              )}
            </RadioGroup.Option>

            <RadioGroup.Option
              value={VoteOptions.Nay}
              className={({ checked }) =>
                `rounded-bl-md rounded-br-md relative border p-4 flex cursor-pointer focus:outline-none ${
                  checked ? 'bg-indigo-50 border-indigo-200' : 'border-gray-200'
                }`
              }
            >
              {({ active, checked }) => (
                <>
                  <span
                    className={`h-4 w-4 mt-0.5 cursor-pointer rounded-full border flex items-center justify-center ${
                      checked
                        ? 'bg-indigo-600 border-transparent'
                        : 'bg-white border-gray-300'
                    } ${active ? 'ring-2 ring-offset-2 ring-indigo-500' : ''}`}
                    aria-hidden="true"
                  >
                    <span className="rounded-full bg-white w-1.5 h-1.5" />
                  </span>
                  <div className="ml-3 flex flex-col">
                    <RadioGroup.Label
                      as="span"
                      className={`block text-sm font-medium
                        ${checked ? 'text-indigo-900' : 'text-gray-900'}`}
                    >
                      Reject Proposal
                    </RadioGroup.Label>
                    <RadioGroup.Description
                      as="span"
                      className={`block text-sm ${
                        checked ? 'text-indigo-700' : 'text-gray-500'
                      }`}
                    >
                      {proposal.proposalType === 1
                        ? 'Beneficiary would remain eligible for grants'
                        : 'Beneficiary would be not become eligible for grants'}
                    </RadioGroup.Description>
                  </div>
                </>
              )}
            </RadioGroup.Option>
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
                    contracts.beneficiaryGovernance.vote(proposal.id, selected);
                    dispatch(setDualActionModal(false));
                  },
                },
                onDismiss: {
                  label: 'Cancel',
                  onClick: () => dispatch(setDualActionModal(false)),
                },
              }),
            );
          }}
        >
          Cast Vote
        </button>
      </div>
    </div>
  );
}
