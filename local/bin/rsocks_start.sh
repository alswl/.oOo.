#!/bin/sh

nohup "$HOME/.virtualenvs/7/bin/rsocks" --config="$HOME/.rsocks.toml" >/dev/null 2>&1 &
