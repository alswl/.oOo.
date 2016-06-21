#!/bin/bash

set -o
set -x

WHOAMI=`whoami`
FINAL_INDEX_PATH="$HOME/Documents/doc/index.html"
TEMP_INDEX_PATH="$HOME/Documents/index.html.tmp"
BODY_INDEX_PATH="$HOME/Documents/index.html.body"

echo -n '' > "$TEMP_INDEX_PATH"

### general index.html
#ls $HOME/Library/Application\ Support/Dash/DocSets/*/*/Contents/Resources/Documents/index.html | sed "s/\\/Users\\/$WHOAMI\\/Library\\/Application Support\\/Dash\\///g" >> "$TEMP_INDEX_PATH"
### general doc/index.html
#ls $HOME/Library/Application\ Support/Dash/DocSets/*/*/Contents/Resources/Documents/doc/index.html | sed "s/\\/Users\\/$WHOAMI\\/Library\\/Application Support\\/Dash\\///g" >> "$TEMP_INDEX_PATH"
### general Documents/index.html
#ls $HOME/Library/Application\ Support/Dash/User\ Contributed/*/*/Contents/Resources/Documents/index.html | sed "s/\\/Users\\/$WHOAMI\\/Library\\/Application Support\\/Dash\\///g" >> "$TEMP_INDEX_PATH"
### general Documents/configuration.html
#ls $HOME/Library/Application\ Support/Dash/User\ Contributed/*/*/Contents/Resources/Documents/configuration.html | sed "s/\\/Users\\/$WHOAMI\\/Library\\/Application Support\\/Dash\\///g" >> "$TEMP_INDEX_PATH"
#ls $HOME/Library/Application\ Support/Dash/Cheat\ Sheets/*/*/Contents/Resources/Documents/index.html | sed "s/\\/Users\\/$WHOAMI\\/Library\\/Application Support\\/Dash\\///g" >> "$TEMP_INDEX_PATH"
## dash
#ls $HOME/Library/Application\ Support/Dash/Java\ DocSets/*/*/Contents/Resources/Documents/dash_javadoc/index.html | sed "s/\\/Users\\/$WHOAMI\\/Library\\/Application Support\\/Dash\\///g" >> "$TEMP_INDEX_PATH"

rm -Rf /Users/alswl/Documents/doc/
mkdir -p /Users/alswl/Documents/doc/

pushd /Users/$WHOAMI/Documents/doc/

find $HOME/Library/Application\ Support/Dash/ -name 'tarix.tgz' -exec tar xzvf {} \;

find $HOME/Library/Application\ Support/Dash/ -name 'Documents' | while read f; do
	docset=`echo $f | grep -E -o '.*docset'`
	cp -R "$docset" .
done

ls /Users/$WHOAMI/Documents/doc/*/Contents/Resources/Documents/index.html | sed "s/\\/Users\\/$WHOAMI\\/Documents\\/doc\\///g" >> "$TEMP_INDEX_PATH"
ls /Users/$WHOAMI/Documents/doc/*/Contents/Resources/Documents/doc/index.html | sed "s/\\/Users\\/$WHOAMI\\/Documents\\/doc\\///g" >> "$TEMP_INDEX_PATH"
# uwsgi
ls /Users/$WHOAMI/Documents/doc/*/Contents/Resources/Documents/configuration.html | sed "s/\\/Users\\/$WHOAMI\\/Documents\\/doc\\///g" >> "$TEMP_INDEX_PATH"
## java
ls /Users/$WHOAMI/Documents/doc/*/Contents/Resources/Documents/dash_javadoc/index.html | sed "s/\\/Users\\/$WHOAMI\\/Documents\\/doc\\///g" >> "$TEMP_INDEX_PATH"


awk -F '/' '{printf("<li class=\"pull-left\" style=\"width: 240px\"><a href=\"%s\">%s</a></li>", $0, $1);}' "$TEMP_INDEX_PATH" > "$BODY_INDEX_PATH"

echo -n '' > "$FINAL_INDEX_PATH"
echo '<html>' >> "$FINAL_INDEX_PATH"
echo '<head>' >> "$FINAL_INDEX_PATH"
echo '<link rel="stylesheet" href="http://apps.bdimg.com/libs/bootstrap/3.3.4/css/bootstrap.min.css" media="all"/>' >> "$FINAL_INDEX_PATH"
echo '</head>' >> "$FINAL_INDEX_PATH"
echo '<body>' >> "$FINAL_INDEX_PATH"
echo '<div class="container">' >> "$FINAL_INDEX_PATH"

echo '<ul>' >> "$FINAL_INDEX_PATH"
cat "$BODY_INDEX_PATH" >> "$FINAL_INDEX_PATH"
echo '</ul>' >> "$FINAL_INDEX_PATH"

echo '</div>' >> "$FINAL_INDEX_PATH"
echo '</body></html>' >> "$FINAL_INDEX_PATH"

popd
