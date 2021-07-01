import { setDualActionModal } from 'context/actions';
import { store } from 'context/store';

import {
  CashIcon,
  HandIcon,
  LibraryIcon,
  UserIcon,
} from '@heroicons/react/outline';
import { useContext } from 'react';
import { DualActionModalProps } from 'components/Modal/DualActionModal';

type ContractName =
  | 'Beneficiary Governance'
  | 'Escrow'
  | 'Grant Elections'
  | 'Staking';

function ContractIcon(contractName: string): JSX.Element {
  switch (contractName) {
    case 'Beneficiary Governance':
      return <LibraryIcon className="h-6 w-6 mr-4 text-gray-400" />;
    case 'Escrow':
      return <UserIcon className="h-6 w-6 mr-4 text-gray-400" />;
    case 'Grant Elections':
      return <HandIcon className="h-6 w-6 mr-4 text-gray-400" />;
    case 'Staking':
      return <CashIcon className="h-6 w-6 mr-4 text-gray-400" />;
  }
}

interface ClaimRewardsListItemProps {
  contractName: ContractName;
  rewardAmount: number;
  claimRewards: () => void;
}

export function ClaimRewardsListItem({
  contractName,
  rewardAmount,
  claimRewards,
}: ClaimRewardsListItemProps): JSX.Element {
  const { dispatch } = useContext(store);
  function triggerClaimReward({
    title,
    content,
    visible,
    onDismiss,
    onConfirm,
  }: DualActionModalProps) {
    dispatch(
      setDualActionModal({
        title,
        content,
        visible,
        onDismiss,
        onConfirm,
      }),
    );
  }
  return (
    <li
      className="gap-y-1 flex flex-row bg-white rounded-lg"
      key={contractName}
    >
      <div className="w-1/4 px-6 py-4 whitespace-nowrap ">
        <div className="flex items-center my-5">
          <div className="min-w-0 flex-1 flex items-center">
            <div className="flex-shrink-0">{ContractIcon(contractName)}</div>
            <p className="text-xl font-medium text-gray-800 truncate">
              {contractName}
            </p>
          </div>
        </div>
      </div>
      <div className="w-1/2 whitespace-nowrap flex flex-col content-start justify-center">
        <div className="text-m text-gray-900">Earned (POP)</div>
        <div className="mt-2 flex items-center text-m text-gray-500">
          {rewardAmount}
        </div>
      </div>
      <div className="w-1/4 whitespace-nowrap flex flex-wrap content-center justify-end">
        {rewardAmount > 0 ? (
          <button
            type="button"
            className="mx-6 px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 "
            onClick={() =>
              triggerClaimReward({
                title: `Trigger ${contractName} Reward Claim`,
                content: `Are you sure you want to claim ${rewardAmount} POP from ${contractName} contract?`,
                visible: true,
                onDismiss: {
                  label: 'Cancel',
                  onClick: () => dispatch(setDualActionModal(false)),
                },
                onConfirm: { label: 'Confirm', onClick: claimRewards },
              })
            }
          >
            Claim
          </button>
        ) : (
          <button
            type="button"
            className="disabled:opacity-50 mx-6 px-4 py-2 border border-transparent text-sm font-medium rounded-md  text-gray-400 bg-indigo-200"
            onClick={() => {}}
          >
            Claim
          </button>
        )}
      </div>
    </li>
  );
}
