#!/bin/bash

# This file will start with .start-session.sh

# Dual Monitor
xrandr --output VGA1 --rotate right --mode 1440x900 --left-of LVDS1

case $1 in
	"xmonad")
		# trayer
		trayer --edge top --align right --SetDockType true --SetPartialStrut true --expand true --widthtype pixel --width 128 --transparent true --alpha 0 --tint 0x000000 --height 18 &
	;;
esac

#/usr/lib/polkit-1/polkit-agent-helper-1 &
/usr/lib/polkit-gnome/polkit-gnome-authentication-agent-1 &

# nm-applet
nm-applet &

# Dropbox
dropboxd  &

# xscreensaver
xscreensaver -no-splash &

# vim: set ft=sh:
