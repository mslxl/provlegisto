
<!-- ALL-CONTRIBUTORS-BADGE:START - Do not remove or modify this section -->
[![All Contributors](https://img.shields.io/badge/all_contributors-1-orange.svg?style=flat-square)](#contributors-)
<!-- ALL-CONTRIBUTORS-BADGE:END -->
<div>

<table align="center">
<tr>
<td>
<img src="src-tauri/icons/128x128.png" />
</td>
<td>

# Provlegisto

Yet another IDE for competitive programming

**WIP**

</td>
</tr>
</table>
</div>


![](screenshot/main.png)

## Features

- [X] Auto setup enviroment
  + [X] C++
  + [ ] Python
- [X] Coding
- [X] Compile, Run and Check
  + [X] C++
  + [X] Python
- [X] Multi-theme
- [X] Auto-completetion (through LSP)
- [X] Fetch problem from Competitive Companion
- [ ] Sumbit to OJ by button
- [ ] Better keymap

## Developement

Cargo, C++ Compiler and NodeJS are required to build this project.

In addition, according to tauri's requirements, your operation system must statisify the following condition:

| Platform           | Versions                                                                                                        |
| :----------------- | :-------------------------------------------------------------------------------------------------------------- |
| Windows            | 7 and above                                                                                                     |
| macOS              | 10.15 and above                                                                                                 |
| Linux              | webkit2gtk 4.0                                                                                                  |


To compile the project, run below commands in your terminal:

```
$ pnpm install
$ pnpm tauri build
```

The releases file can be found in `src-tauri\target\release\bundle\` folder
 
Also you can run `pnpm tauri dev` to debug the program.

Any pull request are welcomed to this project


## Contributors ✨

Thanks goes to these wonderful people ([emoji key](https://allcontributors.org/docs/en/emoji-key)):

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tbody>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href="http://blog.mslxl.com"><img src="https://avatars.githubusercontent.com/u/11132880?v=4?s=100" width="100px;" alt="mslxl"/><br /><sub><b>mslxl</b></sub></a><br /><a href="https://github.com/sdufeACM/provlegisto/commits?author=mslxl" title="Code">💻</a> <a href="https://github.com/sdufeACM/provlegisto/commits?author=mslxl" title="Tests">⚠️</a> <a href="#design-mslxl" title="Design">🎨</a></td>
    </tr>
  </tbody>
</table>

<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors](https://github.com/all-contributors/all-contributors) specification. Contributions of any kind welcome!