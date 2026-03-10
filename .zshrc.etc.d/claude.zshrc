#!/bin/zsh
# Claude Code aliases - auto-generated from ~/.claude/settings.d/

local CLAUDE_DIR="$HOME/.claude/settings.d"

# Auto-generate aliases from config files
_load_claude_aliases() {
  [[ ! -d "$CLAUDE_DIR" ]] && return

  for cfg in "$CLAUDE_DIR"/*.json(N); do
    local name="${cfg:t:r}"
    [[ "$name" == "_common" ]] && continue
    alias "claude-${name//-/_}"="claude --settings \"$cfg\""
  done
}

_load_claude_aliases

# Reload aliases after adding new configs
alias claude-reload='unalias -m "claude-*" 2>/dev/null; _load_claude_aliases'

# List all available configs
claude-configs() {
  [[ ! -d "$CLAUDE_DIR" ]] && { echo "No configs found" >&2; return 1; }

  for cfg in "$CLAUDE_DIR"/*.json(N); do
    local name="${cfg:t:r}"
    [[ "$name" == "_common" ]] && continue
    local alias_name="claude-${name//-/_}"
    printf "  %-40s -> %s\n" "$alias_name" "$name"
  done
}

# Switch default config via symlink
claude-use() {
  local input="${1//_/-}"
  local target="$CLAUDE_DIR/${input}.json"

  if [[ ! -f "$target" ]]; then
    target=$(find "$CLAUDE_DIR" -maxdepth 1 -name "*.json" ! -name "_common.json" | grep -i "$input" | head -1)
  fi

  [[ ! -f "$target" ]] && { echo "Config not found: $1" >&2; return 1; }

  ln -sf "$target" "$HOME/.claude/settings.json"
  echo "Default config: ${target:t:r}"
}
