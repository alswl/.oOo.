#!/bin/bash

# This file will start with gdm

# Dual Monitor
xrandr --output VGA1 --rotate right --mode 1440x900 --left-of LVDS1

# trayer
trayer --edge top --align right --SetDockType true --SetPartialStrut true --expand true --widthtype pixel --width 128 --transparent true --alpha 0 --tint 0x000000 --height 18 &

# nm-applet
nm-applet &

# Dropbox
dropboxd  &

# xscreensaver
xscreensaver -no-splash &

# vim: set ft=sh:
