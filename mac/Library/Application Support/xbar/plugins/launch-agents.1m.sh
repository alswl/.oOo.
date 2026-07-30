#!/usr/bin/env bash

# <xbar.title>Launch Agents</xbar.title>
# <xbar.version>v1.0.0</xbar.version>
# <xbar.desc>Inspect and manage macOS plist-based LaunchAgents from the menu bar.</xbar.desc>
# <xbar.dependencies>launchctl,plutil</xbar.dependencies>

set -u

SCRIPT_PATH="$0"
if [[ -L "$SCRIPT_PATH" ]]; then
	SCRIPT_PATH="$(readlink "$SCRIPT_PATH")"
fi
SCRIPT_DIR="$(cd "$(dirname "$SCRIPT_PATH")" && pwd)"
SCRIPT_PATH="$SCRIPT_DIR/$(basename "$SCRIPT_PATH")"

USER_ID="$(id -u)"
DOMAIN="gui/$USER_ID"

# Override with a colon-separated list when only selected directories should be
# displayed, for example:
# XBAR_LAUNCH_AGENT_DIRS="$HOME/Library/LaunchAgents"
LAUNCH_AGENT_DIRS="${XBAR_LAUNCH_AGENT_DIRS:-$HOME/Library/LaunchAgents:/Library/LaunchAgents}"

notify() {
	local title="$1"
	local message="$2"
	/usr/bin/osascript - "$title" "$message" <<'APPLESCRIPT' >/dev/null 2>&1
on run argv
	display notification (item 2 of argv) with title (item 1 of argv)
end run
APPLESCRIPT
}

plist_label() {
	/usr/bin/plutil -extract Label raw -o - "$1" 2>/dev/null
}

is_loaded() {
	/bin/launchctl print "$DOMAIN/$1" >/dev/null 2>&1
}

run_action() {
	local action="$1"
	local label="${2:-}"
	local plist="${3:-}"
	local output=""
	local rc=0

	if [[ -z "$label" || -z "$plist" || ! -f "$plist" ]]; then
		notify "Launch Agents" "The plist file could not be found"
		exit 1
	fi

	case "$action" in
		start)
			/bin/launchctl enable "$DOMAIN/$label" 2>/dev/null || true
			if is_loaded "$label"; then
				output="$(/bin/launchctl kickstart "$DOMAIN/$label" 2>&1)" || rc=$?
			else
				output="$(/bin/launchctl bootstrap "$DOMAIN" "$plist" 2>&1)" || rc=$?
			fi
			;;
		stop)
			if is_loaded "$label"; then
				output="$(/bin/launchctl bootout "$DOMAIN/$label" 2>&1)" || rc=$?
			fi
			;;
		restart)
			/bin/launchctl enable "$DOMAIN/$label" 2>/dev/null || true
			if is_loaded "$label"; then
				/bin/launchctl bootout "$DOMAIN/$label" >/dev/null 2>&1 || true
			fi
			output="$(/bin/launchctl bootstrap "$DOMAIN" "$plist" 2>&1)" || rc=$?
			;;
		disable)
			if is_loaded "$label"; then
				/bin/launchctl bootout "$DOMAIN/$label" >/dev/null 2>&1 || true
			fi
			output="$(/bin/launchctl disable "$DOMAIN/$label" 2>&1)" || rc=$?
			;;
		enable)
			output="$(/bin/launchctl enable "$DOMAIN/$label" 2>&1)" || rc=$?
			;;
		*)
			exit 2
			;;
	esac

	if ((rc == 0)); then
		case "$action" in
			start) notify "$label" "Started" ;;
			stop) notify "$label" "Stopped" ;;
			restart) notify "$label" "Restarted" ;;
			disable) notify "$label" "Automatic startup disabled" ;;
			enable) notify "$label" "Automatic startup enabled" ;;
		esac
	else
		output="${output//$'\n'/ }"
		notify "$label" "Operation failed: ${output:-launchctl returned $rc}"
	fi

	exit "$rc"
}

case "${1:-}" in
	start | stop | restart | disable | enable)
	run_action "$@"
	;;
esac

menu_action() {
	local title="$1"
	local action="$2"
	local label="$3"
	local plist="$4"
	printf -- '--%s | shell="%s" param1="%s" param2="%s" param3="%s" terminal=false refresh=true\n' \
		"$title" "$SCRIPT_PATH" "$action" "$label" "$plist"
}

sanitize_title() {
	printf '%s' "$1" | tr '\n|' '  '
}

display_path() {
	local path="$1"
	if [[ "$path" == "$HOME"/* ]]; then
		# This is a display-only abbreviation, not a shell path expansion.
		# shellcheck disable=SC2088
		path='~/'"${path#"$HOME"/}"
	fi
	sanitize_title "$path"
}

label_seen() {
	local label="$1"
	printf '%s' "$SEEN_LABELS" | /usr/bin/grep -Fqx -- "$label"
}

is_disabled() {
	local label="$1"
	printf '%s\n' "$DISABLED_SERVICES" |
		/usr/bin/awk -v target="\"$label\"" '$1 == target && $2 == "=>" && $3 == "true" { found=1 } END { exit !found }'
}

service_record() {
	local label="$1"
	printf '%s\n' "$LOADED_SERVICES" |
		/usr/bin/awk -v target="$label" '$3 == target { print $1 "\t" $2; exit }'
}

LOADED_SERVICES="$(/bin/launchctl list 2>/dev/null || true)"
DISABLED_SERVICES="$(/bin/launchctl print-disabled "$DOMAIN" 2>/dev/null || true)"

PLIST_PATHS=()
OLD_IFS="$IFS"
IFS=:
for directory in $LAUNCH_AGENT_DIRS; do
	[[ -d "$directory" ]] || continue
	for plist in "$directory"/*.plist; do
		[[ -f "$plist" ]] && PLIST_PATHS[${#PLIST_PATHS[@]}]="$plist"
	done
done
IFS="$OLD_IFS"

RUNNING_COUNT=0
LOADED_COUNT=0
DISABLED_COUNT=0
TOTAL_COUNT=0
SEEN_LABELS=$'\n'
USER_MENU_LINES=""
SYSTEM_MENU_LINES=""
USER_COUNT=0
SYSTEM_COUNT=0

for plist in "${PLIST_PATHS[@]}"; do
	label="$(plist_label "$plist")"
	[[ -n "$label" ]] || continue

	# launchd identifies jobs by Label; show the first plist when duplicate labels
	# exist in multiple scanned directories.
	if label_seen "$label"; then
		continue
	fi
	SEEN_LABELS+="$label"$'\n'
	TOTAL_COUNT=$((TOTAL_COUNT + 1))

	record="$(service_record "$label")"
	pid="${record%%	*}"
	status="${record#*	}"
	if [[ -z "$record" ]]; then
		state_icon="⚪"
		state_text="Not loaded"
	elif [[ "$pid" != "-" && "$pid" =~ ^[0-9]+$ ]]; then
		state_icon="🟢"
		state_text="Running · PID $pid"
		RUNNING_COUNT=$((RUNNING_COUNT + 1))
	else
		state_icon="🟡"
		state_text="Loaded · exit code $status"
		LOADED_COUNT=$((LOADED_COUNT + 1))
	fi

	if is_disabled "$label"; then
		state_icon="⛔"
		state_text="Disabled"
		DISABLED_COUNT=$((DISABLED_COUNT + 1))
	fi

	safe_label="$(sanitize_title "$label")"
	safe_state="$(sanitize_title "$state_text")"
	ITEM_LINES="$state_icon $safe_label · $safe_state"$'\n'
	ITEM_LINES+="--$(display_path "$plist")"$'\n'

	if [[ -z "$record" ]]; then
		menu_line="$(menu_action "Start" start "$label" "$plist")"
	else
		menu_line="$(menu_action "Restart" restart "$label" "$plist")"
		ITEM_LINES+="$menu_line"$'\n'
		menu_line="$(menu_action "Stop" stop "$label" "$plist")"
	fi
	ITEM_LINES+="$menu_line"$'\n'

	if is_disabled "$label"; then
		menu_line="$(menu_action "Enable automatic startup" enable "$label" "$plist")"
	else
		menu_line="$(menu_action "Disable automatic startup" disable "$label" "$plist")"
	fi
	ITEM_LINES+="$menu_line"$'\n'
	ITEM_LINES+="--Reveal in Finder | shell=\"/usr/bin/open\" param1=\"-R\" param2=\"$plist\" terminal=false"$'\n'

	if [[ "$plist" == "$HOME/Library/LaunchAgents/"* ]]; then
		USER_MENU_LINES+="$ITEM_LINES"
		USER_COUNT=$((USER_COUNT + 1))
	else
		SYSTEM_MENU_LINES+="$ITEM_LINES"
		SYSTEM_COUNT=$((SYSTEM_COUNT + 1))
	fi
done

echo "⚙️"

echo "---"
echo "LaunchAgents"
echo "Running $RUNNING_COUNT · loaded $LOADED_COUNT · disabled $DISABLED_COUNT · total $TOTAL_COUNT"
echo "---"

if ((TOTAL_COUNT > 0)); then
	if ((USER_COUNT > 0)); then
		echo "User LaunchAgents ($USER_COUNT)"
		printf '%s' "$USER_MENU_LINES"
	fi
	if ((USER_COUNT > 0 && SYSTEM_COUNT > 0)); then
		echo "---"
	fi
	if ((SYSTEM_COUNT > 0)); then
		echo "System LaunchAgents ($SYSTEM_COUNT)"
		printf '%s' "$SYSTEM_MENU_LINES"
	fi
else
	echo "No plist files found"
	echo "--Scanned directories: $(display_path "$LAUNCH_AGENT_DIRS")"
fi

echo "---"
echo "Open user LaunchAgents directory | shell=\"/usr/bin/open\" param1=\"$HOME/Library/LaunchAgents\" terminal=false"
echo "Refresh | refresh=true"
