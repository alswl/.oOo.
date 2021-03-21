if [[ "$OSTYPE" == "darwin"* ]]; then
  alias clean-homebrew='du -sh $HOME/Library/Caches/Homebrew/downloads/; find $HOME/Library/Caches/Homebrew/downloads/ -maxdepth 1 -mindepth 1 -exec trash {} \; ; brew cleanup -s'
  alias clean-coursier='find $HOME/Library/Caches/Coursier/v1/http -maxdepth 1 -mindepth 1 -exec trash {} \; ; find $HOME/Library/Caches/Coursier/v1/https -maxdepth 1 -mindepth 1 -exec trash {} \;'
  alias clean-pip='find $HOME/Library/Caches/pip/http -maxdepth 1 -mindepth 1 -exec trash {} \;'
  alias clean-yarn='find $HOME/Library/Caches/Yarn -maxdepth 1 -mindepth 1 -exec trash {} \;'
  alias clean-docker-machne='docker-machine rm default'
  alias clean-minikube='minikube delete'
  alias clean-golang-cache-dev='du -sh $HOME/dev/go/pkg/mod/cache; trash $HOME/dev/go/pkg/mod/cache'
  alias clean-dev-workspace-node-modules='gfind $HOME/dev/workspace -maxdepth 2 -name node_modules -exec trash {} \;'
  alias clean-dev-project-node-modules='gfind $HOME/dev/project -maxdepth 2 -name node_modules -exec trash {} \;'
  alias clean-dev-myproject-node-modules='gfind $HOME/dev/myproject -maxdepth 2 -name node_modules -exec trash {} \;'
  alias clean-m2='du -sh $HOME/.m2/repository; trash $HOME/.m2/repository'
fi
