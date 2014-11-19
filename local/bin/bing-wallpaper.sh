#!/usr/bin/env bash

PICTURE_DIR="$HOME/Pictures/bing-wallpapers/"

mkdir -p $PICTURE_DIR

urls=( $(curl -x socks5://127.0.0.1:7301 -s http://www.bing.com -H 'Accept-Encoding: gzip,deflate,sdch' -H 'Accept-Language: zh-CN,zh;q=0.8' -H 'User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/38.0.2125.104 Safari/537.36' -H 'Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8' -H 'Referer: http://www.bing.com/account/general?ru=http%3a%2f%2fwww.bing.com%3a80%2f&FORM=SEFD' -H 'Cookie: SRCHD=AF=NOFORM; SRCHUID=V=2&GUID=039C1D6E920646E08CD5652DDD369128; SRCHUSR=AUTOREDIR=0&GEOVAR=&DOB=20141026; _EDGE_V=1; MUID=0BD2FC466D5C6D1E3D77FA996C196C64; MUIDB=0BD2FC466D5C6D1E3D77FA996C196C64; _FP=ui=en-US; _FS=ui=en-US&NU=1; _EDGE_CD=u=en-US; _EDGE_S=ui=en-US&F=1; SCRHDN=ASD=0&DURL=#; FBS=WTS=1414286393819&CR=-1; WLS=TS=63549883246; _SS=SID=171917D491B64FFB857C15FDA1389579&bIm=177397&nhIm=19-&R=0; _RwBf=s=70&o=16; _HOP=; SRCHHPGUSR=CW=1280&CH=401&AS=1&ADLT=DEMOTE' -H 'Connection: keep-alive' -H 'Cache-Control: max-age=0' | \
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
