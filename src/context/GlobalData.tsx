import {createContext, useCallback, useContext, useEffect, useMemo, useReducer} from "react";
import dayjs from "dayjs";
import {client} from "../apollo/client";
import {ETH_PRICE} from "../apollo/queries";
import {getPercentChange, getBlockFromTimestamp} from "../utils";

const UPDATE = 'UPDATE';
const UPDATE_ETH_PRICE = 'UPDATE_ETH_PRICE';
const ETH_PRICE_KEY = 'ETH_PRICE_KEY';

const GlobalDataContext = createContext(null);

function useGlobalDataContext() {
    return useContext(GlobalDataContext)
}

export function useEthPrice() {
    const [state, {updateEthPrice}] = useGlobalDataContext();
    const ethPrice = state?.[ETH_PRICE_KEY];
    const ethPriceOld = state?.['oneDayPrice'];
    useEffect(() => {
        async function checkForEthPrice() {
            if (!ethPrice) {
                let [newPrice, oneDayPrice, priceChange] = await getEthPrice();
                updateEthPrice(newPrice, oneDayPrice, priceChange)
            }
        }

        checkForEthPrice()
    }, [ethPrice, updateEthPrice]);

    return [ethPrice, ethPriceOld]
}

function reducer(state, {type, payload}) {
    switch (type) {
        case UPDATE: {
            const {data} = payload;
            return {
                ...state,
                globalData: data,
            }
        }
        case UPDATE_ETH_PRICE: {
            const {ethPrice, oneDayPrice, ethPriceChange} = payload;
            return {
                [ETH_PRICE_KEY]: ethPrice,
                oneDayPrice,
                ethPriceChange,
            }
        }

        default: {
            throw Error(`Unexpected action type in DataContext reducer: '${type}'.`)
        }
    }
}

export default function Provider({children}) {
    const [state, dispatch] = useReducer(reducer, {});
    const update = useCallback((data) => {
        dispatch({
            type: UPDATE,
            payload: {
                data,
            },
        })
    }, []);

    const updateEthPrice = useCallback((ethPrice, oneDayPrice, ethPriceChange) => {
        dispatch({
            type: UPDATE_ETH_PRICE,
            payload: {
                ethPrice,
                oneDayPrice,
                ethPriceChange,
            },
        })
    }, []);
    return (
        <GlobalDataContext.Provider
            value={useMemo(
                () => [
                    state,
                    {
                        update,
                        updateEthPrice
                    },
                ],
                [
                    state,
                    update,
                    updateEthPrice,
                ]
            )}
        >
            {children}
        </GlobalDataContext.Provider>
    )
}

const getEthPrice = async () => {
    const utcCurrentTime = dayjs();
    const utcOneDayBack = utcCurrentTime.subtract(1, 'day').startOf('minute').unix();

    let ethPrice = 0;
    let ethPriceOneDay = 0;
    let priceChangeETH = 0;

    try {
        let oneDayBlock = await getBlockFromTimestamp(utcOneDayBack);
        let result = await client.query({
            query: ETH_PRICE(),
            fetchPolicy: 'cache-first',
        });
        let resultOneDay = await client.query({
            query: ETH_PRICE(oneDayBlock),
            fetchPolicy: 'cache-first',
        });
        const currentPrice = result?.data?.bundles[0]?.ethPrice;
        const oneDayBackPrice = resultOneDay?.data?.bundles[0]?.ethPrice;
        priceChangeETH = getPercentChange(currentPrice, oneDayBackPrice);
        ethPrice = currentPrice;
        ethPriceOneDay = oneDayBackPrice
    } catch (e) {
        console.log(e)
    }

    return [ethPrice, ethPriceOneDay, priceChangeETH]
};