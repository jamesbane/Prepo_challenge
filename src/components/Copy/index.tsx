import React from 'react'
import { useCopyClipboard } from '../../utils'
import { CheckCircle, Copy } from 'react-feather'
import style from './Copy.module.scss';

export default function CopyHelper({ toCopy }) {
  const [isCopied, setCopied] = useCopyClipboard();

  return (
    <div className={style.copyIcon} onClick={() => setCopied(toCopy)}>
      {isCopied ? (
        <span className={style.transactionStatus}>
          <CheckCircle size={'14'} />
        </span>
      ) : (
        <span className={style.transactionStatus}>
          <Copy size={'14'} />
        </span>
      )}
    </div>
  )
}
