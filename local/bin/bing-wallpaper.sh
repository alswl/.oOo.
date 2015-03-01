#!/usr/bin/env bash

PICTURE_DIR="$HOME/Pictures/bing-wallpapers/"

mkdir -p $PICTURE_DIR

# http://www.bing.com/HPImageArchive.aspx?format=rss&idx=0&n=1&mkt=en-US

urls=( $(curl -x socks5://127.0.0.1:7301 -s 'http://www.bing.com/?FORM=&setmkt=en-us&setlang=en-us' -H 'User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/40.0.2214.93 Safari/537.36' -H 'Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8' -H 'Referer: http://www.bing.com/' -H 'Cookie: SRCHD=AF=NOFORM; SRCHUID=V=2&GUID=527A8BF2E5BB4F1EB3AAD396E1DB588A; SRCHUSR=AUTOREDIR=0&GEOVAR=&DOB=20150129; _EDGE_V=1; MUID=0A0DA6F8C50065A31CAEA1C6C48A64AF; MUIDB=0A0DA6F8C50065A31CAEA1C6C48A64AF; _RwBf=s=70&o=16; SCRHDN=ASD=0&DURL=#; _FS=mkt=en-us&ui=en-US&NU=1; _EDGE_S=mkt=en-us&ui=en-US&F=1&SID=190207943B98670428FC00AA3A1266F0; FBS=WTS=1422548947905&CR=-1; WLS=TS=63558145764; _SS=SID=F21460F8777A4B3292E6FE7940FE88DA&bIm=857398&R=0; SRCHHPGUSR=CW=1280&CH=401&DPR=2; _HOP=' -H 'Connection: keep-alive' -H 'Cache-Control: max-age=0' | \
    grep -Eo "url:'.*?'" | \
    sed -e "s/url:'\([^']*\)'.*/http:\/\/bing.com\1/" | \
    sed -e "s/\\\//g") )

for p in ${urls[@]}; do
    filename=$(echo $p|sed -e "s/.*\/\(.*\)/\1/")
    if [ ! -f $PICTURE_DIR/$filename ]; then
        echo "Downloading: $filename ..."
        curl -Lo "$PICTURE_DIR/$filename" $p
    else
        echo "Skipping: $filename ..."
    fi
done
