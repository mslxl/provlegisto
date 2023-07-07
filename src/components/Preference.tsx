import classNames from 'classnames'
import style from './Preference.module.scss'
import * as ScrollArea from '@radix-ui/react-scroll-area'
import * as Accordion from '@radix-ui/react-accordion'
import * as Select from '@radix-ui/react-select'
import { ChevronDownIcon, ChevronUpIcon, CheckIcon } from '@radix-ui/react-icons';

import * as Card from '../components/Card'
import { useState } from 'react';

export type PreferenceModel = CatalogModel[]

export interface CatalogModel {
  id: string
  title: string
  section: SectionModel[]
}

export interface SectionModel {
  name: string
  items: ItemModel[]
}

export interface ItemModel {
  id: string,
  title: string
  description?: string
  ty: 'number' | 'text' | 'label' | 'select' // | 'path' | 'render'
  meta?: () => any
  valid?: (value: string) => boolean
}


function renderLabel(model: ItemModel) {
  return (
    <>
      <div className={style.SettingTitle}>{model.title}</div>
      {model.description && <div className={style.SettingDescription}>{model.description}</div>}
    </>
  )
}

function renderSelect(model: ItemModel) {

  return (
    <div style={{ width: '100%', display: 'flex', alignItems: 'center' }}>
      <div>
        <div className={style.SettingTitle}>{model.title}</div>
        {model.description && <div className={style.SettingDescription}>{model.description}</div>}
      </div>
      <span style={{flexGrow: 1}}></span>
      <div>
        <Select.Root>
          <Select.Trigger className={style.SelectTrigger}>
            <Select.Value />
            <Select.Icon>
              <ChevronDownIcon className={style.SelectIcon} />
            </Select.Icon>
          </Select.Trigger>
          <Select.Portal>
            <Select.Content className={style.SelectContent}>
              <Select.ScrollUpButton className={style.SelectScrollButton}>
                <ChevronUpIcon />
              </Select.ScrollUpButton>
              <Select.Viewport className={style.SelectViewport}>
                <Select.Group>
                  {
                    model.meta && (model.meta() as string[]).map((item) => {
                      return (
                        <Select.Item value={item} className={style.SelectItem}>
                          <Select.ItemText>{item}</Select.ItemText>
                          <Select.ItemIndicator className={style.SelectItemIndicator}>
                            <CheckIcon />
                          </Select.ItemIndicator>
                        </Select.Item>
                      )
                    })
                  }
                </Select.Group>
              </Select.Viewport>
              <Select.ScrollDownButton className={style.SelectScrollButton}>
                <ChevronDownIcon />
              </Select.ScrollDownButton>
            </Select.Content>
          </Select.Portal>
        </Select.Root>
      </div>
    </div>
  )

}

function Section({ model }: { model: SectionModel }) {
  return (
    <ul className={style.SettingList}>
      {model.items.map((v) => (<li className={style.SettingItem} id={v.id}><Item model={v} /></li>))}
    </ul>
  )
}

function Item({ model }: { model: ItemModel }) {
  const renderer = {
    'label': renderLabel,
    'number': renderLabel,
    'text': renderLabel,
    'select': renderSelect,
  }
  return (
    <div>
      {renderer[model.ty](model)}
    </div>
  )
}



export default function Preference({ model }: { model: PreferenceModel }) {

  let [viewIndex, setViewIndex] = useState({ catalog: 0, section: 0 })

  let sidebar = model.map((catalog, index) => {
    let sections = catalog.section.map((section, sectionIndex) => {
      const jump2View = () => {
        setViewIndex({ catalog: index, section: sectionIndex })
      }
      return (<div className={style.Item} onClick={jump2View}>{section.name}</div>)
    })
    return (
      <Accordion.Root type='multiple'>
        <Accordion.Item className={style.Catalog} value={catalog.id}>
          <Accordion.Trigger className={classNames(style.AccordionTrigger, style.Item, style.Title)}>
            <span>{catalog.title}</span>
            <ChevronDownIcon className={style.AccordionChevron} aria-hidden />
          </Accordion.Trigger>
          <Accordion.Content className={style.AccordionContent}>
            {sections}
          </Accordion.Content>
        </Accordion.Item>
      </Accordion.Root>
    )
  })

  let sectionItems = model[viewIndex.catalog].section[viewIndex.section]

  return (
    <div className={style.global_preference}>
      <ScrollArea.Root className={style.ScrollAreaRoot} style={{ display: 'inline-block', width: '250px' }}>
        <ScrollArea.Viewport className={style.ScrollAreaViewport}>
          {sidebar}
        </ScrollArea.Viewport>
        <ScrollArea.Scrollbar className={style.ScrollAreaScrollbar} orientation='vertical'>
          <ScrollArea.Thumb className={style.ScrollAreaThumb} />
        </ScrollArea.Scrollbar>
        <ScrollArea.Corner className={style.ScrollAreaCorner} />
      </ScrollArea.Root>
      <ScrollArea.Root className={style.ScrollAreaRoot} style={{ width: 'calc(100% - 250px)' }}>
        <ScrollArea.Viewport className={style.ScrollAreaViewport}>
          <Card.Content>
            <Card.Content>
              <Section model={sectionItems} />
            </Card.Content>
          </Card.Content>
        </ScrollArea.Viewport>
        <ScrollArea.Scrollbar className={style.ScrollAreaScrollbar} orientation='vertical'>
          <ScrollArea.Thumb className={style.ScrollAreaThumb} />
        </ScrollArea.Scrollbar>
        <ScrollArea.Corner className={style.ScrollAreaCorner} />
      </ScrollArea.Root>
    </div>
  )
}