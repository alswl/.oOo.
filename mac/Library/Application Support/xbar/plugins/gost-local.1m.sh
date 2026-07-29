#!/usr/bin/env bash

# <xbar.title>gost-local</xbar.title>
# <xbar.version>v2.0</xbar.version>
# <xbar.author>alswl</xbar.author>
# <xbar.desc>Start/stop GOST local proxy in menu bar (127.0.0.1:1234 → 127.0.0.1:1235)</xbar.desc>
# <xbar.dependencies>gost</xbar.dependencies>

export PATH="/opt/homebrew/bin:/usr/local/bin:${PATH}"

GOST_LISTEN="127.0.0.1:1234"
GOST_FORWARD="127.0.0.1:1235"
GOST_CMD="gost -L=${GOST_LISTEN} -F=http://${GOST_FORWARD}"
GOST_LOG="/tmp/gost.log"
GOST_ERR_LOG="/tmp/gost.error.log"

get_pid() {
	pgrep -f "$GOST_LISTEN" | head -1
}

is_running() {
	pgrep -f "$GOST_LISTEN" >/dev/null 2>&1
}

stop_gost() {
	for pid in $(pgrep -f "$GOST_LISTEN"); do
		kill "$pid" 2>/dev/null
	done
	sleep 1
	for pid in $(pgrep -f "$GOST_LISTEN"); do
		kill -9 "$pid" 2>/dev/null
	done
}

uptime_str() {
	local pid=$1
	ps -o etime= -p "$pid" 2>/dev/null | tr -d ' '
}

connection_count() {
	lsof -i ":${GOST_LISTEN##*:}" -sTCP:ESTABLISHED 2>/dev/null | tail -n +2 | wc -l | tr -d ' '
}

case "${1:-}" in
	start)
		if is_running; then
			exit 0
		fi
		nohup $GOST_CMD >> "$GOST_LOG" 2>> "$GOST_ERR_LOG" &
		disown
		exit 0
		;;
	stop)
		stop_gost
		exit 0
		;;
esac

if is_running; then
	PID=$(get_pid)
	echo "👻"
	echo "---"
	echo "Running"
	echo "Listen:  ${GOST_LISTEN}"
	echo "Forward: ${GOST_FORWARD} (HTTP)"
	echo "PID:     $PID"
	echo "Uptime:  $(uptime_str "$PID")"
	echo "Conns:   $(connection_count)"
	echo "Log:     $(tail -1 "$GOST_LOG" 2>/dev/null | cut -c1-60)"
else
	echo "⚪"
	echo "---"
	echo "Stopped"
	echo "Listen:  ${GOST_LISTEN}"
	echo "Forward: ${GOST_FORWARD} (HTTP)"
fi
echo "---"
if is_running; then
	echo "Stop gost | shell=\"$0\" param1=stop | refresh=true terminal=false"
else
	echo "Start gost | shell=\"$0\" param1=start | refresh=true terminal=false"
fi
echo "---"
echo "Refresh | refresh=true"
