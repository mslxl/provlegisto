import { ReactNode } from 'react'
import './Card.less'

export default function Card({ children }: { children?: ReactNode }) {
  return (
    <div className='provlegisto-card'>
      {children}
    </div>
  )
}