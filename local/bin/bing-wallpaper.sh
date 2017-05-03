#!/usr/bin/env bash

PICTURE_DIR="$HOME/Pictures/bing-wallpapers/"
mkdir -p $PICTURE_DIR

URL="http://s.cn.bing.net"`http 'http://www.bing.com/HPImageArchive.aspx?format=js&idx=0&n=1&mkt=en-US' | jq -r '.images[0].url'`
#echo $URL
wget -q -nc -P $PICTURE_DIR $URL
