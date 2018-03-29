# Alswl's .oOo. #

这里是我的 Linux / Mac OS 配置文件，有兴趣的可以参考。

This is my Linux / Mac OS configuration.

目前的配置文件包括：

These configuration Includes: 

*   awesome # moved to [awesome][]
*   zsh
*   vim # moved to [miv][]
*   vimperator  # deprecated, use Surfingkeys in Chrome
*   pentadactyl  # deprecated, use Surfingkeys in Chrome
*   Vimium  # deprecated, use Surfingkeys
*   CVim  # deprecated, use Surfingkeys
*   VimFx  # deprecated, use Surfingkeys in Chrome
*   Surfingkeys
*   Xmodmap # deprecated, use Ergodox
*   font
*   tmux / screen
*   xmonad # deprecated, use awesome
*   xmobar # deprecated, use awesome
*   ideavimrc
*   .gitconfig
*   phoenix
*   mjolnir # deprecated, use phoenix
*   local/bin
    *   svn diff
    *   git diff
    *   unzip-gbk
    *   speedfox
    *   gh-md-toc
    *   bing wallpaper downloader
    *   rime dict manage
    *   git proxy wrapper
    *   url diff
    *   viscosity to ios connect
    *   etc.


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

Mac

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

*   [miv][] vim configuration
*   [awesome][] awesome configuration

[.oOo.]: https://github.com/alswl/.oOo.
[awesome]: https://github.com/alswl/awesome
[miv]: https://github.com/alswl/miv
