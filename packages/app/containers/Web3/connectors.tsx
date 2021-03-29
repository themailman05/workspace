import { InjectedConnector } from '@web3-react/injected-connector';
import { NetworkConnector } from '@web3-react/network-connector';

const Injected = new InjectedConnector({ supportedChainIds: [1, 4, 31337] });
const Network = new NetworkConnector({
  urls: { 1: process.env.RPC_URL, 4: process.env.RPC_URL },
  defaultChainId: 1,
});

export const connectors = { Injected, Network };
