# fuzzy 选择 git worktree 并 cd 进去
# Requires: fzf
gwcd() {
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
      fzf \
        --delimiter=$'\t' \
        --with-nth=1,2 \
        --prompt='worktree> '
  )"

  [[ -z "$dir" ]] && return

  cd "$(printf '%s\n' "$dir" | awk -F '\t' '{print $2}')"
}

