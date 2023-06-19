import { useTranslation } from 'react-i18next'
import * as Card from './Card'
import {PlusIcon, LayersIcon, TimerIcon, PersonIcon} from '@radix-ui/react-icons'

import './QuickStartBoard.less'
import FlatButton from './FlatButton'

export default function QuickStartBoard() {
  const { t } = useTranslation()
  return (
    <Card.Root>
      <Card.Heading>
        <h3>{t('Quick Start')}</h3>
      </Card.Heading>
      <Card.Content>
        <ul className='quick-start-board'>
          <li>
            <FlatButton>
               <PlusIcon/>
               {t('New Problem')}
            </FlatButton>
          </li>
          <li>
            <FlatButton>
              <TimerIcon/>
              {t('New Contest')}
            </FlatButton>
          </li>
          <li>
            <FlatButton>
               <PersonIcon/>
               {t('Join Team')}
            </FlatButton>
          </li>
          <li>
            <FlatButton> 
              <LayersIcon/>
              {t('Open Problem List')}
            </FlatButton>
          </li>
        </ul>
      </Card.Content>
    </Card.Root>
  )
}