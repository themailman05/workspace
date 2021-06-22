import { setDualActionModal, setSingleActionModal } from 'context/actions';
import { store } from 'context/store';
import { useContext } from 'react';
import * as Icon from 'react-feather';

export default function TriggerTakedownProposal(): JSX.Element {
  const { dispatch } = useContext(store);
  const triggerTakedownProposal = () => {
    dispatch(
      setDualActionModal({
        visible: true,
        progress: true,
      }),
    );
  };
  return (
    <footer className="bg-white ">
      <div className="flex justify-center space-x-6 md:order-2 items-center">
        <button
          type="button"
          className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          onClick={() => {
            dispatch(
              setDualActionModal({
                content:
                  'You are about to submit your vote. You will not be able to vote again for this grant election after you submit your vote. \
                     Confirm to continue.',
                title: 'Trigger Takedown Proposal',
                onConfirm: {
                  label: 'Confirm Takedown Proposal',
                  onClick: () => {
                    triggerTakedownProposal();
                    dispatch(setDualActionModal(false));
                  },
                },
                onDismiss: {
                  label: 'Cancel Takedown Proposal',
                  onClick: () => dispatch(setDualActionModal(false)),
                },
              }),
            );
          }}
        >
          Trigger Takedown Proposal
        </button>
        <Icon.Info
          onClick={() => {
            dispatch(
              setSingleActionModal({
                title: 'What is a Takedown Proposal?',
                content:
                  "Triggering a Takedown Proposal begins the process to remove a beneficiary from the registry.\nThis need may be required if the beneficiary's actions violate the principles and values stated in the Popcorn Foundation charter. In the event that an eligible beneficiary violates the principles and values in the Popcorn Foundation charter, or if allocation of funds is not consistent with the charter’s criteria, a Beneficiary Takedown Proposal may be raised, which upon successful execution will remove a beneficiary address from the registry.",
                visible: true,
                onConfirm: {
                  label: 'OK',
                  onClick: () => {
                    dispatch(setSingleActionModal(false));
                  },
                },
              }),
            );
          }}
          className="ml-2 h-7 w-7 inline-flex items-center p-1 border border-transparent rounded-full shadow-sm text-indigo-700 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 "
        />
      </div>
    </footer>
  );
}
