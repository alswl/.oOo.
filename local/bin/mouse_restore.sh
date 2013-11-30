#!/bin/sh

## Save
# get current postion, save to last
CURRENT_WINDOW=iTerm
[ -f /tmp/SLATE_M_CURR ] && CURRENT_WINDOW=`cat /tmp/SLATE_M_CURR`

# save now pos

NOW_POS=`/usr/local/bin/cliclick p | /usr/bin/awk '{print $4}'`
echo $NOW_POS > /tmp/SLATE_M_$CURRENT_WINDOW

## Restore
# get wanted position
POS=500,400
[ -f /tmp/SLATE_M_$1 ] && POS=`cat /tmp/SLATE_M_$1`

# restore postion
/usr/local/bin/cliclick m:$POS

#LAST_WINDOW=iTerm
#[ -f /tmp/SLATE_M_LAST_WINDOW ] && LAST_WINDOW=`cat /tmp/SLATE_M_LAST_WINDOW`
echo $1 > /tmp/SLATE_M_CURR

