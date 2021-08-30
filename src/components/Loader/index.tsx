import React from 'react';
import loaderImg from '../../assets/loading.png';

import style from './Loader.module.scss';

const Loader = () => {
    return (
        <div className={style.wrapper}>
            <div className={style.animatedImg}>
                <img src={loaderImg} alt="loading-icon" />
            </div>
        </div>
    )
};

export default Loader