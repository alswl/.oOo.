if [[ "$OSTYPE" == "darwin"* ]]; then
  alias clean-homebrew='find $HOME/Library/Caches/Homebrew/downloads/ -maxdepth 1 -mindepth 1 -exec trash {} \; ; brew cleanup -s'
  alias clean-coursier='find $HOME/Library/Caches/Coursier/v1/http -maxdepth 1 -mindepth 1 -exec trash {} \; ; find $HOME/Library/Caches/Coursier/v1/https -maxdepth 1 -mindepth 1 -exec trash {} \;'
  alias clean-pip='find $HOME/Library/Caches/pip/http -maxdepth 1 -mindepth 1 -exec trash {} \;'
  alias clean-docker-machne='docker-machine rm default'
  alias clean-minikube='minikube delete'
fi
