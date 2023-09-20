const themes = {
  materialLight: {
    name: "Material Light",
    dark: false,
    theme: async () => (await import("@ddietr/codemirror-themes/material-light")).materialLight,
  },
  materialDark: {
    name: "Material Dark",
    dark: true,
    theme: async () => (await import("@ddietr/codemirror-themes/material-dark")).materialDark,
  },
  dracula: {
    name: "Dracula",
    dark: true,
    theme: async () => (await import("@ddietr/codemirror-themes/dracula")).dracula,
  },
  githubLight: {
    name: "GitHub Light",
    dark: false,
    theme: async () => (await import("@ddietr/codemirror-themes/github-light")).githubLight,
  },
  githubDark: {
    name: "GitHub Dark",
    dark: true,
    theme: async () => (await import("@ddietr/codemirror-themes/github-dark")).githubDark,
  },
  aura: {
    name: "Aura",
    dark: false,
    theme: async () => (await import("@ddietr/codemirror-themes/aura")).aura,
  },
  tokyoNight: {
    name: "Tokyo Night",
    dark: true,
    theme: async () => (await import("@ddietr/codemirror-themes/tokyo-night")).tokyoNight,
  },
  tokyoNightStorm: {
    name: "Tokyo Night Storm",
    dark: true,
    theme: async () => (await import("@ddietr/codemirror-themes/tokyo-night-storm")).tokyoNightStorm,
  },
  tokyoNightDay: {
    name: "Tokyo Night Dark",
    dark: true,
    theme: async () => (await import("@ddietr/codemirror-themes/tokyo-night-day")).tokyoNightDay,
  },
}

export default themes
