<div align="center">

# `.oOo.`

**十余年打磨、至今每天在用的 Linux / macOS 配置合集。**

拿去参考，随意取用。

[English](README.md)

</div>

---

## 理念

整个仓库就是一份完整、自包含的 `$HOME`：每个文件都放在它在家目录里该在的位置，
安装无非是创建一组软链接。

工具会来会走，留下的是肌肉记忆。淘汰的配置不会被删除，而是退役进
[`archived/`](archived/)，让「当年为什么这么选」的痕迹依然可读。

## 目录结构

| 路径            | 说明                                                        |
| --------------- | ----------------------------------------------------------- |
| `.*`            | 跨平台 dotfiles：zsh、tmux、screen、git、ctags 和各类编辑器 |
| `.zshrc.etc.d/` | 模块化 zsh 片段，按需 source（Docker、Kubernetes、secrets 等） |
| `mac/`          | 仅 macOS：Phoenix、Karabiner、LaunchAgents 和 App 支持文件   |
| `linux/`        | 仅 Linux 的 dotfiles                                        |
| `local/bin/`    | 约 110 个自用脚本，参见[工具箱](#工具箱)                    |
| `archived/`     | 退役配置，留档参考                                          |

## 配置

正在维护：**zsh** · **tmux / screen** · **git** · **IdeaVim** ·
**Obsidian Vim** · **fonts** · **Phoenix**（macOS 平铺窗口管理器）·
**Karabiner**。

浏览器按键已统一收敛到 **[Surfingkeys](.surfingkeys.js)**；早年的 Vimperator、
Pentadactyl、Vimium、cVim 和 VimFx 配置现已归档。

已拆分为独立仓库：

- **vim** → [miv][]
- **awesome**（窗口管理器）→ [awesome][]

被取代并归档：Xmodmap（→ Ergodox）、xmonad 和 xmobar（→ awesome），以及
mjolnir、slate 和 amethyst（→ Phoenix）。

## 工具箱

`local/bin/` 里攒了一百多个小脚本，是整套工作流的黏合剂。下面挑几个有特色的介绍。

### Markdown 与剪贴板互转

在编辑器、浏览器、飞书和微信读书之间搬运富文本时最趁手的一批工具。

| 脚本                                  | 用途                                                   |
| ------------------------------------- | ------------------------------------------------------ |
| `paste-{md,html,rtf}-to-{md,html,rtf}` | 剪贴板格式互转全矩阵，`-copy` 变体直接回填剪贴板     |
| `paste-weread-to-md`                  | 微信读书划线笔记 → Markdown                            |
| `paste-simplemind-outline-to-md`      | SimpleMind 脑图大纲 → Markdown                         |
| `image-from-clipboard-to-png-*`       | 剪贴板图片落地为 PNG，并生成 Markdown 引用             |
| `format-gfm` · `gh-md-toc`            | GitHub Flavored Markdown 格式化和目录生成              |
| `remark` · `reveal`                   | 由 Markdown 生成 remark 或 reveal.js 幻灯片            |

### 网络与代理

| 脚本                              | 用途                                                  |
| --------------------------------- | ----------------------------------------------------- |
| `myip` · `myip-*`                 | 多种出口 IP 探测源（dig、ipinfo、ip.sb、ipip 等）     |
| `ddns-by-{cloudflare,dnspod}`     | 动态 DNS 更新，`-wan` 变体使用公网 IP                 |
| `shadowsocks_client_start_*`      | 按区域（HK、JP、HA）拉起 Shadowsocks 客户端           |
| `socks5proxywrapper` · `dig-http` | SOCKS5/HTTP 代理包装和 HTTP 版 dig                    |

### 图片与媒体

| 脚本                             | 用途                              |
| -------------------------------- | --------------------------------- |
| `tinypng`                        | 调用 TinyPNG 压图                 |
| `resize-img` · `-800/1200/2000`  | 按目标宽度批量缩放图片            |
| `mov2gif`                        | 录屏 `.mov` → GIF                 |
| `svg2icns`                       | SVG → macOS `.icns` 图标集        |
| `qrdecode`                       | 解二维码                          |

### Git 与开发

| 脚本                          | 用途                        |
| ----------------------------- | --------------------------- |
| `git-archive-zip`             | 把仓库打包成 `xxx.git.zip`  |
| `git-code-numbers-by-authors` | 按作者统计代码量            |
| `git-min-backup`              | 极简 Git 备份               |
| `homebrew-using-mirror`       | 一键切换 Homebrew 镜像源    |
| `check-brew-cask-upgrade`     | 快速检查 Homebrew cask 更新 |

### 桌面粘合剂

| 脚本                           | 用途                                         |
| ------------------------------ | -------------------------------------------- |
| `edit-server`                  | 配合 TextAid，在 Chrome 里用 Vim 编辑文本框 |
| `fcitx-remote-osa`             | 用 osascript 切换 macOS 输入法              |
| `apple-music-playing`          | 获取 Apple Music 当前播放曲目               |
| `bing-wallpaper.sh`            | 下载必应每日壁纸                            |
| `trash-put`                    | 用 macOS `trash` 实现 `trash-put`           |
| `iterm2-{recv,send}-zmodem.sh` | 在 iTerm2 中使用 `rz` / `sz`                |

> 完整清单就是一句 `ls local/bin/`，每个脚本都短小、自解释。

## 安装

```bash
# 1. 前置依赖：zsh、Oh My Zsh 和 zsh-autosuggestions
brew install zsh                # 或：apt-get install zsh
sh -c "$(curl -fsSL https://raw.githubusercontent.com/ohmyzsh/ohmyzsh/master/tools/install.sh)"
git clone https://github.com/zsh-users/zsh-autosuggestions \
  "${ZSH_CUSTOM:-$HOME/.oh-my-zsh/custom}/plugins/zsh-autosuggestions"

# 2. 克隆
cd YOUR_REPO_PARENT_PATH
git clone https://github.com/alswl/.oOo. && cd .oOo.

# 3. 将跨平台 dotfiles 软链接进 $HOME
#    (.[!.]* 会跳过 . 和 ..；case 守卫会跳过仓库元数据和系统文件)
for f in .[!.]*; do
  case "$f" in .git|.gitignore|.DS_Store|.idea|.claude) continue ;; esac
  ln -sfn "$(pwd)/$f" "$HOME/$f"
done
cp "$(pwd)/_.gitconfig" "$HOME/.gitconfig"

# 4. 链接自用脚本
mkdir -p "$HOME/local/bin" "$HOME/local/etc"
ln -s "$(pwd)"/local/bin/* "$HOME/local/bin/"
ln -s "$(pwd)"/local/etc/* "$HOME/local/etc/"
```

<details>
<summary><b>macOS 额外步骤</b></summary>

```bash
cd YOUR_REPO_PATH
for f in mac/.[!.]*; do
  base=${f##*/}
  case "$base" in .DS_Store|*.swp) continue ;; esac
  ln -sfn "$(pwd)/$f" "$HOME/$base"
done
ln -s "$(pwd)/mac/phoenix/dist/phoenix.js" "$HOME/.phoenix.js"
ln -s "$(pwd)/mac/_Library/Application Support/Karabiner/private.xml" \
  "$HOME/Library/Application Support/Karabiner/private.xml"
ln -s "$(pwd)/mac/_config/karabiner/karabiner.json" "$HOME/.config/karabiner/karabiner.json"
```

</details>

<details>
<summary><b>Linux 额外步骤</b></summary>

```bash
cd YOUR_REPO_PATH
for f in linux/.[!.]*; do
  ln -sfn "$(pwd)/$f" "$HOME/${f##*/}"
done
```

</details>

## Phoenix：macOS 平铺窗口管理

纯键盘驱动、使用 JavaScript 脚本化的窗口管理。详见博文
[*Windows management for hacker*](https://blog.alswl.com/2016/04/windows-management-for-hacker/)。

| 启动应用 | 窗口切换 | 移动窗口 |
| --- | --- | --- |
| ![](./mac/phoenix/_asserts/application-launch.gif) | ![](./mac/phoenix/_asserts/application-switch.gif) | ![](./mac/phoenix/_asserts/window.gif) |

## 相关项目

- [miv][] — Vim 配置
- [awesome][] — Awesome 窗口管理器配置

[.oOo.]: https://github.com/alswl/.oOo.
[awesome]: https://github.com/alswl/awesome
[miv]: https://github.com/alswl/miv
