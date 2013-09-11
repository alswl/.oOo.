# Alswl's .oOo. #

这里是我的 Linux 配置文件，有兴趣的可以参考。

This is my Linux configuration.

目前的配置文件包括：

* awesome # moved to [awesome][]
* zsh
* vim # moved to [miv][]
* vimperator
* Xmodmap # depleted
* font
* tmux / screen
* xmonad # depleted
* xmobar # depleted
* xsession # depleted
* .gitconfig
* local/bin # svn diff / git diff / gbk unzip / speedfox

## Usage ##

``` bash
git clone https://github.com/alswl/.oOo.
ln -s /your/.oOo./.* ~/
cp /your/.oOo./_.gitconfig ~/.gitconfig

mkdir -p ~/local/bin && cd ~/local/bin
ln -s /your/.oOo./local/bin/* .
```

## Related ##

* [miv][] vim configuration
* [awesome][] awesome configuration
* [.oOo. mirror][] Mirror @ GitCafe

[.oOo.]: https://github.com/alswl/.oOo.
[.oOo. mirror]: https://gitcafe.com/alswl/.oOo.
[awesome]: https://github.com/alswl/awesome
[miv]: https://github.com/alswl/miv
