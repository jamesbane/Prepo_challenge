import React from "react";
import style from './Panel.module.scss'

interface IProps {
    title: string,
    value: any,
    percent: any
}
const Panel = (props: IProps) => {
    const {title, value, percent} = props;
    return (
        <div className={style.panelContainer}>
            <div className={style.autoRow}>
                <div className={style.title}>{title}</div>
                <div className={style.rowEnd}>
                    <span className={style.value}>{value}</span>
                    <span className={style.percent}>{percent}</span>
                </div>
            </div>
        </div>
    )
};

export default Panel;