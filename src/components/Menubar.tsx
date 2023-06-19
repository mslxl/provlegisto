import {process} from '@tauri-apps/api'

import * as Menubar from '@radix-ui/react-menubar'

import { ReactNode } from 'react'
import { ChevronRightIcon } from '@radix-ui/react-icons';

import { useTranslation } from 'react-i18next'

import './Menubar.less'


function actionExit(){
  process.exit(0)
}


export function Root({ children }: { children?: ReactNode }) {
  return (
    <Menubar.Root className="MenubarRoot">
      {children}
    </Menubar.Root>
  )
}

export function MenuEdit() {
  const { t } = useTranslation()
  return (
    <Menubar.Menu>
      <Menubar.Trigger className="MenubarTrigger">{t('Edit')}</Menubar.Trigger>
      <Menubar.Portal>
        <Menubar.Content className='MenubarContent'>
          <Menubar.Item className='MenubarItem'>{t('Undo')}</Menubar.Item>
          <Menubar.Item className='MenubarItem'>{t('Redo')}</Menubar.Item>
          <Menubar.Separator className='MenubarSeparator' />

          <Menubar.Item className='MenubarItem'>{t('Cut')}</Menubar.Item>
          <Menubar.Item className='MenubarItem'>{t('Copy')}</Menubar.Item>
          <Menubar.Item className='MenubarItem'>{t('Paste')}</Menubar.Item>
          <Menubar.Separator className='MenubarSeparator' />

          <Menubar.Item className='MenubarItem'>{t('Find')}</Menubar.Item>
          <Menubar.Item className='MenubarItem'>{t('Replace')}</Menubar.Item>
          <Menubar.Separator className='MenubarSeparator' />

          <Menubar.Item className='MenubarItem'>{t('Toggle Line Comment')}</Menubar.Item>
          <Menubar.Item className='MenubarItem'>{t('Toggle Block Comment')}</Menubar.Item>

        </Menubar.Content>
      </Menubar.Portal>
    </Menubar.Menu>
  )
}

export function MenuFile() {
  const { t } = useTranslation()
  return (
    <Menubar.Menu>
      <Menubar.Trigger className="MenubarTrigger">{t('Problem')}</Menubar.Trigger>
      <Menubar.Portal>
        <Menubar.Content className="MenubarContent">
          <Menubar.Item className='MenubarItem'>{t('New Problem')}</Menubar.Item>
          <Menubar.Item className='MenubarItem'>{t('New Contest')}</Menubar.Item>
          <Menubar.Item className='MenubarItem'>{t('New Problem List')}</Menubar.Item>
          <Menubar.Separator className='MenubarSeparator' />
          <Menubar.Item className='MenubarItem'>{t('Open Contest')}</Menubar.Item>
          <Menubar.Item className='MenubarItem'>{t('Open Problem List')}</Menubar.Item>
          <Menubar.Sub>
            <Menubar.SubTrigger className='MenubarSubTrigger'>
              {t('Open Recent Item')}
              <div className="RightSlot">
                <ChevronRightIcon />
              </div>
            </Menubar.SubTrigger>
            <Menubar.Portal>
              <Menubar.SubContent className='MenubarSubContent'>
                <Menubar.Item className='MenubarItem'>TEST</Menubar.Item>
              </Menubar.SubContent>
            </Menubar.Portal>
          </Menubar.Sub>

          <Menubar.Separator className='MenubarSeparator' />

          <Menubar.Item className='MenubarItem'>{t('Save')}</Menubar.Item>
          <Menubar.Item className='MenubarItem'>{t('Move')}</Menubar.Item>
          <Menubar.Separator className='MenubarSeparator' />

          <Menubar.Sub>
            <Menubar.SubTrigger className='MenubarSubTrigger'>
              {t('Export')}
              <div className="RightSlot">
                <ChevronRightIcon />
              </div>
            </Menubar.SubTrigger>
            <Menubar.Portal>
              <Menubar.SubContent className='MenubarSubContent'>
                <Menubar.Item className='MenubarItem'>{t('Export as Picture')}</Menubar.Item>
                <Menubar.Item className='MenubarItem'>{t('Export as Source')}</Menubar.Item>
              </Menubar.SubContent>
            </Menubar.Portal>
          </Menubar.Sub>
          <Menubar.Separator className='MenubarSeparator' />

          <Menubar.Sub>
            <Menubar.SubTrigger className='MenubarSubTrigger'>
              {t('Preferences')}
              <div className="RightSlot">
                <ChevronRightIcon />
              </div>
            </Menubar.SubTrigger>
            <Menubar.Portal>
              <Menubar.SubContent className='MenubarSubContent'>
                <Menubar.Item className='MenubarItem'>{t('Global Preferences')}</Menubar.Item>
                <Menubar.Item className='MenubarItem'>{t('Problem List Preferences')}</Menubar.Item>
              </Menubar.SubContent>
            </Menubar.Portal>
          </Menubar.Sub>
          <Menubar.Separator className='MenubarSeparator' />

          <Menubar.Item className='MenubarItem'>{t('Close Contest')}</Menubar.Item>
          <Menubar.Item className='MenubarItem'>{t('Close Problem List')}</Menubar.Item>
          <Menubar.Separator className='MenubarSeparator' />

          <Menubar.Item className='MenubarItem' onClick={ actionExit }>{t('Exit')}</Menubar.Item>
        </Menubar.Content>
      </Menubar.Portal>
    </Menubar.Menu>
  )
}

export function MenuSelection() {
  const { t } = useTranslation()
  return (
    <Menubar.Menu>
      <Menubar.Trigger className="MenubarTrigger">
        {t('Selection')}
      </Menubar.Trigger>
      <Menubar.Portal>
        <Menubar.Content className='MenubarContent'>
          <Menubar.Item className='MenubarItem'>{t('Select All')}</Menubar.Item>
          {/* <Menubar.Item className='MenubarItem'>Expand All</Menubar.Item>
          <Menubar.Item className='MenubarItem'>Shrink All</Menubar.Item> */}
          <Menubar.Separator className='MenubarSeparator' />


          <Menubar.Item className='MenubarItem'>{t('Copy Line Up')}</Menubar.Item>
          <Menubar.Item className='MenubarItem'>{t('Copy Line Down')}</Menubar.Item>
          <Menubar.Item className='MenubarItem'>{t('Move Line Up')}</Menubar.Item>
          <Menubar.Item className='MenubarItem'>{t('Move Line Down')}</Menubar.Item>
          <Menubar.Item className='MenubarItem'>{t('Duplicate Selection')}</Menubar.Item>
          <Menubar.Separator className='MenubarSeparator' />

          <Menubar.Item className='MenubarItem'>{t('Add Cursor Above')}</Menubar.Item>
          <Menubar.Item className='MenubarItem'>{t('Add Cursor Below')}</Menubar.Item>
          <Menubar.Item className='MenubarItem'>{t('Add Cursor to Line Ends')}</Menubar.Item>
          <Menubar.Item className='MenubarItem'>{t('Add Next Occurrence')}</Menubar.Item>
          <Menubar.Item className='MenubarItem'>{t('Add Previous Occurrence')}</Menubar.Item>
          <Menubar.Item className='MenubarItem'>{t('Select All Occurrences')}</Menubar.Item>

        </Menubar.Content>
      </Menubar.Portal>
    </Menubar.Menu>

  )
}


export function MenuTeamwork() {
  const { t } = useTranslation()
  return (
    <Menubar.Menu>
      <Menubar.Trigger className="MenubarTrigger">{t('Teamwork')}</Menubar.Trigger>
      <Menubar.Portal>
        <Menubar.Content className='MenubarContent'>
          <Menubar.Item className='MenubarItem'>{t('Start')}</Menubar.Item>
          <Menubar.Item className='MenubarItem'>{t('Join')}</Menubar.Item>
          <Menubar.Separator className='MenubarSeparator' />
          <Menubar.Item className='MenubarItem'>{t('Focus Me')}</Menubar.Item>
          <Menubar.Item className='MenubarItem'>{t('Focus Other')}</Menubar.Item>
          <Menubar.Separator className='MenubarSeparator' />
          <Menubar.Item className='MenubarItem'>{t('Request to Edit')}</Menubar.Item>
          <Menubar.Item className='MenubarItem'>{t('Virtual Print')}</Menubar.Item>
          <Menubar.Item className='MenubarItem'>{t('Printer')}</Menubar.Item>
          <Menubar.Separator className='MenubarSeparator' />
          <Menubar.Item className='MenubarItem'>{t('About Teamwork')}</Menubar.Item>
        </Menubar.Content>
      </Menubar.Portal>
    </Menubar.Menu>
  )
}

export function MenuRun() {
  const { t } = useTranslation()
  return (
    <Menubar.Menu>
      <Menubar.Trigger className="MenubarTrigger">{t('Run')}</Menubar.Trigger>
      <Menubar.Portal>
        <Menubar.Content className='MenubarContent'>
          <Menubar.Item className='MenubarItem'>{t('Compile')}</Menubar.Item>
          <Menubar.Item className='MenubarItem'>{t('Compile and Run')}</Menubar.Item>
          <Menubar.Item className='MenubarItem'>{t('Compile and Test')}</Menubar.Item>
          <Menubar.Separator className='MenubarSeparator' />
          <Menubar.Item className='MenubarItem'>{t('Submit')}</Menubar.Item>
          <Menubar.Separator className='MenubarSeparator' />
          <Menubar.Item className='MenubarItem'>{t('Toggle Breakpoint')}</Menubar.Item>
          <Menubar.Item className='MenubarItem'>{t('Start Debugging')}</Menubar.Item>
          <Menubar.Item className='MenubarItem'>{t('Stop Debugging')}</Menubar.Item>
          <Menubar.Separator className='MenubarSeparator' />
          <Menubar.Item className='MenubarItem'>{t('Step Over')}</Menubar.Item>
          <Menubar.Item className='MenubarItem'>{t('Step Into')}</Menubar.Item>
          <Menubar.Item className='MenubarItem'>{t('Step Out')}</Menubar.Item>
          <Menubar.Item className='MenubarItem'>{t('Continue')}</Menubar.Item>
        </Menubar.Content>
      </Menubar.Portal>
    </Menubar.Menu>
  )
}

export function MenuHelp() {
  const { t } = useTranslation()
  return (
    <Menubar.Menu>
      <Menubar.Trigger className="MenubarTrigger">{t('Help')}</Menubar.Trigger>
      <Menubar.Portal>
        <Menubar.Content className='MenubarContent'>
          <Menubar.Item className='MenubarItem'>{t('Statistics')}</Menubar.Item>
          <Menubar.Separator className='MenubarSeparator' />

          <Menubar.Item className='MenubarItem'>{t('Show All Commands')}</Menubar.Item>
          <Menubar.Item className='MenubarItem'>{t('Documentation')}</Menubar.Item>
          <Menubar.Item className='MenubarItem'>{t('Changelog')}</Menubar.Item>
          <Menubar.Separator className='MenubarSeparator' />

          <Menubar.Item className='MenubarItem'>{t('Report Issue')}</Menubar.Item>
          <Menubar.Separator className='MenubarSeparator' />

          <Menubar.Item className='MenubarItem'>{t('View License')}</Menubar.Item>
          <Menubar.Separator className='MenubarSeparator' />

          <Menubar.Item className='MenubarItem'>{t('Toggle Developer Tools')}</Menubar.Item>
          <Menubar.Separator className='MenubarSeparator' />

          <Menubar.Item className='MenubarItem'>{t('About')}</Menubar.Item>
        </Menubar.Content>
      </Menubar.Portal>
    </Menubar.Menu>
  )
}