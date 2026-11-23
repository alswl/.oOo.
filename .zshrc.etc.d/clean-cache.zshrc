if [[ "$OSTYPE" == "darwin"* ]]; then
  clean-codex() {
    emulate -L zsh
    local dry_run=false target name year month cutoff latest
    local -a releases candidates
    local result=0

    if (( $# > 1 )) || { (( $# == 1 )) && [[ "$1" != "--dry-run" ]]; }; then
      print -u2 'Usage: clean-codex [--dry-run]'
      return 2
    fi
    [[ "$1" == "--dry-run" ]] && dry_run=true

    for target in "$HOME"/.codex/packages/app-server-daemon/releases/*(/N); do
      name=${target:t}
      [[ "$name" =~ '^[0-9]+\.[0-9]+\.[0-9]+-[[:alnum:]_-]+$' ]] && releases+=("$target")
    done
    releases=( ${(on)releases} )
    if (( ${#releases} )); then
      latest=${releases[-1]}
      for target in "${releases[@]}"; do
        [[ "$target" != "$latest" ]] && candidates+=("$target")
      done
    fi

    year=$(date +%Y) || return 1
    month=$(date +%m) || return 1
    cutoff=$(( 10#$year * 12 + 10#$month - 1 ))
    for target in "$HOME"/.codex/sessions/[0-9][0-9][0-9][0-9]/[0-9][0-9](/N); do
      year=${target:h:t}
      month=${target:t}
      (( 10#$month >= 1 && 10#$month <= 12 && 10#$year * 12 + 10#$month < cutoff )) && candidates+=("$target")
    done

    for target in "${candidates[@]}"; do
      if $dry_run; then
        print -r -- "Would trash: $target"
      else
        print -r -- "Trashing: $target"
        trash "$target" || result=1
      fi
    done
    return $result
  }

  alias clean-homebrew='du -sh $HOME/Library/Caches/Homebrew/; find $HOME/Library/Caches/Homebrew/ -maxdepth 1 -mindepth 1 -exec trash {} \; '
  alias clean-coursier='find $HOME/Library/Caches/Coursier/v1/http -maxdepth 1 -mindepth 1 -exec trash {} \; ; find $HOME/Library/Caches/Coursier/v1/https -maxdepth 1 -mindepth 1 -exec trash {} \;'
  alias clean-pip='find $HOME/Library/Caches/pip/http -maxdepth 1 -mindepth 1 -exec trash {} \;'
  alias clean-yarn='find $HOME/Library/Caches/Yarn -maxdepth 1 -mindepth 1 -exec trash {} \;'
  alias clean-docker-machne='docker-machine rm default'
  alias clean-minikube='minikube delete && rm -rf $HOME/.minikube/cache'
  alias clean-npm-cacache='du -sh $HOME/.npm/_cacache; trash $HOME/.npm/_cacache'
  alias clean-pnpm='du -sh $HOME/Library/pnpm; trash $HOME/Library/pnpm'
  alias clean-sbt-boot='du -sh $HOME/.sbt/boot; trash $HOME/.sbt/boot'
  alias clean-npm-tarball='du -sh $HOME/.npminstall_tarball; trash $HOME/.npminstall_tarball'
  alias clean-dev-go-pkg-mod='du -sh $HOME/dev/go/pkg/mod; trash $HOME/dev/go/pkg/mod'
  alias clean-dev-node-modules='gfind $HOME/dev -maxdepth 2 -name node_modules -exec trash {} \;'
  alias clean-dev-venv='gfind $HOME/dev -maxdepth 2 -name .venv -exec trash {} \;'
  alias clean-ws-go-pkg-mod='du -sh $HOME/ws/go/pkg/mod; trash $HOME/ws/go/pkg/mod'
  alias clean-ws-node-modules='gfind $HOME/ws -maxdepth 2 -name node_modules -exec trash {} \;'
  alias clean-ws-venv='gfind $HOME/ws -maxdepth 2 -name .venv -exec trash {} \;'
  alias clean-m2='du -sh $HOME/.m2/repository; trash $HOME/.m2/repository'
  alias clean-lima='du -sh $HOME/Library/Caches/lima; trash $HOME/Library/Caches/lima'
  alias clean-netease-music-cache='du -sh $HOME/Library/Caches/com.netease.163music/; trash $HOME/Library/Caches/com.netease.163music/'
fi
