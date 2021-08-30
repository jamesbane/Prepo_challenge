import Numeral from 'numeral'
import {useCallback, useEffect, useState} from "react";
import {Contract} from '@ethersproject/contracts'
import {blockClient} from "../apollo/client";
import {GET_BLOCK, GET_BLOCKS} from "../apollo/queries";
import dayjs from "dayjs";
import copy from 'copy-to-clipboard'

import {JsonRpcSigner, Web3Provider} from '@ethersproject/providers'
import {AddressZero} from '@ethersproject/constants'
import {ethers} from "ethers";
import { SupportedChainId } from "../constants/chains";

interface BasicData {
    token0?: {
        id: string,
        name: string,
        symbol: string,
    },
    token1?: {
        id: string,
        name: string,
        symbol: string,
    }
}

export const toK = (num) => {
    return Numeral(num).format('0.[00]a')
};

export const formatDollarAmount = (num, digits) => {
    const formatter = new Intl.NumberFormat([], {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: digits,
        maximumFractionDigits: digits,
    });
    return formatter.format(num)
};

export const formattedNum = (number, usd = false) => {
    if (isNaN(number) || number === '' || number === undefined) {
        return usd ? '$0' : 0
    }
    let num = parseFloat(number);

    if (num > 500000000) {
        return (usd ? '$' : '') + toK(num.toFixed(0))
    }

    if (num === 0) {
        if (usd) {
            return '$0'
        }
        return 0
    }

    if (num < 0.0001 && num > 0) {
        return usd ? '< $0.0001' : '< 0.0001'
    }

    if (num > 1000) {
        return usd ? formatDollarAmount(num, 0) : Number(parseFloat(String(num)).toFixed(0)).toLocaleString()
    }

    if (usd) {
        if (num < 0.1) {
            return formatDollarAmount(num, 4)
        } else {
            return formatDollarAmount(num, 2)
        }
    }

    return Number(parseFloat(String(num)).toFixed(4)).toString()
};


export async function splitQuery(query, localClient, vars, list, skipCount = 100) {
    let fetchedData = {};
    let allFound = false;
    let skip = 0;

    while (!allFound) {
        let end = list.length;
        if (skip + skipCount < list.length) {
            end = skip + skipCount
        }
        let sliced = list.slice(skip, end);
        let result = await localClient.query({
            query: query(...vars, sliced),
            fetchPolicy: 'cache-first',
        });
        fetchedData = {
            ...fetchedData,
            ...result.data,
        };
        if (Object.keys(result.data).length < skipCount || skip + skipCount > list.length) {
            allFound = true
        } else {
            skip += skipCount
        }
    }

    return fetchedData
}

export async function getBlocksFromTimestamps(timestamps, skipCount = 500) {
    if (timestamps?.length === 0) {
        return []
    }

    let fetchedData = await splitQuery(GET_BLOCKS, blockClient, [], timestamps, skipCount);

    let blocks = [];
    if (fetchedData) {
        for (const t in fetchedData) {
            if (fetchedData[t].length > 0) {
                blocks.push({
                    timestamp: t.split('t')[1],
                    number: fetchedData[t][0]['number'],
                })
            }
        }
    }
    return blocks
}


export const isAddress = (value) => {
    try {
        return ethers.utils.getAddress(value.toLowerCase())
    } catch {
        return false
    }
};


export const getPercentChange = (valueNow, value24HoursAgo) => {
    const adjustedPercentChange =
        ((parseFloat(valueNow) - parseFloat(value24HoursAgo)) / parseFloat(value24HoursAgo)) * 100;
    if (isNaN(adjustedPercentChange) || !isFinite(adjustedPercentChange)) {
        return 0
    }
    return adjustedPercentChange
};


const TOKEN_OVERRIDES: { [address: string]: { name: string; symbol: string } } = {
    '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2': {
        name: 'Ether (Wrapped)',
        symbol: 'ETH',
    },
    '0x1416946162b1c2c871a73b07e932d2fb6c932069': {
        name: 'Energi',
        symbol: 'NRGE',
    },
};

export function updateNameData(data: BasicData): BasicData | undefined {
    if (data?.token0?.id && Object.keys(TOKEN_OVERRIDES).includes(data.token0.id)) {
        data.token0.name = TOKEN_OVERRIDES[data.token0.id].name;
        data.token0.symbol = TOKEN_OVERRIDES[data.token0.id].symbol
    }

    if (data?.token1?.id && Object.keys(TOKEN_OVERRIDES).includes(data.token1.id)) {
        data.token1.name = TOKEN_OVERRIDES[data.token1.id].name;
        data.token1.symbol = TOKEN_OVERRIDES[data.token1.id].symbol
    }

    return data
}


export const get2DayPercentChange = (valueNow, value24HoursAgo, value48HoursAgo) => {
    // get volume info for both 24 hour periods
    let currentChange = parseFloat(valueNow) - parseFloat(value24HoursAgo);
    let previousChange = parseFloat(value24HoursAgo) - parseFloat(value48HoursAgo);

    const adjustedPercentChange = (parseFloat(String(currentChange - previousChange)) / parseFloat(String(previousChange))) * 100;

    if (isNaN(adjustedPercentChange) || !isFinite(adjustedPercentChange)) {
        return [currentChange, 0]
    }
    return [currentChange, adjustedPercentChange]
};


export function getTimestampsForChanges() {
    const utcCurrentTime = dayjs();
    const t1 = utcCurrentTime.subtract(1, 'day').startOf('minute').unix();
    const t2 = utcCurrentTime.subtract(2, 'day').startOf('minute').unix();
    const tWeek = utcCurrentTime.subtract(1, 'week').startOf('minute').unix();
    return [t1, t2, tWeek]
}


export async function getBlockFromTimestamp(timestamp) {
    let result = await blockClient.query({
        query: GET_BLOCK,
        variables: {
            timestampFrom: timestamp,
            timestampTo: timestamp + 600,
        },
        fetchPolicy: 'cache-first',
    });
    return result?.data?.blocks?.[0]?.number
}


export function useCopyClipboard(timeout = 500) {
    const [isCopied, setIsCopied] = useState<any>(false);

    const staticCopy = useCallback((text) => {
        const didCopy = copy(text);
        setIsCopied(didCopy)
    }, []);

    useEffect(() => {
        if (isCopied) {
            const hide = setTimeout(() => {
                setIsCopied(false)
            }, timeout);

            return () => {
                clearTimeout(hide)
            }
        }
    }, [isCopied, setIsCopied, timeout]);

    return [isCopied, staticCopy]
}

function getSigner(library: Web3Provider, account: string): JsonRpcSigner {
    return library.getSigner(account).connectUnchecked()
}

export function escapeRegExp(string: string): string {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') // $& means the whole matched string
}

function getProviderOrSigner(library: Web3Provider, account?: string): Web3Provider | JsonRpcSigner {
    return account ? getSigner(library, account) : library
}

export function getContract(address: string, ABI: any, library: Web3Provider, account?: string): Contract {
    if (!isAddress(address) || address === AddressZero) {
        throw Error(`Invalid 'address' parameter '${address}'.`)
    }

    return new Contract(address, ABI, getProviderOrSigner(library, account))
}


export function supportedChainId(chainId: number): number | undefined {
    if (chainId in SupportedChainId) {
        return chainId
    }
    return undefined
}
