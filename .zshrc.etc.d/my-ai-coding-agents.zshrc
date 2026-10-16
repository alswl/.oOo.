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
	_ai_agent_session_run claude --settings "$cfg" "$@"
}

# zhipu: flash / pro (pro is glm-5.3; "glm-5.3-pro" does not exist)
claude-zhipu-flash() { _claude_run "$HOME/.claude/profiles/zhipu-glm.json" --model 'glm-5.3-flash[1m]' "$@" }
claude-zhipu-pro()   { _claude_run "$HOME/.claude/profiles/zhipu-glm.json" --model 'glm-5.3' "$@" }

# deepseek
claude-deepseek-flash() { _claude_run "$HOME/.claude/profiles/deepseek.json" --model 'deepseek-v4-flash[1m]' "$@" }

# official claude via claude.ai login: needs HC, and the shell's zhipu
# ANTHROPIC_* env must be stripped or it overrides the login
_claude_official() (
	local model="$1"
	shift
	unset ANTHROPIC_AUTH_TOKEN ANTHROPIC_BASE_URL ANTHROPIC_MODEL \
		ANTHROPIC_DEFAULT_OPUS_MODEL ANTHROPIC_DEFAULT_SONNET_MODEL ANTHROPIC_DEFAULT_HAIKU_MODEL
	export http_proxy=http://127.0.0.1:1236 https_proxy=http://127.0.0.1:1236
	_ai_agent_session_run claude --settings "$HOME/.claude/profiles/claude-official.json" --model "$model" "$@"
)

claude-opus() { _claude_official claude-opus-5-5 "$@" }
claude-sonnet() { _claude_official claude-sonnet-5-5 "$@" }

# codex official models (chatgpt account; slugs from ~/.codex/models_cache.json)
_codex_official() {
	local model="$1"
	shift
	# Work around the Codex CLI TUI bootstrap failure: https://github.com/openai/codex/issues/52775
	http_proxy=http://127.0.0.1:1235 https_proxy=http://127.0.0.1:1235 \
		_ai_agent_codex -m "$model" -c log_dir=/Users/alswl/.codex/log "$@"
}

codex-sol() { _codex_official gpt-6.1-sol "$@" }
codex-astra() { _codex_official gpt-6-astra "$@" }
codex-luna() { _codex_official gpt-6-luna "$@" }
codex-terra() { _codex_official gpt-5.6-terra "$@" }

# Same flags launched through chatta's shared Codex app-server, so IRC
# messages can wake an idle session. Tool commands run in the app-server's
# environment, which keeps the env of whichever launch started it: the proxy
# must be set here, and two agents in one worktree need distinct
# CHATTA_CODEX_SERVICE_HOME values. chatta can only ensure the service, not
# restart it.  Use Homebrew's released Chatta explicitly: a stale development
# binary at ~/dev/go/bin is earlier in PATH on this machine and lacks `codex`.
_codex_official_chat() {
	local model="$1"
	shift
	http_proxy=http://127.0.0.1:1235 https_proxy=http://127.0.0.1:1235 \
		CHATTA_BIN=/opt/homebrew/bin/chatta \
		command /opt/homebrew/bin/chatta chat codex launch -- --dangerously-bypass-approvals-and-sandbox \
		-C "$PWD" -m "$model" -c log_dir=/Users/alswl/.codex/log "$@"
}

codex-sol-chat() { _codex_official_chat gpt-6.1-sol "$@" }
codex-astra-chat() { _codex_official_chat gpt-6-astra "$@" }
codex-luna-chat() { _codex_official_chat gpt-6-luna "$@" }
codex-terra-chat() { _codex_official_chat gpt-5.6-terra "$@" }

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
	print "H proxy baked (1235), via chatta's shared app-server:"
	print "  codex-sol-chat  codex-astra-chat  codex-luna-chat  codex-terra-chat"
}
