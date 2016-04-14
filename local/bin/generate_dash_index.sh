#!/bin/bash

FINAL_INDEX_PATH="$HOME/Library/Application Support/Dash/index.html"
TEMP_INDEX_PATH="$HOME/Library/Application Support/Dash/index.html.tmp"
BODY_INDEX_PATH="$HOME/Library/Application Support/Dash/index.html.body"
WHOAMI=`whoami`

echo -n '' > "$TEMP_INDEX_PATH"

ls $HOME/Library/Application\ Support/Dash/DocSets/*/*/Contents/Resources/Documents/index.html | sed "s/\\/Users\\/$WHOAMI\\/Library\\/Application Support\\/Dash\\///g" >> "$TEMP_INDEX_PATH"
ls $HOME/Library/Application\ Support/Dash/DocSets/*/*/Contents/Resources/Documents/doc/index.html | sed "s/\\/Users\\/$WHOAMI\\/Library\\/Application Support\\/Dash\\///g" >> "$TEMP_INDEX_PATH"

ls $HOME/Library/Application\ Support/Dash/User\ Contributed/*/*/Contents/Resources/Documents/index.html | sed "s/\\/Users\\/$WHOAMI\\/Library\\/Application Support\\/Dash\\///g" >> "$TEMP_INDEX_PATH"
ls $HOME/Library/Application\ Support/Dash/User\ Contributed/*/*/Contents/Resources/Documents/configuration.html | sed "s/\\/Users\\/$WHOAMI\\/Library\\/Application Support\\/Dash\\///g" >> "$TEMP_INDEX_PATH"
# ls $HOME/Library/Application\ Support/Dash/DocSets/AngularJS/AngularJS.docset/Contents/Resources/Documents/angularjs/code.angularjs.org/1.4.8/docs.html | sed "s/\\/Users\\/$WHOAMI\\/Library\\/Application Support\\/Dash\\///g" >> "$TEMP_INDEX_PATH"

ls $HOME/Library/Application\ Support/Dash/Cheat\ Sheets/*/*/Contents/Resources/Documents/index.html | sed "s/\\/Users\\/$WHOAMI\\/Library\\/Application Support\\/Dash\\///g" >> "$TEMP_INDEX_PATH"


ls $HOME/Library/Application\ Support/Dash/Java\ DocSets/*/*/Contents/Resources/Documents/dash_javadoc/index.html | sed "s/\\/Users\\/$WHOAMI\\/Library\\/Application Support\\/Dash\\///g" >> "$TEMP_INDEX_PATH"

awk -F '/' '{printf("<li class=\"pull-left\" style=\"width: 240px\"><a href=\"%s\">%s</a></li>", $0, $2);}' "$TEMP_INDEX_PATH" > "$BODY_INDEX_PATH"

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
