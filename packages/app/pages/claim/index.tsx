import React, { useContext, useEffect, useState } from 'react';
import { ContractsContext } from '../../context/Web3/contracts';
import NavBar from '../../components/NavBar/NavBar';
import { bigNumberToNumber } from '@popcorn/utils/formatBigNumber';
import ClaimEarningsRow from 'components/Claims/ClaimEarningsRow';

export default function Claim(): JSX.Element {
  const { contracts } = useContext(ContractsContext);
  const [beneficiaryGovernanceRewards, setBeneficiaryGovernanceRewards] =
    useState<number>(0);
  const [escrowRewards, setEscrowRewards] = useState<number>(0);
  const [grantRewards, setGrantRewards] = useState<number>(0);
  const [stakingRewards, setStakingRewards] = useState<number>(0);

  async function getRewards() {
    // TODO: Update placeholders
    // const escrowRewards = await contracts.rewardsEscrow.getVested();
    // const beneficiaryGovernanceRewards =
    //   await contracts.beneficiaryGovernance.claimRewards();
    // const grantRewards = await contracts.grant.claimRewards();
    const stakingRewards = await contracts.staking.getReward();
    const stakingReward = bigNumberToNumber(stakingRewards?.value);
    setBeneficiaryGovernanceRewards(100);
    setStakingRewards(stakingReward);
    setGrantRewards(125);
    setEscrowRewards(350);
  }

  useEffect(() => {
    if (contracts) {
      getRewards();
    }
  }, [contracts]);

  const getTotalClaimRewards = () => {
    return (
      stakingRewards +
      grantRewards +
      escrowRewards +
      beneficiaryGovernanceRewards
    );
  };

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
      <div className="mt-10 mx-10 shadow overflow-hidden flex justify-center ">
        <dl className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div
            key={'claimable'}
            className="w-64 px-4 py-5 bg-white shadow rounded-lg overflow-hidden sm:p-6"
          >
            <dt className="text-sm font-medium text-gray-500 truncate">
              Total Claimable
            </dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">
              {getTotalClaimRewards()}
            </dd>
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
              Claim rewards by contract
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
