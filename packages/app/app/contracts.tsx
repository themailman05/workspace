import { Contract } from '@ethersproject/contracts';
import { Web3Provider } from '@ethersproject/providers';
import { useWeb3React, UnsupportedChainIdError } from '@web3-react/core';
import React, { useEffect } from 'react';
import { createContext, useState } from 'react';
import { connectors } from '../containers/Web3/connectors';
import {
  NoEthereumProviderError,
  UserRejectedRequestError as UserRejectedRequestErrorInjected,
} from '@web3-react/injected-connector';
import {
  GrantElections,
  GrantElections__factory,
  Staking,
  Staking__factory,
  BeneficiaryRegistry,
  BeneficiaryRegistry__factory,
  ERC20,
  ERC20__factory,
} from '@popcorn/contracts/typechain';

export interface Contracts {
  staking?: Staking;
  beneficiary?: BeneficiaryRegistry;
  election?: GrantElections;
  pop?: ERC20;
}

interface ContractsContext {
  contracts: Contracts;
  setContracts: React.Dispatch<Contracts>;
}

export const ContractsContext = createContext<ContractsContext>(null);

interface ContractsWrapperProps {
  children: React.ReactNode;
}

function getErrorMessage(error: Error) {
  if (error instanceof NoEthereumProviderError) {
    return 'No Ethereum browser extension detected, install MetaMask on desktop or visit from a dApp browser on mobile.';
  } else if (error instanceof UnsupportedChainIdError) {
    return "You're connected to an unsupported network. Please connect to Rinkeby or Localhost";
  } else if (error instanceof UserRejectedRequestErrorInjected) {
    return 'Please authorize this website to access your Ethereum account.';
  } else {
    console.error(error);
    return 'An unknown error occurred. Check the console for more details.';
  }
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
    if (error) {
      alert(getErrorMessage(error));
    }
  }, [error]);

  useEffect(() => {
    if (!library) {
      return;
    }
    setContracts({
      staking: Staking__factory.connect(process.env.ADDR_STAKING, library),
      beneficiary: BeneficiaryRegistry__factory.connect(
        process.env.ADDR_BENEFICIARY_REGISTRY,
        library,
      ),
      election: GrantElections__factory.connect(
        process.env.ADDR_GRANT_ELECTION,
        library,
      ),
      pop: ERC20__factory.connect(process.env.ADDR_POP, library),
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
