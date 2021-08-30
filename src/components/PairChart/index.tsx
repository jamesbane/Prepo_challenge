import React, {useRef, useState} from 'react'
import {useMedia} from 'react-use'
import dayjs from 'dayjs'
import {Text} from 'rebass'

import {formattedNum} from "../../utils";
import {useHourlyRateData, usePairData} from "../../context/PairData";
import {timeframeOptions} from "../../constants";
import {ResponsiveContainer} from "recharts";
import cn from 'classnames';
import Panel from "../Panel";
import style from './PairChart.module.scss'
import CandleStickChart from "../CandleChart";
import Loader from "../Loader";

interface IProps {
    address: string,
}

function formattedPercent(percent) {
    percent = parseFloat(percent);
    if (!percent || percent === 0) {
        return <Text fontWeight={500}>0%</Text>
    }

    if (percent < 0.0001 && percent > 0) {
        return (
            <Text fontWeight={500} color="green">
                {'< 0.0001%'}
            </Text>
        )
    }

    if (percent < 0 && percent > -0.0001) {
        return (
            <Text fontWeight={500} color="red">
                {'< 0.0001%'}
            </Text>
        )
    }

    let fixedPercent = percent.toFixed(2);
    if (fixedPercent === '0.00') {
        return '0%'
    }
    if (fixedPercent > 0) {
        if (fixedPercent > 100) {
            return <Text fontWeight={500} color="green">{`+${percent?.toFixed(0).toLocaleString()}%`}</Text>
        } else {
            return <Text fontWeight={500} color="green">{`+${fixedPercent}%`}</Text>
        }
    } else {
        return <Text fontWeight={500} color="red">{`${fixedPercent}%`}</Text>
    }
}

export default function PairChart(props: IProps) {
    const containerRef = useRef(null);
    const [chartFilter, setChartFilter] = useState('ETH');
    const {address} = props;

    const [timeWindow, setTimeWindow] = useState(timeframeOptions.MONTH);

    const hourlyData = useHourlyRateData(address, timeWindow);
    const hourlyRate0 = hourlyData && hourlyData[0];
    const hourlyRate1 = hourlyData && hourlyData[1];
    const data = hourlyData ? (hourlyRate0 ?? hourlyRate1) : [];


    const {
        reserve0,
        reserve1,
        reserveUSD,
        trackedReserveUSD,
        oneDayVolumeUSD,
        volumeChangeUSD,
        oneDayVolumeUntracked,
        volumeChangeUntracked,
        liquidityChangeUSD,
    } = usePairData(address);
    const base = reserve1 / reserve0;

    const below1600 = useMedia('(max-width: 1600px)');
    const below1080 = useMedia('(max-width: 1080px)');
    const aspect = below1080 ? 60 / 20 : below1600 ? 60 / 20 : 60 / 12;

    const valueFormatter = (val) => formattedNum(val, true);

    // liquidity
    const formattedLiquidity = reserveUSD ? formattedNum(reserveUSD, true) : formattedNum(trackedReserveUSD, true);
    const liquidityChange = formattedPercent(liquidityChangeUSD);

    // volume
    const volume = !!oneDayVolumeUSD ? formattedNum(oneDayVolumeUSD, true) : formattedNum(oneDayVolumeUntracked, true);
    const usingUtVolume = oneDayVolumeUSD === 0 && !!oneDayVolumeUntracked;
    const volumeChange = formattedPercent(!usingUtVolume ? volumeChangeUSD : volumeChangeUntracked);

    // fees
    const fees =
        oneDayVolumeUSD || oneDayVolumeUSD === 0
            ? usingUtVolume
            ? formattedNum(oneDayVolumeUntracked * 0.003, true)
            : formattedNum(oneDayVolumeUSD * 0.003, true)
            : '-';

    const formattedData = data?.map((entry) => {
        return {
            time: parseFloat(entry.timestamp),
            open: parseFloat(entry.open),
            low: parseFloat(entry.open),
            close: parseFloat(entry.close),
            high: parseFloat(entry.close),
        }
    });

    if (formattedData && formattedData.length > 0) {
        formattedData.push({
            time: dayjs().unix(),
            open: parseFloat(formattedData[formattedData.length - 1].close),
            close: parseFloat(String(base)),
            low: Math.min(parseFloat(String(base)), parseFloat(formattedData[formattedData.length - 1].close)),
            high: Math.max(parseFloat(String(base)), parseFloat(formattedData[formattedData.length - 1].close)),
        })
    }

    return (
        <div className={cn(style.container)}>
            <Panel title={'Total Liquidity'} value={formattedLiquidity} percent={liquidityChange} />
            <Panel title={'Volume (24hrs)'} value={volume} percent={volumeChange} />
            <Panel title={'Fees (24hrs)'} value={fees} percent={volumeChange} />
            <div className={style.chartContainer}
                style={{
                    gridColumn: below1080 ? '1' : '2/4',
                    gridRow: below1080 ? '' : '1/4',
                }}>
                <div className={style.row}>
                    <div className={style.row}>
                        <div className={cn(style.optionBtn,{[style.activeBtn]: chartFilter === 'ETH'})}
                             onClick={() => setChartFilter('ETH')}
                        >
                            ETH/DAI
                        </div>
                        <div className={cn(style.optionBtn,{[style.activeBtn]: chartFilter === 'DAI'})}
                             onClick={() => setChartFilter('DAI')}
                        >
                            DAI/ETH
                        </div>
                    </div>
                    <div className={style.flexEnd}>
                        <div className={cn(style.optionBtn,{[style.activeBtn]: timeWindow === timeframeOptions.WEEK})}
                            onClick={() => setTimeWindow(timeframeOptions.WEEK)}
                        >
                            1W
                        </div>
                        <div className={cn(style.optionBtn,{[style.activeBtn]: timeWindow === timeframeOptions.MONTH})}
                            onClick={() => setTimeWindow(timeframeOptions.MONTH)}
                        >
                            1M
                        </div>
                    </div>
                </div>
            {chartFilter === 'ETH'&&
                (hourlyRate0 ? (
                    <ResponsiveContainer ref={containerRef} height={'100%'} aspect={aspect}>
                        <CandleStickChart
                            data={hourlyRate0}
                            base={base}
                            margin={false}
                            width={null}
                            valueFormatter={valueFormatter}
                        />
                    </ResponsiveContainer>
                ) : (
                    <Loader/>
                ))
            }
            {chartFilter === 'DAI'&&
            (hourlyRate1 ? (
                <ResponsiveContainer ref={containerRef} aspect={aspect}>
                    <CandleStickChart
                        data={hourlyRate1}
                        base={base}
                        margin={false}
                        width={null}
                        valueFormatter={valueFormatter}
                    />
                </ResponsiveContainer>
            ) : (
                <Loader/>
            ))
            }
            </div>
        </div>
    )
}