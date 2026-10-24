# fuzzy 选择 git worktree 并 cd 进去
# Requires: fzf
gwtcd() {
  local dir

  dir="$(
    git worktree list --porcelain |
      awk '
        /^worktree / {
          path = substr($0, 10)
          branch = ""
        }

        /^branch / {
          branch = substr($0, 8)
          sub("refs/heads/", "", branch)
        }

        /^detached/ {
          branch = "(detached)"
        }

        /^bare/ {
          branch = "(bare)"
        }

        /^$/ {
          if (path != "") {
            if (branch == "") branch = "(unknown)"
            print branch "\t" path
            path = ""
          }
        }

        END {
          if (path != "") {
            if (branch == "") branch = "(unknown)"
            print branch "\t" path
          }
        }
      ' |
      while IFS=$'\t' read -r branch path; do
        [[ -d "$path" ]] && printf '%s\t%s\n' "$branch" "$path"
      done |
      fzf \
        --delimiter=$'\t' \
        --with-nth=1,2 \
        --prompt='worktree> '
  )"

  [[ -z "$dir" ]] && return

  cd "$(printf '%s\n' "$dir" | awk -F '\t' '{print $2}')"
}

# 新建 git worktree 并 cd 进去
gwtncd() {
  local out dir

  out="$(git-worktree-new "$@")" || return
  printf '%s\n' "$out"

  dir="${out##*created: }"
  [[ -d "$dir" ]] || return 1

  cd "$dir"
}

alias gwcd=gwtcd
alias gwtl=gwtls

# 安全删除 worktree 及其子模块；子 shell 隔离选项和辅助函数。
gwtrms() (
  emulate -L zsh
  setopt ERR_EXIT NO_UNSET PIPE_FAIL
  # Inspect the whole tree before removing any submodule checkout.

  if [[ $# -eq 1 && ( "$1" == -h || "$1" == --help ) ]]; then
      echo 'Usage: gwtrms <worktree-path>'
      echo 'Remove a worktree and its submodule checkouts; refuse local files or changes.'
      exit 0
  fi

  if [[ $# -ne 1 || "$1" == -* ]]; then
      echo 'Usage: gwtrms <worktree-path>' >&2
      echo 'Remove a worktree and its submodule checkouts; refuse local files or changes.' >&2
      exit 2
  fi

  target=$(cd -- "$1" && pwd -P)
  root=$(git -C "$target" rev-parse --show-toplevel)
  [[ "$target" == "$(cd -- "$root" && pwd -P)" ]] || {
      echo 'gwtrms: specify the worktree root, not a subdirectory' >&2
      exit 1
  }
  gitdir=$(git -C "$target" rev-parse --absolute-git-dir)
  common=$(git -C "$target" rev-parse --path-format=absolute --git-common-dir)
  [[ "$gitdir" != "$common" ]] || {
      echo 'gwtrms: refusing to remove the main worktree' >&2
      exit 1
  }

  submodule_paths() {
      [[ -f "$1/.gitmodules" ]] || return 0
      git config -f "$1/.gitmodules" --get-regexp '^submodule\..*\.path$' |
          sed 's/^[^[:space:]]*[[:space:]]//' || [[ ${pipestatus[1]} == 1 ]]
  }

  inspect_tree() {
      local tree="$1" changes dir sub
      dir=$(git -C "$tree" rev-parse --absolute-git-dir)
      [[ ! -e "$dir/locked" ]] || {
          printf 'gwtrms: locked worktree: %s\n' "$tree" >&2
          return 1
      }
      changes=$(git -C "$tree" status --porcelain --untracked-files=all --ignored --ignore-submodules="${2:-none}")
      [[ -z "$changes" ]] || {
          printf 'gwtrms: local changes or files in %s; retained:\n%s\n' "$tree" "$changes" >&2
          return 1
      }
      while IFS= read -r sub; do
          [[ -e "$tree/$sub/.git" ]] || continue
          inspect_tree "$tree/$sub" || return 1
      done < <(submodule_paths "$tree")
  }

  remove_submodules() {
      local tree="$1" sub dir shared
      while IFS= read -r sub; do
          [[ -e "$tree/$sub/.git" ]] || continue
          remove_submodules "$tree/$sub" || return 1
          dir=$(git -C "$tree/$sub" rev-parse --absolute-git-dir)
          shared=$(git -C "$tree/$sub" rev-parse --path-format=absolute --git-common-dir)
          if [[ "$dir" != "$shared" ]]; then
              git --git-dir="$shared" worktree remove -- "$tree/$sub" || return 1
          else
              git -C "$tree" submodule deinit -- "$sub" || return 1
          fi
      done < <(submodule_paths "$tree")
  }

  inspect_tree "$target"
  remove_submodules "$target"
  inspect_tree "$target" all
  # Git still requires --force for worktrees with submodule administration data.
  git --git-dir="$common" worktree remove --force -- "$target"
)

# 清理已合并（含 squash）的分支及其 worktree，以当前 HEAD 为基准。
gcleanup() (
  emulate -L zsh
  setopt ERR_EXIT NO_UNSET PIPE_FAIL

  [[ $# -eq 0 ]] || { echo 'Usage: gcleanup' >&2; exit 2; }
  local target current branch base probe entry wt='' ref
  local -a candidates=()
  local -A worktrees=()
  target=$(git rev-parse --verify HEAD)
  current=$(git symbolic-ref -q HEAD) || {
    echo 'gcleanup: switch to the integration branch first' >&2
    exit 1
  }

  while IFS= read -r branch; do
    ref="refs/heads/$branch"
    [[ "$ref" == "$current" ]] && continue
    case "$branch" in
      main|master|develop|dev|EI[0-9_]*|sprint-*) continue ;;
    esac
    if git merge-base --is-ancestor "$ref" "$target"; then
      candidates+=("$branch")
    else
      base=$(git merge-base "$target" "$ref") || continue
      probe=$(git commit-tree "$(git rev-parse "$ref^{tree}")" -p "$base" -m _)
      if [[ "$(git cherry "$target" "$probe")" == -* ]]; then
        candidates+=("$branch")
      fi
    fi
  done < <(git for-each-ref --format='%(refname:short)' refs/heads/)

  git worktree prune
  while IFS= read -r -d '' entry; do
    case "$entry" in
      'worktree '*) wt="${entry#worktree }" ;;
      'branch '*) worktrees[${entry#branch }]="$wt" ;;
    esac
  done < <(git worktree list --porcelain -z)

  for branch in "${candidates[@]}"; do
    ref="refs/heads/$branch"
    wt="${worktrees[$ref]-}"
    if [[ -n "$wt" ]]; then
      gwtrms "$wt"
    fi
    git branch -D -- "$branch" || exit $?
  done
)
