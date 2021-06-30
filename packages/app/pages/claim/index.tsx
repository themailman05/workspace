import { Web3Provider } from '@ethersproject/providers';
import { useWeb3React } from '@web3-react/core';
import React, { useContext, useEffect, useState } from 'react';
import { ContractsContext } from '../../context/Web3/contracts';
import NavBar from '../../components/NavBar/NavBar';
import { bigNumberToNumber } from '@popcorn/utils/formatBigNumber';
import { BigNumber } from '@ethersproject/bignumber';
import { Staking } from '../../../contracts/typechain';
import { ClaimRewardsListItem } from 'components/Claims/ClaimRewardsListItem';

export default function Claim(): JSX.Element {
  const context = useWeb3React<Web3Provider>();
  const { contracts } = useContext(ContractsContext);
  const { library } = context;
  const [connectedStaking, setConnectedStaking] = useState<Staking>();
  const [beneficiaryGovernanceRewards, setBeneficiaryGovernanceRewards] =
    useState<number>(0);
  const [escrowRewards, setEscrowRewards] = useState<number>(0);
  const [grantRewards, setGrantRewards] = useState<number>(0);
  const [stakingRewards, setStakingRewards] = useState<BigNumber>();

  async function getAvailableRewards() {
    const stakingRewardObject = await connectedStaking.getReward();
    setStakingRewards(stakingRewardObject?.value);
    setBeneficiaryGovernanceRewards(100);
    setGrantRewards(125);
    setEscrowRewards(350);
  }

  async function claimStakingRewards() {
    if (Number(stakingRewards) > 0) {
      const transactionReceipt = await connectedStaking.withdraw(
        stakingRewards,
      );
      getAvailableRewards();
    }
  }

  async function connectToStaking() {
    const signer = library.getSigner();
    const connectedStaking = await contracts.staking.connect(signer);
    setConnectedStaking(connectedStaking);
  }

  useEffect(() => {
    connectToStaking();
  }, []);

  useEffect(() => {
    if (contracts && connectedStaking) {
      getAvailableRewards();
    }
  }, [contracts, connectedStaking]);

  function getTotalClaimRewards(): number {
    return (
      bigNumberToNumber(stakingRewards) +
      grantRewards +
      escrowRewards +
      beneficiaryGovernanceRewards
    );
  }
  return (
    <div className="w-full bg-gray-900 h-screen">
      <NavBar />
      <div className="pt-12 px-4 sm:px-6 lg:px-8 lg:pt-20">
        <div className="text-center">
          <h2 className="text-lg leading-6 font-semibold text-gray-300 uppercase tracking-wider"></h2>
          <p className="mt-2 text-3xl font-extrabold text-white sm:text-4xl lg:text-5xl">
            Claim Rewards
          </p>
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

      <div className="flex flex-col my-10 bg-gray-900">
        <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
            <p className="mx-10 my-4 max-w-4xl  text-xl text-white sm:mt-5 sm:text-2xl">
              Claim rewards by contract
            </p>
            <div className="mx-10 shadow overflow-hidden border-b border-gray-200 ">
              <ul className="space-y-3 mt-6 mb-16">
                <ClaimRewardsListItem
                  contractName={'Beneficiary Governance'}
                  rewardAmount={beneficiaryGovernanceRewards}
                  claimRewards={() => {}}
                />
                <ClaimRewardsListItem
                  contractName={'Escrow'}
                  rewardAmount={escrowRewards}
                  claimRewards={() => {}}
                />
                <ClaimRewardsListItem
                  contractName={'Grant Elections'}
                  rewardAmount={grantRewards}
                  claimRewards={() => {}}
                />
                <ClaimRewardsListItem
                  contractName={'Staking'}
                  rewardAmount={bigNumberToNumber(stakingRewards)}
                  claimRewards={claimStakingRewards}
                />
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
