# Shared Codex launch flags. This file loads before the agent-specific files.
_ai_agent_codex() { command codex --dangerously-bypass-approvals-and-sandbox "$@" }

_ai_agent_session_run() {
	local agent="$1"
	shift
	local -a args
	_ai_agent_worktree_args "$@" || return
	args=("${_AI_AGENT_WORKTREE_ARGS[@]}")
	unset _AI_AGENT_WORKTREE_ARGS
	_ai_agent_prepare_worktrees "${args[@]}" || return
	# Claude-only flags go last: cfuse forwards everything after --cc to the
	# claude engine, and rejects these when they come before its own flags.
	command "$agent" "${args[@]}" --dangerously-skip-permissions --name "$(basename "$PWD")"
}

# Shared two-word worktree names for Claude and cfuse.
_ai_agent_random_worktree_name() {
	local words_file=/usr/share/dict/words
	local seed
	if [[ ! -r "$words_file" ]]; then
		print -u2 "ai-agent: cannot read $words_file to generate a worktree name"
		return 1
	fi
	seed=$(od -An -N4 -tu4 /dev/urandom) || return
	awk -v seed="$seed" '
		BEGIN { srand(seed) }
		/^[[:alpha:]]+$/ {
			word = tolower($0)
			if (!seen[word]++) words[++count] = word
		}
		END {
			if (count < 2) exit 1
			first = int(rand() * count) + 1
			second = int(rand() * (count - 1)) + 1
			if (second >= first) second++
			print words[first] "-" words[second]
		}
	' "$words_file"
}

# Pre-create worktrees and attach initialized submodules as detached worktrees.
_ai_agent_prepare_worktree() {
	local name="$1"
	local root wt submodule_path submodule_commit submodule_config config_status
	local -a submodule_paths
	root=$(git rev-parse --show-toplevel 2>/dev/null) || return
	wt="$root/.claude/worktrees/$name"
	[[ -e "$wt" ]] || git -C "$root" worktree add -b "worktree-$name" "$wt" 2>/dev/null || return
	[[ -f "$wt/.gitmodules" ]] || return 0

	# Each submodule checkout shares the primary worktree's Git directory.
	submodule_config=$(git -C "$wt" config -f .gitmodules --get-regexp '^submodule\..*\.path$')
	config_status=$?
	if ((config_status != 0)); then
		((config_status == 1)) && return 0
		return "$config_status"
	fi
	submodule_paths=("${(@f)$(print -r -- "$submodule_config" | sed 's/^[^[:space:]]*[[:space:]]//')}")
	for submodule_path in "${submodule_paths[@]}"; do
		if [[ -e "$wt/$submodule_path/.git" ]]; then
			git -C "$wt" submodule update --init --recursive -- "$submodule_path" || return
		elif [[ -e "$root/$submodule_path/.git" ]]; then
			submodule_commit=$(git -C "$wt" rev-parse "HEAD:$submodule_path") || return
			mkdir -p "${wt}/${submodule_path:h}" || return
			git -C "$root/$submodule_path" worktree add --detach \
				"$wt/$submodule_path" "$submodule_commit" || return
			git -C "$wt/$submodule_path" submodule update --init --recursive || return
		else
			git -C "$wt" submodule update --init --recursive -- "$submodule_path" || return
		fi
	done
}

_ai_agent_prepare_worktrees() {
	local -a args
	local i name
	args=("$@")
	for ((i = 1; i <= ${#args}; i++)); do
		case "${args[i]}" in
		-w | --worktree)
			((i < ${#args})) && [[ "${args[i + 1]}" != -* ]] || return 1
			name="${args[i + 1]}"
			((i += 1))
			_ai_agent_prepare_worktree "$name" || return
			;;
		-w=* | --worktree=*)
			_ai_agent_prepare_worktree "${args[i]#*=}" || return
			;;
		esac
	done
}

# Add the shared random name when -w/--worktree has no explicit name.
_ai_agent_worktree_args() {
	typeset -ga _AI_AGENT_WORKTREE_ARGS
	_AI_AGENT_WORKTREE_ARGS=("$@")
	local i name
	for ((i = 1; i <= ${#_AI_AGENT_WORKTREE_ARGS}; i++)); do
		case "${_AI_AGENT_WORKTREE_ARGS[i]}" in
		-w | --worktree)
			if ((i < ${#_AI_AGENT_WORKTREE_ARGS})) && [[ "${_AI_AGENT_WORKTREE_ARGS[i + 1]}" != -* ]]; then
				((i += 1))
			else
				name=$(_ai_agent_random_worktree_name) || return
				_AI_AGENT_WORKTREE_ARGS[i]=("${_AI_AGENT_WORKTREE_ARGS[i]}" "$name")
			fi
			;;
		esac
	done
}
