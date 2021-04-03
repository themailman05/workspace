import { InjectedConnector } from '@web3-react/injected-connector';
import { NetworkConnector } from '@web3-react/network-connector';

const Injected = new InjectedConnector({ supportedChainIds: [1, 4, 31337] });
const Network = new NetworkConnector({
  urls: {
    1: `https://mainnet.infura.io/v3/${process.env.NEXT_PUBLIC_INFURA_API_KEY}`,
    4: `https://rinkeby.infura.io/v3/${process.env.NEXT_PUBLIC_INFURA_API_KEY}`,
  },
  defaultChainId: 4,
});

export const connectors = { Injected, Network };
