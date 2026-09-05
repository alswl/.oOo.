#!/bin/sh

set -eu

pid_file=/usr/local/var/run/tinyproxy/tinyproxy.pid
if [ ! -r "$pid_file" ]; then
  echo "tinyproxy PID file not found: $pid_file" >&2
  exit 1
fi

pid=$(cat "$pid_file")
case "$pid" in
  ''|*[!0-9]*)
    echo "invalid tinyproxy PID: $pid" >&2
    exit 1
    ;;
esac

kill "$pid"
