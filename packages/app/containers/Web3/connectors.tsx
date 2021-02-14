import { Connectors } from 'web3-react'
import { NetworkOnlyConnector } from 'web3-react/dist/connectors';
const { InjectedConnector } = Connectors
 
const MetaMask = new InjectedConnector({ supportedNetworks: [1, 4] })
const Infura = new NetworkOnlyConnector({ providerURL: process.env.RPC_URL })

export const connectors = { MetaMask, Infura };
