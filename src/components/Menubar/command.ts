const cmd = [
  {
    name: "File",
    type: "submenu",
    children: [
      {
        name: "New",
        type: "menuItem",
        command: "fileNew",
      },
      {
        name: "Open",
        type: "menuItem",
        command: "fileOpen",
      },
      {
        name: "Save",
        type: "menuItem",
        command: "fileSave",
      },
      {
        name: "SaveAs",
        type: "menuItem",
        command: "fileSaveAs",
      },
    ],
  },
  {
    name: "Edit",
    type: "menu",
    children: [
      {
        name: "Language",
        type: "menuItem",
        command: "changeLanguage",
      },
    ],
  },
]

export default cmd
