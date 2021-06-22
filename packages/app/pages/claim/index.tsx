import { getIpfsHashFromBytes32 } from '@popcorn/utils/ipfsHashManipulation';
import BeneficiaryGrid from 'components/Beneficiaries/BeneficiaryGrid';
import { Beneficiary } from 'interfaces/beneficiaries';
import { useContext, useEffect, useState } from 'react';
import { ContractsContext } from '../../context/Web3/contracts';
import NavBar from '../../components/NavBar/NavBar';
import { GrantsMenu } from 'components/NavBar/GrantsMenu';

const people = [
  {
    contract: 'Escrow',
    earned: 100,
    department: 'Earned (POP) Tokens',
    role: 'Admin',
    email: 'jane.cooper@example.com',
  },
  {
    contract: 'Beneficiary Governance',
    earned: 100,
    department: 'Optimization',
    role: 'Admin',
    email: 'jane.cooper@example.com',
  },
  {
    contract: 'Staking',
    earned: 100,
    department: 'Optimization',
    role: 'Admin',
    email: 'jane.cooper@example.com',
  },
  {
    contract: 'Grant Elections',
    earned: 100,
    department: 'Optimization',
    role: 'Admin',
    email: 'jane.cooper@example.com',
  },
].sort((a, b) => {
  var nameA = a.contract.toUpperCase(); // ignore upper and lowercase
  var nameB = b.contract.toUpperCase(); // ignore upper and lowercase
  if (nameA < nameB) {
    return -1;
  }
  if (nameA > nameB) {
    return 1;
  }
  return 0;
});

export default function Claim(): JSX.Element {
  const { contracts } = useContext(ContractsContext);
  const [beneficiaryGovernanceRewards, setBeneficiaryGovernanceRewards] = useState<number>(0);
  const [escrowRewards, setEscrowRewards] = useState<number>(0);
  const [grantRewards, setGrantRewards] = useState<number>(0);
  const [stakingRewards, setStakingRewards] = useState<number>(0);
    useState<number>(0);

  async function getRewards() {
    const beneficiaryGovernanceRewards = await contracts.beneficiaryGovernance.claimRewards();
    const grantRewards = await contracts.grant.claimRewards();
    const stakingRewards = await contracts.staking.getReward();
    const escrowRewards = await contracts._claimFor(); // TODO: Get correct fn call
    setBeneficiaryGovernanceRewards(beneficiaryGovernanceRewards)
    setStakingRewards(stakingRewards)
    setGrantRewards(grantRewards)
    setEscrowRewards(escrowRewards)
  }

  useEffect(() => {
    if (contracts) {
      getRewards();
    }
  }, [contracts]);

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

      <div className="flex flex-col my-10">
        <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
            <p className="mx-10 my-4 max-w-4xl  text-xl text-gray-300 sm:mt-5 sm:text-2xl">
              Rewards by contract
            </p>
            <div className="mx-10 shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
              <table className="min-w-full divide-y divide-gray-200">
                <tbody className="bg-white divide-y divide-gray-200">
                  {people.map((person) => (
                    <tr key={person.email}>
                      <td className="w-1/6 px-6 py-4 whitespace-nowrap ">
                        <div className="flex items-center my-5">
                          <div className="ml-4">
                            <p className="text-lg leading-6 font-medium text-gray-900">
                              {person.contract}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="w-2/3 px-6 py-4 whitespace-nowrap ">
                        <div className="text-sm text-gray-500">
                          {person.department}
                        </div>
                        <div className="text-lg leading-6 font-medium text-gray-900">
                          {person.earned}
                        </div>
                      </td>

                      <td className="w-1/6 px-6 py-4 whitespace-nowrap text-right text-sm font-medium ">
                        <a
                          href="#"
                          className="inline-flex px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
                        >
                          Claim
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
