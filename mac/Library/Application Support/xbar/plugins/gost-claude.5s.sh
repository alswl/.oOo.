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

if [[ -f "$ENV_FILE" ]]; then
	source "$ENV_FILE"
fi

# Match the exact gost process by its listen address (pidfile in /tmp gets
# purged by macOS periodic cleanup while the process stays alive)
GOST_PATTERN="gost .*-L http://${GOST_LISTEN}"

is_running() {
	pgrep -f "$GOST_PATTERN" >/dev/null 2>&1
}

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
		osascript -e 'display notification "gost proxy stopped" with title "gost-claude"'
	else
		if [[ -z "$GOST_USER" || -z "$GOST_PASSWORD" || -z "$GOST_REMOTE" ]]; then
			osascript -e 'display notification "GOST_USER, GOST_PASSWORD or GOST_REMOTE not set" with title "gost-claude"'
			exit 1
		fi
		if [[ ! -x "$GOST_BIN" ]]; then
			osascript -e "display notification \"gost binary not found: $GOST_BIN\" with title \"gost-claude\""
			exit 1
		fi
		nohup "$GOST_BIN" \
			-L "http://${GOST_LISTEN}" \
			-F "http+tls://${GOST_USER}:${GOST_PASSWORD}@${GOST_REMOTE}?secure=true" \
			>> "$LOGFILE" 2>&1 &
		osascript -e 'display notification "gost proxy started on :1236" with title "gost-claude"'
	fi
	exit
fi

# === Menu output ===

if is_running; then
	PID=$(get_pid)
	echo "🔐"
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
	echo "🔓"
	echo "---"
	echo "${SCRIPT_NAME}"
	echo "Stopped"
	echo "Local:   ${GOST_LISTEN}"
	echo "Remote:  ${GOST_REMOTE:-—}"
fi
echo "---"
if is_running; then
	echo "Stop gost | bash='$0' param1=toggle terminal=false refresh=true"
else
	echo "Start gost | bash='$0' param1=toggle terminal=false refresh=true"
fi
echo "Refresh | refresh=true"
