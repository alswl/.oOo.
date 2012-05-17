#!/bin/bash

# This script will start by /usr/share/xsessions/*.desktop

SESSION_TYPE=$1

GLOBALXSESSION="xmonad"
USERXSESSION=~/.xsession

# nautilus
alias nautilus="nautilus --no-desktop"


if [ -f "$USERXSESSION" ]; then
	. $USERXSESSION $1
fi

#exec ck-launch-session dbus-launch $1
exec $1
