import { Token, WETH9 } from "@uniswap/sdk-core";
import { SupportedChainId } from "./chains";

export const DAI = new Token(
  SupportedChainId.MAINNET,
  "0x6B175474E89094C44Da98b954EedeAC495271d0F",
  18,
  "DAI",
  "Dai Stablecoin"
);

export const WETH9_EXTENDED: { [chainId: number]: Token } = {
  ...WETH9,
  [SupportedChainId.RINKEBY]: new Token(
    SupportedChainId.RINKEBY,
    '0xdf032bc4b9dc2782bb09352007d4c57b75160b15',
    18,
    'WETH',
    'Wrapped Ether'
  ),
}