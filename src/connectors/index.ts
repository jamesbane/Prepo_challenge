import { InjectedConnector } from '@web3-react/injected-connector'
import { ALL_SUPPORTED_CHAIN_IDS, SupportedChainId } from "../constants/chains";

const INFURA_KEY = process.env.REACT_APP_INFURA_KEY;

if (typeof INFURA_KEY === 'undefined') {
  throw new Error(`REACT_APP_INFURA_KEY must be a defined environment variable`)
}

export const injected = new InjectedConnector({
  supportedChainIds: ALL_SUPPORTED_CHAIN_IDS,
});


export const NETWORK_URLS: { [key in SupportedChainId]: string } = {
  [SupportedChainId.MAINNET]: `https://mainnet.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161`,
  [SupportedChainId.RINKEBY]: `https://rinkeby.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161`,
};
