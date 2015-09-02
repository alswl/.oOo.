#!/bin/bash

FINAL_INDEX_PATH="$HOME/Library/Application Support/Dash/DocSets/index.html"
TEMP_INDEX_PATH="$HOME/Library/Application Support/Dash/DocSets/index.html.tmp"
BODY_INDEX_PATH="$HOME/Library/Application Support/Dash/DocSets/index.html.body"
WHOAMI=`whoami`

echo -n '' > "$TEMP_INDEX_PATH"

ls $HOME/Library/Application\ Support/Dash/DocSets/*/*/Contents/Resources/Documents/index.html | sed "s/\\/Users\\/$WHOAMI\\/Library\\/Application Support\\/Dash\\/DocSets\\///g" >> "$TEMP_INDEX_PATH"
ls $HOME/Library/Application\ Support/Dash/DocSets/*/*/Contents/Resources/Documents/doc/index.html | sed "s/\\/Users\\/$WHOAMI\\/Library\\/Application Support\\/Dash\\/DocSets\\///g" >> "$TEMP_INDEX_PATH"


awk -F '/' '{printf("<li><a href=\"%s\">%s</a></li>", $0, $1);}' "$TEMP_INDEX_PATH" > "$BODY_INDEX_PATH"

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
