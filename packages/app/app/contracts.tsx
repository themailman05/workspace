import { Contract } from '@ethersproject/contracts';
import { Web3Provider } from '@ethersproject/providers';
import { useWeb3React } from '@web3-react/core';
import React, { useEffect } from 'react';
import { createContext, useState } from 'react';
import MockPop from '../../contracts/artifacts/contracts/mocks/MockERC20.sol/MockERC20.json';
import Staking from '../../contracts/artifacts/contracts/Staking.sol/Staking.json';
import GrantElections from '../../contracts/artifacts/contracts/GrantElections.sol/GrantElections.json';
import BeneficiaryRegistry from '../../contracts/artifacts/contracts/BeneficiaryRegistry.sol/BeneficiaryRegistry.json';

export interface Contracts {
  staking: Contract;
  beneficiary: Contract;
  election: Contract;
  pop: Contract;
}

interface ContractsContext {
  contracts: Contracts;
  setContracts: React.Dispatch<Contracts>;
}

export const ContractsContext = createContext<ContractsContext>(null);

interface ContractsWrapperProps {
  children: React.ReactNode;
}

export default function ContractsWrapper({
  children,
}: ContractsWrapperProps): JSX.Element {
  const context = useWeb3React<Web3Provider>();
  const {
    connector,
    library,
    chainId,
    account,
    activate,
    deactivate,
    active,
    error,
  } = context;
  const [contracts, setContracts] = useState<Contracts>();

  useEffect(() => {
    if (!library) {
      return;
    }
    const beneficiaryContract = new Contract(
      process.env.ADDR_BENEFICIARY_REGISTRY,
      BeneficiaryRegistry.abi,
      library,
    );
    const stakingContract = new Contract(
      process.env.ADDR_STAKING,
      Staking.abi,
      library,
    );
    const electionContract = new Contract(
      process.env.ADDR_GRANT_REGISTRY,
      GrantElections.abi,
      library,
    );
    const popContract = new Contract(
      process.env.ADDR_POP,
      MockPop.abi,
      library,
    );
    setContracts({
      staking: stakingContract,
      beneficiary: beneficiaryContract,
      election: electionContract,
      pop: popContract,
    });
  }, [library]);

  return (
    <ContractsContext.Provider
      value={{
        contracts,
        setContracts,
      }}
    >
      {children}
    </ContractsContext.Provider>
  );
}
