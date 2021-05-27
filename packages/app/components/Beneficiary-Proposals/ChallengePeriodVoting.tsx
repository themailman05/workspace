import { useContext, useEffect, useState } from 'react';
import { store } from '../../context/store';

import { setDualActionModal } from '../../context/actions';
import { DummyBeneficiaryProposal } from '../../interfaces/beneficiaries';
import CurrentStandings from './CurrentStandings';

export default function ChallengePeriodVoting(
  beneficiaryProposal: DummyBeneficiaryProposal,
): JSX.Element {
  const { dispatch } = useContext(store);

  return (
    <div className="content-center mx-48">
      <p className="my-8 mx-5 text-3xl text-black sm:text-4xl lg:text-5xl text-center">
        {beneficiaryProposal.currentStage} vote on {beneficiaryProposal.name}
      </p>
      <p className="mb-4 text-base font-medium text-gray-900">
        {beneficiaryProposal.name} is in the second phase of voting, the
        challenge period. Here, users are able to vote to veto the nomination.
        This additional phase prevents exploits where a flood of late “Yes”
        votes swings the results.
      </p>
      <p className="mb-4 text-base font-medium text-gray-900">
        At the end of the challenge period, if the nomination receives more yes
        votes than no votes, the elected organization will become eligible to
        receive grants as an eligible beneficiary
      </p>

      <div className="grid my-2 justify-items-stretch">
        <button
          type="button"
          className="my-4 justify-self-center inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          onClick={() => {
            dispatch(
              setDualActionModal({
                content:
                  'Confirm your veto vote for xyz. Your vote will lock x tokens for the duration of the nomination process. You will not be able to cancel your vote once you confirm \
                Confirm to continue.',
                title: 'Confirm Veto',
                onConfirm: {
                  label: 'Confirm Veto',
                  onClick: () => {
                    window.alert('to implement');
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
          Veto Proposal Vote
        </button>
      </div>
      <CurrentStandings {...beneficiaryProposal} />
    </div>
  );
}
