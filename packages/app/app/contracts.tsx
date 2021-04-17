import { Contract } from '@ethersproject/contracts';
import { Web3Provider } from '@ethersproject/providers';
import { useWeb3React, UnsupportedChainIdError } from '@web3-react/core';
import React, { useContext, useEffect } from 'react';
import { createContext, useState } from 'react';
import MockPop from '@popcorn/contracts/artifacts/contracts/mocks/MockERC20.sol/MockERC20.json';
import Staking from '@popcorn/contracts/artifacts/contracts/Staking.sol/Staking.json';
import GrantElections from '@popcorn/contracts/artifacts/contracts/GrantElections.sol/GrantElections.json';
import GrantRegistry from '@popcorn/contracts/artifacts/contracts/GrantRegistry.sol/GrantRegistry.json';
import BeneficiaryRegistry from '@popcorn/contracts/artifacts/contracts/BeneficiaryRegistry.sol/BeneficiaryRegistry.json';
import PrivateSale from '@popcorn/contracts/artifacts/contracts/PrivateSale.sol/PrivateSale.json';
import { abi as ERC20ABI } from '@openzeppelin/contracts/build/contracts/ERC20.json';
import { connectors, networkMap } from '../containers/Web3/connectors';
import {
  NoEthereumProviderError,
  UserRejectedRequestError as UserRejectedRequestErrorInjected,
} from '@web3-react/injected-connector';
import { store } from './store';
import { setSingleActionModal } from './actions';

export interface Contracts {
  staking: Contract;
  beneficiary: Contract;
  election: Contract;
  pop: Contract;
  grant: Contract;
  USDC: Contract;
  privateSale: Contract;
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
    return `You're connected to an unsupported network. Please connect to ${networkMap[Number(process.env.CHAIN_ID)]}.`;
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
  const { dispatch } = useContext(store);

  useEffect(() => {
    if (!active) {
      activate(connectors.Network);
    }
  }, [active]);

  useEffect(() => {
    if (error) {
      dispatch(
        setSingleActionModal({
          content: getErrorMessage(error),
          title: 'Wallet Error',
          visible: true,
          type: 'error',
          onConfirm: {
            label: 'Close',
            onClick: () => dispatch(setSingleActionModal(false)),
          },
        }),
      );
    }
  }, [error]);

  useEffect(() => {
    if (!library) {
      return;
    }
    setContracts({
      staking: new Contract(process.env.ADDR_STAKING, Staking.abi, library),
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
      pop: new Contract(process.env.ADDR_POP, MockPop.abi, library),
      grant: new Contract(
        process.env.ADDR_GRANT_REGISTRY,
        GrantRegistry.abi,
        library,
      ),
      USDC: new Contract(process.env.ADDR_USDC, ERC20ABI, library),
      privateSale: new Contract(
        process.env.ADDR_PRIVATE_SALE,
        PrivateSale.abi,
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
