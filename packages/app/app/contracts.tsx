import { Contract } from '@ethersproject/contracts';
import { Web3Provider } from '@ethersproject/providers';
import { useWeb3React } from '@web3-react/core';
import React, { useEffect } from 'react';
import { createContext, useState } from 'react';
import MockPop from '../../contracts/artifacts/contracts/mocks/MockERC20.sol/MockERC20.json';
import Staking from '../../contracts/artifacts/contracts/Staking.sol/Staking.json';
import GrantElections from '../../contracts/artifacts/contracts/GrantElections.sol/GrantElections.json';
import BeneficiaryRegistry from '../../contracts/artifacts/contracts/BeneficiaryRegistry.sol/BeneficiaryRegistry.json';
import { connectors } from '../containers/Web3/connectors';

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
    if (!active) {
      activate(connectors.Network);
    }
  }, [active]);

  useEffect(() => {
    if (!library) {
      return;
    }
    setContracts({
      staking: new Contract(
        process.env.ADDR_STAKING,
        Staking.abi,
        library,
      ),
      beneficiary: new Contract(
        process.env.ADDR_BENEFICIARY_REGISTRY,
        BeneficiaryRegistry.abi,
        library,
      ),
      election: new Contract(
        process.env.ADDR_GRANT_ELECTION,
        GrantElections.abi,
        library,
      ),
      pop: new Contract(
        process.env.ADDR_POP,
        MockPop.abi,
        library,
      ),
    });
  }, [library, active]);

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
