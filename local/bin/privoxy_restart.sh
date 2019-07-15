#!/bin/bash

set -e
#set -x

killall privoxy
PORT=`networksetup -getsocksfirewallproxy Wi-Fi | grep 'Port' | cut -d ' ' -f2`
cp $HOME/local/etc/privoxy/config.template /usr/local/etc/privoxy/config
/usr/local/bin/gsed -i "s/PORT/$PORT/g" /usr/local/etc/privoxy/config

/usr/local/sbin/privoxy /usr/local/etc/privoxy/config
networksetup -setsocksfirewallproxystate Wi-Fi off
