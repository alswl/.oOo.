#!/bin/sh
#
# ~/.xinitrc
#

if [ -d /etc/X11/xinit/xinitrc.d ]; then
  for f in /etc/X11/xinit/xinitrc.d/*; do
    [ -x "$f" ] && . "$f"
  done
  unset f
fi

# Make slim compatible with xinit
[ -f /etc/xprofile ] && . /etc/xprofile
[ -f ~/.xprofile ] && . ~/.xprofile $1

DEFAULT_SESSION=xfce4

case $1 in

	kde)
		exec startkde
		;;
	xfce4)
		exec startxfce4
		;;
	lxde)
		exec startlxde
		;;
	awesome)
		exec awesome
		;;
	e17)
		exec enlightenment_start
		;;
	*)
		exec $DEFAULT_SESSION
esac

# vim: set ft=sh:
