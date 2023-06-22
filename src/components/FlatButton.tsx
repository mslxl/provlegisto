import { ReactNode } from 'react'
import classnames from 'classnames'
import styles from './FlatButton.module.scss'

export default function FlatButton({ children }: { children?: ReactNode }) {
  return (
    <button className={styles.button}>
      {children}
    </button>
  )
}