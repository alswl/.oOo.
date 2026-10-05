#!/bin/zsh
# Custom-launch agent shortcuts, named <agent>-<provider>-<model> (or the
# model family for official tiers).
#
# Plain `claude-<profile>` aliases come from cc-switch via claude.zshrc —
# do not shadow them here. This layer bakes in launch flags: skip
# permissions + session named by current directory. Extra arguments pass
# through, e.g. `claude-zhipu-flash -w`.
#
# Proxy policy:
#   claude-zhipu-* / claude-deepseek-* : direct, no proxy (domestic APIs)
#   claude-opus / claude-sonnet        : HC baked in (127.0.0.1:1236)
#   codex-*                            : H baked in (127.0.0.1:1235, auth refresh)

_claude_run() {
	local cfg="$1"
	shift
	command claude --settings "$cfg" --dangerously-skip-permissions --name "$(basename $PWD)" "$@"
}

# zhipu: flash / pro (pro is glm-5.3; "glm-5.3-pro" does not exist)
claude-zhipu-flash() { _claude_run "$HOME/.claude/profiles/zhipu-glm.json" --model 'glm-5.3-flash[1m]' "$@" }
claude-zhipu-pro()   { _claude_run "$HOME/.claude/profiles/zhipu-glm.json" --model 'glm-5.3' "$@" }

# deepseek
claude-deepseek-flash() { _claude_run "$HOME/.claude/profiles/deepseek.json" --model 'deepseek-v4-flash[1m]' "$@" }

# official claude via claude.ai login: needs HC, and the shell's zhipu
# ANTHROPIC_* env must be stripped or it overrides the login
_claude_official() {
	local model="$1"
	shift
	command env -u ANTHROPIC_AUTH_TOKEN -u ANTHROPIC_BASE_URL -u ANTHROPIC_MODEL \
		-u ANTHROPIC_DEFAULT_OPUS_MODEL -u ANTHROPIC_DEFAULT_SONNET_MODEL -u ANTHROPIC_DEFAULT_HAIKU_MODEL \
		http_proxy=http://127.0.0.1:1236 https_proxy=http://127.0.0.1:1236 \
		claude --settings "$HOME/.claude/profiles/claude-official.json" \
		--dangerously-skip-permissions --name "$(basename $PWD)" --model "$model" "$@"
}

claude-opus() { _claude_official claude-opus-5-5 "$@" }
claude-sonnet() { _claude_official claude-sonnet-5-5 "$@" }

# codex official models (chatgpt account; slugs from ~/.codex/models_cache.json)
_codex_official() {
	local model="$1"
	shift
	http_proxy=http://127.0.0.1:1235 https_proxy=http://127.0.0.1:1235 \
		command codex --dangerously-bypass-approvals-and-sandbox -m "$model" "$@"
}

codex-sol() { _codex_official gpt-6.1-sol "$@" }
codex-astra() { _codex_official gpt-6-astra "$@" }
codex-luna() { _codex_official gpt-6-luna "$@" }
codex-terra() { _codex_official gpt-5.6-terra "$@" }

claude-profile-check() {
	local name="${1//_/-}"
	local cfg="$HOME/.claude/profiles/${name}.json"
	if [[ ! -r "$cfg" ]]; then
		print -u2 "claude: missing profile: $cfg"
		return 1
	fi
	print "claude profile '$name' looks locally valid: $cfg"
}

claude-configs() {
	print "direct (no proxy):"
	print "  claude-zhipu-flash  claude-zhipu-pro  claude-deepseek-flash"
	print "HC proxy baked (1236):"
	print "  claude-opus  claude-sonnet"
	print "H proxy baked (1235):"
	print "  codex-sol  codex-astra  codex-luna  codex-terra"
}
