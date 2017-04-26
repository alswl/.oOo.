#!/usr/bin/env bash

PICTURE_DIR="$HOME/Pictures/bing-wallpapers/"

mkdir -p $PICTURE_DIR

# http://www.bing.com/HPImageArchive.aspx?format=rss&idx=0&n=1&mkt=en-US


urls=( $(curl 'http://global.bing.com/?FORM=HPCNEN&setmkt=en-us&setlang=en-us' -H 'Pragma: no-cache' -H 'Accept-Encoding: gzip, deflate, sdch' -H 'Accept-Language: en,zh-CN;q=0.8,zh;q=0.6' -H 'Upgrade-Insecure-Requests: 1' -H 'User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/56.0.2924.87 Safari/537.36' -H 'Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8' -H 'Cache-Control: no-cache' -H 'Cookie: SRCHD=AF=NOFORM; SRCHUSR=DOB=20170324; _EDGE_V=1; MUID=091C86D78E8B6FA205808C988F2A6EF2; SRCHUID=V=2&GUID=367A7E792CA942DA9CF346EA3908CF4E; MUIDB=091C86D78E8B6FA205808C988F2A6EF2; _RwBf=s=70&o=16; SRCHHPGUSR=CW=1280&CH=569&DPR=1&UTC=480; WLS=TS=63625925920; _SS=SID=0CF22CC0AA826401135F268FAB236542&bIm=097739&HV=1490329122&R=0; _EDGE_S=mkt=en-us&ui=en-us&F=1&SID=0CF22CC0AA826401135F268FAB236542; SNRHOP=I=&TS=' -H 'Connection: keep-alive' --compressed | \
    grep -Eo "url:'.*?'" | \
    sed -e "s/url:'\([^']*\)'.*/http:\/\/bing.com\1/" | \
    sed -e "s/\\\//g") )

echo $urls
exit 1

for p in ${urls[@]}; do
    filename=$(echo $p|sed -e "s/.*\/\(.*\)/\1/")
    if [ ! -f $PICTURE_DIR/$filename ]; then
        echo "Downloading: $filename ..."
        curl -Lo "$PICTURE_DIR/$filename" $p
    else
        echo "Skipping: $filename ..."
    fi
done
