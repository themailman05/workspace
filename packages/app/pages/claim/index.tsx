import { useContext, useEffect, useState } from 'react';
import { ContractsContext } from '../../context/Web3/contracts';
import NavBar from '../../components/NavBar/NavBar';
import {
  CashIcon,
  HandIcon,
  LibraryIcon,
  UserIcon,
} from '@heroicons/react/outline';

export default function Claim(): JSX.Element {
  const { contracts } = useContext(ContractsContext);
  const [beneficiaryGovernanceRewards, setBeneficiaryGovernanceRewards] =
    useState<number>(0);
  const [escrowRewards, setEscrowRewards] = useState<number>(0);
  const [grantRewards, setGrantRewards] = useState<number>(0);
  const [stakingRewards, setStakingRewards] = useState<number>(0);

  type ContractName =
    | 'Beneficiary Governance'
    | 'Escrow'
    | 'Grant Elections'
    | 'Staking';
  async function getRewards() {
    // const beneficiaryGovernanceRewards =
    //   await contracts.beneficiaryGovernance.claimRewards();
    // const grantRewards = await contracts.grant.claimRewards();
    // const stakingRewards = await contracts.staking.getReward();
    // const escrowRewards = await contracts._claimFor(); // TODO: Get correct fn call
    // setBeneficiaryGovernanceRewards(beneficiaryGovernanceRewards);
    // setStakingRewards(stakingRewards);
    // setGrantRewards(grantRewards);
    // setEscrowRewards(escrowRewards);
    setBeneficiaryGovernanceRewards(100);
    setStakingRewards(200);
    setGrantRewards(125);
    setEscrowRewards(350);
  }

  useEffect(() => {
    if (contracts) {
      getRewards();
    }
  }, [contracts]);

  function ContractIcon(contractName): JSX.Element {
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

  function ClaimEarningsRow({
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

  return (
    <div className="w-full bg-gray-900 h-screen">
      <NavBar />
      <div className="bg-gray-900">
        <div className="pt-12 px-4 sm:px-6 lg:px-8 lg:pt-20">
          <div className="text-center">
            <h2 className="text-lg leading-6 font-semibold text-gray-300 uppercase tracking-wider"></h2>
            <p className="mt-2 text-3xl font-extrabold text-white sm:text-4xl lg:text-5xl">
              Claim Rewards
            </p>
          </div>
        </div>
      </div>
      <div className="mt-10 mx-10 shadow overflow-hidden">
        <dl className="mt-5 max-w-3xl grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div
            key={'claimable'}
            className="px-4 py-5 bg-white shadow rounded-lg overflow-hidden sm:p-6"
          >
            <dt className="text-sm font-medium text-gray-500 truncate">
              Total Claimable
            </dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">100</dd>
          </div>
          <div
            key={'deposit'}
            className="px-4 py-5 bg-white shadow rounded-lg overflow-hidden sm:p-6"
          >
            <dt className="text-sm font-medium text-gray-500 truncate">
              Total Deposits
            </dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">100</dd>
          </div>
        </dl>
      </div>

      <div className="flex flex-col my-10">
        <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
            <p className="mx-10 my-4 max-w-4xl  text-xl text-white sm:mt-5 sm:text-2xl">
              Rewards by contract
            </p>
            <div className="mx-10 shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
              <table className="min-w-full divide-y divide-gray-200 gap-y-1">
                <tbody className="bg-white divide-y divide-gray-200 gap-y-1">
                  <ClaimEarningsRow
                    contractName={'Beneficiary Governance'}
                    rewardAmount={beneficiaryGovernanceRewards}
                  />
                  <ClaimEarningsRow
                    contractName={'Escrow'}
                    rewardAmount={escrowRewards}
                  />
                  <ClaimEarningsRow
                    contractName={'Grant Elections'}
                    rewardAmount={grantRewards}
                  />
                  <ClaimEarningsRow
                    contractName={'Staking'}
                    rewardAmount={stakingRewards}
                  />
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
