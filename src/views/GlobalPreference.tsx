import PreferenceView, { CatalogModel } from '../components/Preference'

import { useSettingsStore } from '../store/settings';


export default function Page() {
  let appearance: CatalogModel = {
    id: 'editor',
    title: 'Editor',
    section: [
      {
        name: 'Appearance',
        items: [
          {
            id: 'editor.theme',
            title: 'Theme',
            ty: 'select',
            meta: () => ['Light', 'Dark', 'Paper'],
            value: useSettingsStore((state: any) => state.theme),
            setter: useSettingsStore((state: any) => state.setTheme),
          }
        ]
      },
      {
        name: 'Heatmap',
        items: []
      },
      {
        name: 'Overview Panel',
        items: []
      }
    ],
  }
  let language: CatalogModel = {
    id: 'language',
    title: 'Language',
    section: [
      {
        name: 'General',
        items: []
      },
      {
        name: 'C++',
        items: []
      },
      {
        name: 'Python',
        items: []
      },
      {
        name: 'Java',
        items: []
      }
    ]
  }

  let network: CatalogModel = {
    id: 'network',
    title: 'Network',
    section: [
      {
        name: 'Proxy',
        items: []
      },
      {
        name: 'Tunnel',
        items: []
      }

    ]
  }

  let actions: CatalogModel = {
    id: 'actions',
    title: 'Actions',
    section: [
      {
        name: 'Save',
        items: []
      },
      {
        name: 'Auto Save',
        items: []
      },
      {
        name: 'External File Change',
        items: []
      }
    ]
  }

  let about: CatalogModel = {
    id: 'about',
    title: 'About',
    section: [
      {
        name: 'Version',
        items: [
          {
            id: 'about.version',
            title: 'Version Code',
            description: '0.0.0-dev',
            ty: 'label',
            value: "",
          }
        ]
      },
      {
        name: 'Open Source Licenses',
        items: []
      },
      {
        name: 'Buy Me A Coffee',
        items: []
      }
    ]
  }
  return (
    <PreferenceView model={[appearance, language, network, actions, about]} />
  )
}