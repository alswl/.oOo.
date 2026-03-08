#!/usr/bin/env bash

# <xbar.title>GOST Proxy</xbar.title>
# <xbar.version>v1.1</xbar.version>
# <xbar.author>alswl</xbar.author>
# <xbar.desc>Start/stop GOST local proxy in menu bar (127.0.0.1:1234 → 127.0.0.1:1235)</xbar.desc>
# <xbar.dependencies>gost</xbar.dependencies>

# Ensure Homebrew paths
export PATH="/usr/local/bin:/opt/homebrew/bin:${PATH}"

# Resolve script absolute path for xbar menu actions
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
SCRIPT_PATH="${SCRIPT_DIR}/$(basename "$0")"

GOST_CMD="${GOST_CMD:-gost -L=127.0.0.1:1234 -F=http://127.0.0.1:1235}"
GOST_LOG="/tmp/gost.log"
# Match gost process started by this plugin (listening on 1234)
GOST_PATTERN="127.0.0.1:1234"

is_gost_running() {
	pgrep -f "$GOST_PATTERN" >/dev/null 2>&1
}

kill_gost() {
	# SIGTERM first, then SIGKILL to ensure process exits
	for pid in $(pgrep -f "$GOST_PATTERN"); do
		[[ "$pid" =~ ^[0-9]+$ ]] && kill "$pid" 2>/dev/null
	done
	sleep 1
	for pid in $(pgrep -f "$GOST_PATTERN"); do
		[[ "$pid" =~ ^[0-9]+$ ]] && kill -9 "$pid" 2>/dev/null
	done
}

# Handle xbar menu actions via arguments
case "${1:-}" in
	start)
		if is_gost_running; then
			echo "GOST already running" >&2
			exit 0
		fi
		nohup $GOST_CMD >> "$GOST_LOG" 2>&1 &
		disown
		exit 0
		;;
	stop)
		kill_gost
		exit 0
		;;
esac

# Output menu
if is_gost_running; then
	echo "👻"
else
	echo "⚪"
fi
echo "---"
echo "Proxy: 127.0.0.1:1234 → http://127.0.0.1:1235 | size=11"
echo "---"

if is_gost_running; then
	echo "Stop GOST | shell=\"$SCRIPT_PATH\" param1=stop | refresh=true terminal=false"
else
	echo "Start GOST | shell=\"$SCRIPT_PATH\" param1=start | refresh=true terminal=false"
fi
echo "---"
echo "Refresh | refresh=true"
