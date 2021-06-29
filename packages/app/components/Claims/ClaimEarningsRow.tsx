import {
  CashIcon,
  HandIcon,
  LibraryIcon,
  UserIcon,
} from '@heroicons/react/outline';

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

export default function ClaimEarningsRow({
  contractName,
  rewardAmount,
}: {
  contractName: ContractName;
  rewardAmount: number;
}): JSX.Element {
  return (
    <tr className="gap-y-1 p-10" key={contractName}>
      <td className="w-1/6 px-6 py-4 whitespace-nowrap ">
        <div className="flex items-center my-5">
          <div className="min-w-0 flex-1 flex items-center">
            <div className="flex-shrink-0">{ContractIcon(contractName)}</div>
            <p className="text-sm font-medium text-indigo-600 truncate">
              {contractName}
            </p>
          </div>
        </div>
      </td>
      <td className="w-2/3 px-6 py-4 whitespace-nowrap ">
        <div className="text-sm text-gray-900">Earned</div>
        <div className="mt-2 flex items-center text-sm text-gray-500">
          {rewardAmount}
        </div>
      </td>
      <td className="w-1/6 px-6 py-4 whitespace-nowrap text-right text-sm font-medium ">
        <button
          type="button"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Claim
        </button>
      </td>
    </tr>
  );
}
