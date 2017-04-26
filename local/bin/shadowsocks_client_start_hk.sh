#!/bin/bash

args=`getopt -a -o: -l japan,hokong: -- $*`  # Notice: Mac OSX 上面 getopt 非标准实现，需要安装 `brew install gnu-getopt`
eval set -- "$args"
 
for i
do
	case "$1" in
		-j|--japan)
			japan="1"
			shift 2;;
		-h|--hongkong)
			terrier=$2
			shift 2;;
		--)
			shift;
			break;;
	esac
done

ss-local -c /usr/local/etc/shadowsocks-libev_hk.json -b 127.0.0.1 -f /usr/local/var/run/ss-local.pid
