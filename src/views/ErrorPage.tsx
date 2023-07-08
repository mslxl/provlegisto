import styles from './ErrorPage.module.scss'

import { useRouteError } from 'react-router-dom'

export default function Page() {
  const error:any = useRouteError()
  console.error(error)
  return (
    <div className={styles.error_page}>
      <h1>Oops!</h1>
      <p>Sorry, an unexpected error has occured.</p>
      <p>
        <i>{error.statusText || error.message}</i>
      </p>
    </div>
  )
}