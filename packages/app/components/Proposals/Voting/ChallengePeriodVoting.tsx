import { setDualActionModal } from 'context/actions';
import { store } from 'context/store';
import { ContractsContext } from 'context/Web3/contracts';
import { Proposal } from 'interfaces/proposals';
import { useContext } from 'react';
import CurrentStandings from '../CurrentStandings';

interface ChallengePeriodVotingProps {
  proposal: Proposal;
  isTakedown: boolean;
}

export default function ChallengePeriodVoting({
  proposal,
  isTakedown,
}: ChallengePeriodVotingProps): JSX.Element {
  const { dispatch } = useContext(store);
  const { contracts } = useContext(ContractsContext);

  return (
    <div className="content-center mx-48">
      <p className="my-8 mx-5 text-3xl text-black sm:text-4xl lg:text-5xl text-center">
        {proposal?.status} vote on {proposal?.name}
      </p>
      <div className="grid my-2 justify-items-stretch">
        <span className="mx-4  w-1/2 justify-self-center flex flex-row justify-between">
          <p className="mb-4 text-base font-medium text-gray-900">
            {proposal?.name}{' '}
            {isTakedown
              ? `is in the second phase of takedown voting, known
            as the challenge period. Here, users are able to vote to veto the
            takedown proposal. This additional phase prevents exploits where a
            flood of late votes swings the results.`
              : `is in the second phase of voting, the
            challenge period. Here, users are able to vote to veto the
            nomination. This additional phase prevents exploits where a flood of
            late “Yes” votes swings the results.`}
          </p>
        </span>
      </div>
      <div className="grid my-2 justify-items-stretch">
        <span className="mx-4  w-1/2 justify-self-center flex flex-row justify-between">
          <p className="mb-4 text-base font-medium text-gray-900">
            {isTakedown
              ? `At the end of the challenge period, if the takedown proposal
            receives more yes votes than no votes, the elected organization will
            become ineligible to receive grants.`
              : `At the end of the challenge period, if the nomination receives more
            yes votes than no votes, the elected organization will become
            eligible to receive grants as an eligible beneficiary`}
          </p>
        </span>
      </div>
      <div className="grid my-2 justify-items-stretch">
        <button
          type="button"
          className="my-4 justify-self-center inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          onClick={() => {
            dispatch(
              setDualActionModal({
                //TODO add real text
                content: `Confirm your veto vote for ${
                  isTakedown ? 'the takedown of' : ''
                } ${
                  proposal?.name
                }. Your vote will lock x tokens for the duration of the nomination process. You will not be able to cancel your vote once you confirm \
                  Confirm to continue.`,
                title: 'Confirm Veto',
                onConfirm: {
                  label: 'Confirm Veto',
                  onClick: () => {
                    //TODO is veto a vote.yes or vote.no?
                    contracts.beneficiaryGovernance.vote(proposal.id, 0);
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
          {isTakedown ? 'Veto Takedown Proposal Vote' : 'Veto Proposal Vote'}
        </button>
      </div>
      {proposal && <CurrentStandings {...proposal} />}
    </div>
  );
}
