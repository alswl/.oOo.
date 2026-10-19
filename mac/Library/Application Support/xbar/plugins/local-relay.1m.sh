#!/usr/bin/env bash
# local-relay.1m.sh (formerly gost-local.1m.sh)

# <xbar.title>local-relay</xbar.title>
# <xbar.version>v2.1</xbar.version>
# <xbar.author>alswl</xbar.author>
# <xbar.desc>Start/stop GOST local proxy in menu bar (127.0.0.1:1234 → 127.0.0.1:1235)</xbar.desc>
# <xbar.dependencies>gost</xbar.dependencies>

export PATH="/opt/homebrew/bin:/usr/local/bin:${PATH}"

SCRIPT_PATH="$0"
[[ -L "$SCRIPT_PATH" ]] && SCRIPT_PATH="$(readlink "$SCRIPT_PATH")"
SCRIPT_DIR="$(cd "$(dirname "$SCRIPT_PATH")" && pwd)"
ENV_FILE="$SCRIPT_DIR/local-relay.env"
SCRIPT_NAME="$(basename "$0")"
# optional local-relay.env overrides; default ports keep the
# historical contract 1234 -> 1235 (upstream e.g. Surge)
AUTO_START=false
GOST_LISTEN="127.0.0.1:1234"
GOST_FORWARD="127.0.0.1:1235"
[[ -f "$ENV_FILE" ]] && source "$ENV_FILE"

GOST_CMD="gost -L=${GOST_LISTEN} -F=http://${GOST_FORWARD}"
GOST_LOG="/tmp/gost.log"
GOST_ERR_LOG="/tmp/gost.error.log"
# match the gost process, not any command merely mentioning the port
RL_MATCH="gost +.*-L[= ]${GOST_LISTEN}"
# manual stop wins over AUTO_START within this relay's lifetime
# (cleared by menu Start; survives refreshes)
STATE_STOP="/tmp/local-relay.stopped"

get_pid() {
	pgrep -f "$RL_MATCH" | head -1
}

is_running() {
	pgrep -f "$RL_MATCH" >/dev/null 2>&1
}

stop_gost() { # $1 = manual (true/false)
	for pid in $(pgrep -f "$RL_MATCH"); do
		kill "$pid" 2>/dev/null
	done
	sleep 1
	for pid in $(pgrep -f "$RL_MATCH"); do
		kill -9 "$pid" 2>/dev/null
	done
	[[ "$1" == "true" ]] && touch "$STATE_STOP"
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
		rm -f "$STATE_STOP"   # manual start clears a manual stop
		if is_running; then
			exit 0
		fi
		nohup $GOST_CMD >> "$GOST_LOG" 2>> "$GOST_ERR_LOG" &
		disown
		exit 0
		;;
	stop)
		stop_gost true
		exit 0
		;;
esac

# optional AUTO_START (local-relay.env): silent + idempotent,
# 60s cooldown so a failing forward does not respawn every refresh;
# a manual Stop keeps it down until menu Start
if [[ "$AUTO_START" == "true" ]] && ! is_running && [[ ! -e "$STATE_STOP" ]]; then
	STAMP="/tmp/local-relay.autostart.stamp"
	if [[ ! -f "$STAMP" || $(( $(date +%s) - $(cat "$STAMP") )) -ge 60 ]]; then
		date +%s > "$STAMP"
		nohup $GOST_CMD >> "$GOST_LOG" 2>> "$GOST_ERR_LOG" &
		disown
	fi
fi

if is_running; then
	PID=$(get_pid)
	echo "🔗"
	echo "---"
	echo "${SCRIPT_NAME}"
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
	echo "${SCRIPT_NAME}"
	echo "Stopped"
	echo "Listen:  ${GOST_LISTEN}"
	echo "Forward: ${GOST_FORWARD} (HTTP)"
	[[ -e "$STATE_STOP" ]] && echo "Manually stopped (auto-start paused)"
fi
echo "---"
if is_running; then
	echo "Stop gost | shell=\"$0\" param1=stop | refresh=true terminal=false"
else
	echo "Start gost | shell=\"$0\" param1=start | refresh=true terminal=false"
fi
echo "---"
echo "Refresh | refresh=true"
