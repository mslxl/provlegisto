import { ReactNode } from 'react'
import './Card.less'

export function Heading({children}: { children?: ReactNode}) {
  return (
    <div className='provlegisto-card-heading'>
      {children}
    </div>
  )

}

export function Content({children}: {children? : ReactNode}) {
  return (
    <div className='provlegisto-card-content'>
      {children}
    </div>
  )
}

export function Root({ children }: { children?: ReactNode }) {
  return (
    <div className='provlegisto-card'>
      {children}
    </div>
  )
}