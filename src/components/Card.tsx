import { ReactNode } from 'react'
import styles from './Card.module.scss'

export function Heading({ children }: { children?: ReactNode }) {
  return (
    <div className={styles.card_heading}>
      {children}
    </div>
  )

}

export function Content({ children }: { children?: ReactNode }) {
  return (
    <div className={styles.card_content}>
      {children}
    </div>
  )
}

export function Root({ children }: { children?: ReactNode }) {
  return (
    <div className={styles.card}>
      {children}
    </div>
  )
}