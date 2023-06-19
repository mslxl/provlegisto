<div align="center">

Provlegisto **WIP**
---

<img width="160" src="src-tauri\icons\Square150x150Logo.png" alt="logo"></br>

![GitHub](https://img.shields.io/github/license/WeeHerb/provlegisto?style=for-the-badge)

Provlegisto 是基于 Tauri 开发的，面向全体 OIer/ACMer 的数据生成器和本地对拍器。在未来可能支持一些基础的代码编辑功能和与OJ的集成。

Provlegisto *`/provlegisto/`* 出自 Esperanto，意为“预判者”。我们希望 Provlegisto 能为您在平时训练时快速的发现致使代码错误的输入，为您在构造数据和对拍时节省时间。
</div>

<br/>
<br/>
<hr/>

## 开始使用

我们对您的系统有以下要求:

| 系统 | 版本 |
|:-:|:-:|
| Windows | 7及以上 |
| macOS | 10.15 及以上，不保证兼容性 |
| Linux | 需安装特定依赖 |
| iOS/iPadOS| 未来也许会有(?) |
| Android | 未来也许会有(?) |

对于 Linux 系统，我们需要:

- Debian (Ubuntu 18.04 及以上) 配备下列依赖：
  + `libwebkit2gtk-4.0-37`, `libgtk-3-0`
- Arch 配备下列依赖：
  + `webkit2gtk`, `gtk3`
- Fedora 2 及以上配备下列依赖：
  + `webkit2gtk3`, `gtk3`


## 构建

对于构建此应用，我们保证在以下依赖满足时可以构建:
- `git`
- `rust >= 1.5.7`
- `cargo >= 1.64.0`
- `pnpm >= 7.25.1`

构建方式:

```bash
$ git clone https://github.com/WeeHerb/provlegisto.git --depth 1
$ cd provlegisto
$ pnpm install
$ pnpm tauri build
```

你可以在 `src-tauri/target/release/` 下找到对应的二进制文件，或者在 `src-tauri/target/release/bundle/msi/` 下找到 Windows 平台专有的 msi 安装包。

## 开源许可

代码: (c) 2023 - Weeherb

GNU Affero General Public License 3.0

图标: NoLicense

由 Stable Diffusion 生成, prompt为 `master piece, white dress, cat girl, home dress, computer, source code, coding, pure color background`, 种子`-4243955700` 