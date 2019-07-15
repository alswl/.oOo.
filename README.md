# Alswl's .oOo. #

这里是我的 Linux / macOS 配置文件，有兴趣的可以参考。

This is my Linux / macOS configuration.

目前的配置文件包括：

These configuration Includes: 

-   awesome # moved to [awesome][]
-   zsh
-   vim # moved to [miv][]
-   vimperator  # deprecated, use Surfingkeys in Chrome
-   pentadactyl  # deprecated, use Surfingkeys in Chrome
-   Vimium  # deprecated, use Surfingkeys
-   CVim  # deprecated, use Surfingkeys
-   VimFx  # deprecated, use Surfingkeys in Chrome
-   Surfingkeys
-   Xmodmap # deprecated, use Ergodox
-   font
-   tmux / screen
-   xmonad # deprecated, use awesome
-   xmobar # deprecated, use awesome
-   ideavimrc
-   .gitconfig
-   mac/.phoenix
-   mjolnir # deprecated, use phoenix
-   local/bin
    -   SimpleHTTPServerWithUpload.py  # simple HTTPS Server with Upload
    -   bing-wallpaper.sh # bing wallpaper downloader
    -   check-brew-cask-upgrade # fast check brew cask updates
    -   crash # crash link
    -   edit-server  # script for TextAid, use vim in Chorme, https://chrome.google.com/webstore/detail/ppoadiihggafnhokfkpphojggcdigllp
    -   fcitx-remote-osa  # use osa switch macOS Input Method
    -   funiq # file uniq, generate hash for file
    -   format-gfm  # format file with github flavor markdown
    -   format-markdown  # format file with markdown
    -   generate-output-summary-md  # generate .output for yuque
    -   generate-summary-md  # generate summary.md for markdown directory
    -   generate_dash_index.sh  # generate dash doc index
    -   gh-md-toc
    -   git-code-numbers-by-authors  # analytics git repo by author
    -   git_diff_wrapper  # deprecate, use git difftool
    -   image-from-clipboard-to-png  # image from clipbarod to png
    -   image-from-clipboard-to-png-vim  # image from clipbarod to png and copy file path
    -   iterm2-recv-zmodem.sh # rz for iTerm2
    -   iterm2-send-zmodem.sh  # sz for iTerm2
    -   jmxsh
    -   jmxterm
    -   lark-gen-markdown  # yuque markdown generate .output
    -   ls-upload-log4d
    -   markdown2ctags.py
    -   mdsearch  # markdown search, mardkown file search by title
    -   mouse_restore.sh
    -   mov2gif
    -   mysql2sqlite.sh
    -   paste-html-to-md
    -   paste-html-to-md-copy
    -   paste-md-to-html
    -   paste-md-to-html-copy
    -   paste-md-to-rtf
    -   paste-md-to-rtf-copy
    -   paste-rtf-to-html
    -   paste-rtf-to-html-copy
    -   paste-rtf-to-md
    -   paste-rtf-to-md-copy
    -   privoxy_restart.sh
    -   puml-format-order-node
    -   release-mvn-to-git-release-binary-branch.sh
    -   release-sbt-to-git-release-binary-branch.sh
    -   remark  # generate remark slide by md
    -   reveal  # generate reveal slide by md
    -   rime_dict_manager
    -   rsocks_start.sh
    -   scel2mmseg.py
    -   shadowsocks_client_start_ha.sh
    -   shadowsocks_client_start_hk.sh
    -   shadowsocks_client_start_jp.sh
    -   shj
    -   socks5proxywrapper
    -   soks5proxyhttp
    -   soks5proxyssh
    -   speedfox
    -   sqlite3-to-mysql.py
    -   svn_diff_wrapper
    -   tinypng  # use tinypng compress image
    -   tinyproxy_start.sh
    -   tinyproxy_stop.sh
    -   tree2fulltree  # convert tree output to list
    -   tremote
    -   tsa
    -   unzip-gbk  # unizp gbk file in Linux / macOS
    -   url_diff
    -   viscosity-to-ios-connect.rb
-   mac/Library/LaunchAgents/com.alswl.edit-server.plist
    -   com.alswl.edit-server.plist  # TextAid server for https://chrome.google.com/webstore/detail/textaid/ppoadiihggafnhokfkpphojggcdigllp?hl=en


## Usage ##


``` bash
git clone https://github.com/alswl/.oOo.
ln -s /your/.oOo./.* ~/
cp /your/.oOo./_.gitconfig ~/.gitconfig

mkdir -p ~/local/bin
mkdir -p ~/local/etc
cd ~/local/
ln -s /your/.oOo./local/bin/* ./bin/
ln -s /your/.oOo./local/etc/* ./etc/
```

macOS:

```bash
ln -s /your/.oOo./mac/.* ~
ln -s /your/.oOo./mac/_Library/Application\ Support/Karabiner/private.xml ~/Library/Application\ Support/Karabiner/private.xml
ln -s /your/.oOo./mac/_config/karabiner/karabiner.json ~/.config/karabiner/karabiner.json
```

Linux

```
ln -s /your/.oOo./linux/.* ~
```

## Related ##

-   [miv][] vim configuration
-   [awesome][] awesome configuration

[.oOo.]: https://github.com/alswl/.oOo.
[awesome]: https://github.com/alswl/awesome
[miv]: https://github.com/alswl/miv
