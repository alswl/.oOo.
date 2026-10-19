#!/bin/bash
# gost-claude.5s.sh
# <xbar.title>gost-claude</xbar.title>
# <xbar.version>v2.0</xbar.version>
# <xbar.author>alswl</xbar.author>
# <xbar.desc>gost TLS proxy for Claude Code — toggle on/off from menu bar (127.0.0.1:1236 → remote set in gost-claude.env)</xbar.desc>
# <xbar.dependencies>gost</xbar.dependencies>
# <xbar.abouturl>https://github.com/ginuerzh/gost</xbar.abouturl>

SCRIPT_PATH="$0"
[[ -L "$SCRIPT_PATH" ]] && SCRIPT_PATH="$(readlink "$SCRIPT_PATH")"
SCRIPT_DIR="$(cd "$(dirname "$SCRIPT_PATH")" && pwd)"
ENV_FILE="$SCRIPT_DIR/gost-claude.env"
SCRIPT_NAME="$(basename "$0")"

LOGFILE="$HOME/Library/Logs/gost-claude.log"
GOST_BIN="${GOST_BIN:-/opt/homebrew/bin/gost}"
GOST_LISTEN="127.0.0.1:1236"
# common env convention: AUTO_START=true starts the proxy on refresh
AUTO_START=false

if [[ -f "$ENV_FILE" ]]; then
	source "$ENV_FILE"
fi

# Match the exact gost process by its listen address (pidfile in /tmp gets
# purged by macOS periodic cleanup while the process stays alive)
GOST_PATTERN="gost .*-L http://${GOST_LISTEN}"

is_running() {
	pgrep -f "$GOST_PATTERN" >/dev/null 2>&1
}

env_ready() {
	[[ -n "$GOST_USER" && -n "$GOST_PASSWORD" && -n "$GOST_REMOTE" && -x "$GOST_BIN" ]]
}

start_gost() { # $1 = notify (true/false)
	env_ready || return 1
	nohup "$GOST_BIN" \
		-L "http://${GOST_LISTEN}" \
		-F "http+tls://${GOST_USER}:${GOST_PASSWORD}@${GOST_REMOTE}?secure=true" \
		>> "$LOGFILE" 2>&1 &
	[[ "$1" == "true" ]] && osascript -e 'display notification "gost proxy started on :1236" with title "gost-claude"'
}

# manual stop wins over AUTO_START until the menu Start
STATE_STOP="/tmp/gost-claude.stopped"

# AUTO_START: silent + idempotent, only when env is complete;
# 60s cooldown so bad envs do not spawn gost every refresh;
# a manual Stop keeps it down until menu Start
if [[ "$AUTO_START" == "true" && "$1" != 'toggle' ]] && ! is_running \
	&& env_ready && [[ ! -e "$STATE_STOP" ]]; then
	STAMP="/tmp/gost-claude.autostart.stamp"
	if [[ ! -f "$STAMP" || $(( $(date +%s) - $(cat "$STAMP") )) -ge 60 ]]; then
		date +%s > "$STAMP"
		start_gost false
	fi
fi

get_pid() {
	pgrep -f "$GOST_PATTERN" | head -1
}

uptime_str() {
	local pid=$1
	ps -o etime= -p "$pid" 2>/dev/null | tr -d ' '
}

connection_count() {
	lsof -i ":${GOST_LISTEN##*:}" -sTCP:ESTABLISHED 2>/dev/null | tail -n +2 | wc -l | tr -d ' '
}

if [[ "$1" = "toggle" ]]; then
	if is_running; then
		pkill -f "$GOST_PATTERN"
		touch "$STATE_STOP"
		osascript -e 'display notification "gost proxy stopped" with title "gost-claude"'
	else
		rm -f "$STATE_STOP"
		if ! env_ready; then
			osascript -e 'display notification "set GOST_USER/GOST_PASSWORD/GOST_REMOTE in gost-claude.env (and check gost binary)" with title "gost-claude"'
			exit 1
		fi
		start_gost true
	fi
	exit
fi

# === Menu output ===

if is_running; then
	PID=$(get_pid)
	echo "🕶️"
	echo "---"
	echo "${SCRIPT_NAME}"
	echo "Running"
	echo "Local:   ${GOST_LISTEN}"
	echo "Remote:  ${GOST_REMOTE:-—}"
	echo "PID:     $PID"
	echo "Uptime:  $(uptime_str "$PID")"
	echo "Conns:   $(connection_count)"
	echo "Log:     $(tail -1 "$LOGFILE" 2>/dev/null | cut -c1-60)"
else
	echo "⚪"
	echo "---"
	echo "${SCRIPT_NAME}"
	echo "Stopped"
	echo "Local:   ${GOST_LISTEN}"
	echo "Remote:  ${GOST_REMOTE:-—}"
	[[ -e "$STATE_STOP" ]] && echo "Manually stopped (auto-start paused)"
fi
echo "---"
if is_running; then
	echo "Stop gost | bash='$0' param1=toggle terminal=false refresh=true"
else
	echo "Start gost | bash='$0' param1=toggle terminal=false refresh=true"
fi
echo "Refresh | refresh=true"
