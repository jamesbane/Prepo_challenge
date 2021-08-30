import React from 'react'
import style from './PairPage.module.scss'
import ethLogo from '../../assets/logo/eth.png'
import daiLogo from '../../assets/logo/dai.png'
import PairChart from "../../components/PairChart";
import cn from 'classnames';
import CopyHelper from "../../components/Copy";
import { Button } from 'rebass/styled-components'


export default function PairPage(props) {
    const token1Rate = 0.003;
    const token0Rate = 3214;
    const pairAddress = '0xa478c2975ab1ea89e8196811f51a7b7ade33eb11';
    const ethAddress = '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2';
    const daiAddress = '0x6b175474e89094c44da98b954eedeac495271d0f';

    return (
        <div className={style.container}>
            <div className={style.bgContainer}>
                <div className={style.header}>
                    <div className={style.row}>
                        <div className={style.logo}>
                            <img className={style.higherLogo} src={ethLogo} width={32} height={32} alt={'eth'}/>
                            <img className={style.coverLogo} src={daiLogo} width={32} height={32} alt={'dai'}/>
                        </div>
                        <div className={style.title}>
                            <span>ETH-DAI Pair</span>
                        </div>
                    </div>
                </div>

                <div className={style.contents}>
                    <div className={style.tokenPrices}>
                        <div className={style.priceItem}>
                            1 DAI = {token1Rate} ETH ($1.00)
                        </div>
                        <div className={style.priceItem}>
                            1 ETH = {token0Rate} DAI($3208)
                        </div>
                        <Button className={style.button} onClick={() => {
                            props.history.push('/swap');
                        }}>Trade</Button>
                    </div>

                    <div className={style.pairContents}>
                        <div className={style.pairTitle}>Pair Stats</div>
                        <PairChart address={pairAddress}/>
                    </div>

                    <div className={style.information}>
                        <div className={style.infoTitle}>Pair Information</div>
                        <div className={cn(style.panel, style.row)}>
                            <div className={style.infoItem}>
                                <div>Pair Name</div>
                                <div>ETH-DAI</div>
                            </div>
                            <div className={style.infoItem}>
                                <div>Pair Address</div>
                                <div className={style.row}>{pairAddress}<CopyHelper toCopy={pairAddress} /></div>
                            </div>
                            <div className={style.infoItem}>
                                <div>ETH Address</div>
                                <div className={style.row}>{ethAddress}<CopyHelper toCopy={ethAddress} /></div>
                            </div>
                            <div className={style.infoItem}>
                                <div>DAI Address</div>
                                <div className={style.row}>{daiAddress}<CopyHelper toCopy={daiAddress} /></div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    )
}