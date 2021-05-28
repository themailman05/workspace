import { Web3Provider } from '@ethersproject/providers';
import { useWeb3React } from '@web3-react/core';
import { useContext  } from 'react';
import { useEffect } from 'react';
import {  networkMap } from '../containers/Web3/connectors';
import { setSingleActionModal } from './actions';
import { store } from './store';



export default function SwapChainModal(): JSX.Element {
  const context = useWeb3React<Web3Provider>();
  const { library, account, activate, active, chainId } = context;
  const { dispatch } = useContext(store);
  
  useEffect(() => {
    if (account && chainId !== Number(process.env.CHAIN_ID || 31337)) {
      dispatch(
        setSingleActionModal({
          content: `The network selected in your wallet is not supported. Please switch to ${networkMap[Number(process.env.CHAIN_ID)]}.`,
          title: 'Network Error',
          visible: true,
          type: 'error',
          onConfirm: {
            label: 'Close',
            onClick: () => dispatch(setSingleActionModal(false)),
          },
        }),
      );
    }
  }, [chainId, account]);

  return <></>;
}