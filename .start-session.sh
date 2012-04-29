#!/bin/bash

SESSION_TYPE=xmonad

GLOBALXSESSION="xmonad"
USERXSESSION=~/.xsession

if [ -f "$USERXSESSION" ]
	then . $USERXSESSION
fi

exec xmonad
