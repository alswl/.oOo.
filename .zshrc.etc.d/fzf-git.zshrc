# fzf pickers over git-changed files
# Requires: fzf

# Show repo-relative paths in fzf, but emit an absolute path because Neovide
# resolves file arguments from the caller's cwd.
_fzg_files() {
	local root f
	root=$(git rev-parse --show-toplevel 2>/dev/null) || return
	f=$({
		git -C "$root" -c core.quotePath=false diff --name-only --diff-filter=ACMR HEAD
		git -C "$root" -c core.quotePath=false ls-files --others --exclude-standard
	} | fzf) || return
	printf '%s/%s\n' "$root" "$f"
}
fzgv() { local f; f=$(_fzg_files) && command "$EDITOR" -p "$f"; }
fzgo() { local f; f=$(_fzg_files) && open "$f"; }
fzgg() {
	(( $# )) || return 1
	local root sel file line
	root=$(git rev-parse --show-toplevel 2>/dev/null) || return
	sel=$(git -C "$root" -c core.quotePath=false grep -n -- "$@" | fzf) || return
	file=${sel%%:*}
	line=${sel#*:}; line=${line%%:*}
	command "$EDITOR" -p "+$line" "$root/$file"
}
# Browse diffs of files changed against HEAD (untracked files have no diff)
fzgd() {
	local root f
	root=$(git rev-parse --show-toplevel 2>/dev/null) || return
	f=$(git -C "$root" -c core.quotePath=false diff --name-only --diff-filter=ACMR HEAD | fzf) || return
	git -C "$root" diff -- "$f" | less
}
# cd to a directory containing git-changed files (deduped, repo-relative)
fzgcd() {
	local root d
	root=$(git rev-parse --show-toplevel 2>/dev/null) || return
	d=$({
		git -C "$root" -c core.quotePath=false diff --name-only --diff-filter=ACMR HEAD
		git -C "$root" -c core.quotePath=false ls-files --others --exclude-standard
	} | while read -r f; do printf '%s\n' "${f:h}"; done | sort -u | fzf) || return
	cd "$root/$d"
}
