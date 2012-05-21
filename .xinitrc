#!/bin/bash

export LC_ALL=zh_CN.UTF-8
export LC_CTYPE=zh_CN.UTF-8
export LC_LANG=zh_CN.UTF-8
export LANG=zh_CN.UTF-8

export XMODIFIERS=@im=fcitx
export GTK_IM_MODULE=fcitx
export QT_IM_MODULE=fcitx

# fcitx &

# exec startkde
# exec startxfce4

# exec ck-launch-session awesome
exec ck-launch-session xmonad 
# exec ck-launch-session gnome-session

# vim: set ft=sh:
