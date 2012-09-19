# alswl's dot files #

这里是我的 Linux 配置文件，有兴趣的可以参考，

目前的配置文件包括：

* awesome # moved to https://github.com/alswl/awesome
* zsh
* vim
* vimperator
* xmonad # suspend
* xmobar # suspend
* xsession
* Xmodmap

我是一名 Python 程序员，同时也 code Javascript / html / css 。

可以在 [Log4D][log4d] 这里找到我，这是我的博客。

需要帮助的话，通过 `alswlx(at)gmail.com` 联系我。

Note:

Branche 'master' is for Arch Linux, branche 'vostro' is for Ubuntu 12.04.

## Awesome Usage ##

Awesome configuration had moved to https://github.com/alswl/awesome 。

## Vim Usage ##

``` bash
git clone --recursive https://github.com/alswl/dotfiles.git
ln -s /your/dotfiles/.vim ~/.vim
ln -s /your/dotfiles/.vimrc ~/.vimrc
vim +BundleInstall # use vundle to install scripts
```

Tips: `Bundle 'gmarik/vundle'` won't installed by vundle.
Because it was cloned by git with `recursive` .

[log4d]: http://log4d.com/
