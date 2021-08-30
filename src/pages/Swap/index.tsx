import React, { useEffect, useState } from "react";
import style from "./Swap.module.scss";
import CurrencyInputPanel from "../../components/CurrencyInput";
import ethLogo from "../../assets/logo/eth.png";
import daiLogo from "../../assets/logo/dai.png";
import { Button } from "rebass/styled-components";
import cn from "classnames";
import { injected, NETWORK_URLS } from "../../connectors";
import { useWeb3React } from "@web3-react/core";
import { useEthPrice } from "../../context/GlobalData";
import { useHourlyRateData } from "../../context/PairData";
import { timeframeOptions } from "../../constants";
import { BigNumber } from "bignumber.js";
import { Contract, ethers } from "ethers";
import Web3 from 'web3';
import { WETH9_EXTENDED } from "../../constants/tokens";
import ERC20ABI from '../../abis/erc20.json';
import UniswapV2Router02ABI from '../../abis/uniswapV2Router02.json';
import { V2_ROUTER_ADDRESS } from "../../constants/addresses";

export const Swap = () => {
  const [ethValue, updateEthValue] = useState("0");
  const [daiValue, updateDaiValue] = useState("0");
  const [balance, setBalance] = useState(null);
  const [rate, setRate] = useState(0);
  const [ethPrice] = useEthPrice();
  const { library, account, activate, chainId } = useWeb3React();


  const pairAddress = "0xa478c2975ab1ea89e8196811f51a7b7ade33eb11";
  const hourlyData = useHourlyRateData(pairAddress, timeframeOptions.MONTH);

  useEffect(() => {
    if (hourlyData && hourlyData.length > 0) {
      setRate(hourlyData[0][hourlyData[0].length - 1]["open"]);
    }
  }, [hourlyData]);

  useEffect(() => {
    const fetchBalance = async () => {
      try {
        const simpleProvider = new ethers.providers.JsonRpcProvider(NETWORK_URLS[chainId]);
        const walletBalance = await simpleProvider.getBalance(account);
        setBalance(Web3.utils.fromWei(walletBalance.toString()));
      } catch (e) {
        console.error(e);
      }
    };

    if (account) {
      fetchBalance();
    }
  }, [account, chainId, library]);

  const connectMetamask = () => {
    activate(injected, undefined, true).catch((error) => {
      console.error(error);
    });
  };

  const onSwap = async () => {
    const ethAddress = WETH9_EXTENDED[chainId].address;
    const ethContract = new Contract(ethAddress, ERC20ABI, library.getSigner());
    try {
      await ethContract.transferFrom(account, ethAddress, Web3.utils.toWei(ethValue));
      await ethContract.approve(V2_ROUTER_ADDRESS, Web3.utils.toWei(ethValue));

      let path = [];
      path.push(ethAddress);
      path.push(V2_ROUTER_ADDRESS);

      const uniswapContract = new Contract(V2_ROUTER_ADDRESS, UniswapV2Router02ABI, library.getSigner());
      await uniswapContract.swapExactTokensForETH(Web3.utils.toWei(ethValue), Web3.utils.toWei(daiValue), path, account);

    } catch (e) {
      console.log('error = ', e);
    }
  };

  return (
    <div className={style.container}>
      <div className={style.swapContent}>
        <div className={style.swapHeader}>
          Swap
        </div>
        <CurrencyInputPanel
          logo={ethLogo}
          tokenName={"ETH"}
          value={ethValue}
          balance={balance}
          onMax={() => {
            updateEthValue(balance);
            const newDaiValue = (new BigNumber(balance)).multipliedBy(rate).toNumber().toFixed();
            updateDaiValue(newDaiValue);
          }}
          onUserInput={(value) => {
            if (value == "") {
              updateEthValue("0");
              updateDaiValue("0");
            } else {
              updateEthValue(value);
              const newDaiValue = (new BigNumber(value)).multipliedBy(rate).toNumber().toFixed(6);
              updateDaiValue(newDaiValue);
            }
          }}

          showMaxButton={true}
          fiatValue={(new BigNumber(ethValue)).multipliedBy(ethPrice).toFixed(0)}
          id={"swap-currency-input"}
        />


        <CurrencyInputPanel
          logo={daiLogo}
          tokenName={"DAI"}
          value={daiValue}
          balance={null}
          onUserInput={(value) => {
            if (value == "") {
              updateEthValue("0");
              updateDaiValue("0");
            } else {
              updateDaiValue(value);
              const newEthValue = (new BigNumber(value)).dividedBy(rate).toNumber().toFixed(6);
              updateEthValue((newEthValue.toString()));
            }
          }}
          showMaxButton={true}
          id={"swap-currency-input"}
        />

        <div className={style.buttons}>
          {!account ?
            <Button className={cn(style.walletBtn, style.blueBtn)} onClick={connectMetamask}>
              Connect Metamask
            </Button>
            :
            <Button className={cn(style.walletBtn, style.blueBtn)} onClick={onSwap}>
              Buy
            </Button>}
        </div>
      </div>
    </div>
  );
};