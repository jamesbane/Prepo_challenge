import React from "react";
import { Currency } from "@uniswap/sdk-core";
import cn from "classnames";

import NumericalInput from "../NumbericalInput";
import { Text } from "rebass";
import style from "./CurrencyInput.module.scss";
import BigNumber from "bignumber.js";

interface CurrencyInputPanelProps {
  logo: any,
  tokenName: string,
  value: string,
  onUserInput: (value) => void,
  onMax?: () => void,
  showMaxButton: boolean,
  currency?: Currency | null,
  fiatValue?: string | null,
  id: string,
  balance?: number | null
}

export default function CurrencyInputPanel({
                                             value,
                                             onUserInput,
                                             onMax,
                                             showMaxButton,
                                             balance,
                                             id,
                                             logo,
                                             tokenName,
                                             fiatValue
                                           }: CurrencyInputPanelProps) {
  return (
    <div className={style.inputPanel} id={id}>
      <div className={style.container}>
        <div className={style.inputRow}>
          <div className={style.currencySelect}>
                        <span className={style.aligner}>
                            <div className={style.rowFixed}>
                                <img src={logo} width={32} height={32} alt={"eth"}/>
                                <span className={style.tokenName}>{tokenName}</span>
                            </div>
                        </span>
          </div>
          <NumericalInput
            value={value}
            onUserInput={(val) => {
              onUserInput(val);
            }}
          />
        </div>
        <div className={cn(style.labelRow, style.fiatRow)}>
          <div className={style.rowBetween}>
            <div className={style.rowFixed} style={{ height: "17px" }}>
              <Text
                onClick={onMax}
                color={"#C3C5CB"}
                fontWeight={400}
                fontSize={14}
                style={{ display: "inline", cursor: "pointer" }}
              >
                {balance ? (
                  <span>Balance: {(new BigNumber(balance)).toFixed(4)}</span>
                ) : null}
              </Text>
              {showMaxButton && balance ? (
                <button className={style.maxBtn} onClick={onMax}>
                  (Max)
                </button>
              ) : null}
            </div>
            <div className={style.fiatValue}>~$ {fiatValue}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
