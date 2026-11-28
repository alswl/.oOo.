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

typeset -gaU gwtncd_extensions

# 扩展接收新工作树的绝对路径。只注册用户信任的函数。
gwtncd_register() {
  if [[ $# -ne 1 ]] || (( ! ${+functions[$1]} )); then
    printf 'Usage: gwtncd_register <function>\n' >&2
    return 2
  fi
  gwtncd_extensions+=("$1")
}

# 新建 git worktree 并 cd 进去
gwtncd() {
  local out dir extension

  out="$(git-worktree-new "$@")" || return
  printf '%s\n' "$out"

  dir="${out##*created: }"
  [[ -d "$dir" ]] || return 1

  if (( ! ${argv[(I)--no-sync]} )); then
    for extension in "${gwtncd_extensions[@]}"; do
      if ! ( "$extension" "$dir" ); then
        printf 'gwtncd: extension %s failed in %s\n' "$extension" "$dir" >&2
      fi
    done
  fi
  cd "$dir"
}

_gwtncd_vease_browser() {
  local worktree="$1" vease="$HOME/dev/github.com/alswl/vease-app" common
  [[ -f "$vease/scripts/ensure-browser.sh" ]] || return 0
  common=$(git -C "$worktree" rev-parse --path-format=absolute --git-common-dir) || return 1
  [[ "$common" == "$vease/.git" ]] || return 0
  sh "$vease/scripts/ensure-browser.sh" --link-cached "$worktree"
}

gwtncd_register _gwtncd_vease_browser

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

  target=$(cd -- "$1" && pwd -P) || exit 1
  root=$(git -C "$target" rev-parse --show-toplevel) || exit 1
  root=$(cd -- "$root" && pwd -P) || exit 1
  [[ "$target" == "$root" ]] || {
      echo 'gwtrms: specify the worktree root, not a subdirectory' >&2
      exit 1
  }
  gitdir=$(git -C "$target" rev-parse --absolute-git-dir) || exit 1
  common=$(git -C "$target" rev-parse --path-format=absolute --git-common-dir) || exit 1
  [[ "$gitdir" != "$common" ]] || {
      echo 'gwtrms: refusing to remove the main worktree' >&2
      exit 1
  }

  submodule_paths() {
      [[ -f "$1/.gitmodules" ]] || return 0
      git config -f "$1/.gitmodules" --get-regexp '^submodule\..*\.path$' |
          sed 's/^[^[:space:]]*[[:space:]]//' || [[ ${pipestatus[1]} == 1 ]]
  }

  local -a disposable_dirs=()

  inspect_tree() {
      local tree="$1" changes='' dir sub entry file entries submodules operation
      dir=$(git -C "$tree" rev-parse --absolute-git-dir) || return 1
      [[ ! -e "$dir/locked" ]] || {
          printf 'gwtrms: locked worktree: %s\n' "$tree" >&2
          return 1
      }
      for operation in rebase-merge rebase-apply BISECT_START MERGE_HEAD CHERRY_PICK_HEAD REVERT_HEAD sequencer; do
          if [[ -e "$dir/$operation" ]]; then
              printf 'gwtrms: Git operation in progress in %s; retained\n' "$tree" >&2
              return 1
          fi
      done
      entries=$(git -C "$tree" status --porcelain -z --untracked-files=normal --ignored --ignore-submodules="${2:-none}") || return 1
      while IFS= read -r -d '' entry; do
          file="${entry#???}"
          if [[ "$entry" == '!! '* &&
                ( "$file" == .venv/ || "$file" == */.venv/ ||
                  "$file" == __pycache__/ || "$file" == */__pycache__/ ) &&
                -d "$tree/$file" && ! -L "$tree/${file%/}" ]]; then
              disposable_dirs+=("$tree/$file")
          else
              changes+="$entry"$'\n'
              # Rename/copy records have a second NUL-delimited path.
              if [[ "${entry[1,2]}" == *[RC]* ]]; then
                  IFS= read -r -d '' file || return 1
                  changes+="$file"$'\n'
              fi
          fi
      done <<< "$entries"
      [[ -z "$changes" ]] || {
          printf 'gwtrms: local changes or files in %s; retained:\n%s\n' "$tree" "$changes" >&2
          return 1
      }
      submodules=$(submodule_paths "$tree") || return 1
      while IFS= read -r sub; do
          [[ -n "$sub" && -e "$tree/$sub/.git" ]] || continue
          inspect_tree "$tree/$sub" || return 1
      done <<< "$submodules"
  }

  remove_submodules() {
      local tree="$1" sub dir shared submodules
      submodules=$(submodule_paths "$tree") || return 1
      while IFS= read -r sub; do
          [[ -n "$sub" && -e "$tree/$sub/.git" ]] || continue
          remove_submodules "$tree/$sub" || return 1
          dir=$(git -C "$tree/$sub" rev-parse --absolute-git-dir) || return 1
          shared=$(git -C "$tree/$sub" rev-parse --path-format=absolute --git-common-dir) || return 1
          if [[ "$dir" != "$shared" ]]; then
              git --git-dir="$shared" worktree remove -- "$tree/$sub" || return 1
          else
              git -C "$tree" submodule deinit -- "$sub" || return 1
          fi
      done <<< "$submodules"
  }

  # A caller may test our exit status, which disables ERR_EXIT within this function.
  inspect_tree "$target" || exit 1
  # Only remove approved ignored caches after every checkout passed inspection.
  if (( ${#disposable_dirs} > 0 )); then
      rm -rf -- "${disposable_dirs[@]}" || exit 1
  fi
  remove_submodules "$target" || exit 1
  inspect_tree "$target" all || exit 1
  # Git still requires --force for worktrees with submodule administration data.
  git --git-dir="$common" worktree remove --force -- "$target"
)

# 清理已合并的分支（含 squash）和已合入当前 HEAD 的 detached worktree。
gcleanup() (
  emulate -L zsh
  setopt ERR_EXIT NO_UNSET PIPE_FAIL

  [[ $# -eq 0 ]] || { echo 'Usage: gcleanup' >&2; exit 2; }
  local target current branch base probe entry wt='' wt_head='' ref
  local -i worktree_index=0
  local -a candidates=() detached_worktrees=() cleaned=() retained=()
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
      'worktree '*)
        wt="${entry#worktree }"
        wt_head=''
        (( ++worktree_index ))
        ;;
      'HEAD '*) wt_head="${entry#HEAD }" ;;
      'branch '*) worktrees[${entry#branch }]="$wt" ;;
      detached)
        # Git lists the main worktree first, even when invoked from a linked one.
        if (( worktree_index > 1 )) && git merge-base --is-ancestor "$wt_head" "$target"; then
          detached_worktrees+=("$wt")
        fi
        ;;
    esac
  done < <(git worktree list --porcelain -z)

  for branch in "${candidates[@]}"; do
    ref="refs/heads/$branch"
    wt="${worktrees[$ref]-}"
    if [[ -n "$wt" ]] && ! gwtrms "$wt"; then
      retained+=("$branch")
      continue
    fi
    if git branch -D -- "$branch"; then
      cleaned+=("$branch")
    else
      retained+=("$branch")
    fi
  done
  for wt in "${detached_worktrees[@]}"; do
    if gwtrms "$wt"; then
      cleaned+=("detached worktree $wt")
    else
      retained+=("detached worktree $wt")
    fi
  done
  printf 'gcleanup: checked %d candidates; cleaned %d; retained %d\n' \
    "$(( ${#candidates} + ${#detached_worktrees} ))" "${#cleaned}" "${#retained}"
  (( ${#cleaned} == 0 )) || printf '  cleaned: %s\n' "${cleaned[@]}"
  (( ${#retained} == 0 )) || printf '  retained: %s (see errors above)\n' "${retained[@]}"
  (( ${#retained} == 0 ))
)
