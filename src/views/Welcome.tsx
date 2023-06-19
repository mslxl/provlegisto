import * as Card from "../components/Card";
import * as Menubar from "../components/Menubar";
import { useTranslation } from 'react-i18next';

import './Welcome.less'

export default function Welcome() {
  const { t, i18n } = useTranslation()

  return (
    <div id="view-welcome">
      <Menubar.Root>
        <Menubar.MenuFile/>
        <Menubar.MenuEdit/>
        <Menubar.MenuSelection/>
        <Menubar.MenuTeamwork/>
        <Menubar.MenuRun/>
        <Menubar.MenuHelp/>
      </Menubar.Root>

      <div id="content">
        <Card.Root>
          <Card.Heading>
            <h3>{t('Quick Start')}</h3>
          </Card.Heading>
          <Card.Content>
            <span>{t('Empty')}</span>
          </Card.Content>
        </Card.Root>
        <Card.Root>
          <Card.Heading>
            <h3>{t('Recent')}</h3>
          </Card.Heading>
          <Card.Content>
            <span>{t('Empty')}</span>
          </Card.Content>
        </Card.Root>
      </div>
    </div>
  )
}