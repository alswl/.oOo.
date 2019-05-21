#!/usr/bin/env bash

export PATH=$PATH:/usr/local/bin
PICTURE_DIR="$HOME/Pictures/bing-wallpapers"
LOCALE=zh-CN
mkdir -p $PICTURE_DIR

check_command_installed () {
	NAME=$1
	BREW_NAME=$2
	if ! [ -x "$(command -v $NAME)" ]; then
		echo "Error: Required GNU $NAME, try \`brew install $BREW_NAME\`"
		exit 1;
	fi
}

if [ `uname` = 'Darwin' ]; then
	check_command_installed ggrep grep
	check_command_installed gsed gnu-sed
fi
check_command_installed jq jq

for i in {0..7}; do
	URL="http://s.cn.bing.net"`curl -s "http://www.bing.com/HPImageArchive.aspx?format=js&idx=$i&n=1&mkt=$LOCALE" | jq -r '.images[0].url'`
	FILENAME=$(echo $URL | ggrep -oP '\K(id=[^=]+.jpg)' | gsed 's/id=//g' | gsed 's/OHR\.//g')
	wget -q -nc -O $PICTURE_DIR/$FILENAME $URL
done
