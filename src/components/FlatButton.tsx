import { ReactNode } from 'react'
import './FlatButton.less'

export default function FlatButton({ children }: { children?: ReactNode }) {
  return (
    <button className='provlegisto-flat-button'>
      {children}
    </button>
  )
}