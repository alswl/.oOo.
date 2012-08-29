#!/bin/sh

xrandr --output LVDS1 --mode 1366x768
#xrandr --output VGA1 --rotate left --mode 1440x900 --left-of LVDS1
xrandr --output VGA1 --rotate normal --mode 1440x900 --right-of LVDS1

# xscreensaver
#xscreensaver -no-splash &

# Desktop effect, for example transparency
xcompmgr &

xmodmap $HOME/.Xmodmap

# Dropbox
#dropboxd  &

# nm-applet
#nm-applet &

# trayer
#trayer --edge top --align right --SetDockType true --SetPartialStrut true --expand true --widthtype pixel --width 128 --transparent true --alpha 0 --tint 0x000000 --height 18 &

# ssh-proxy
#ssh alswl@log4d.com -ND 7070 &

# wallpaper
nitrogen --restore

# vim: set ft=sh:
