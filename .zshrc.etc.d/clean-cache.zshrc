if [[ "$OSTYPE" == "darwin"* ]]; then
  alias clean-homebrew='trash $HOM/Library/Caches/Homebrew/downloads/*; brew clean -s'
  alias clean-alilang='trash $HOME/Library/Logs/Alilang-nodejs/alilang.*20*.log'
  alias clean-coursier='trash $HOME/Library/Caches/Coursier/v1/http*'
  alias clean-pip='trash $HOME/Library/Caches/pip/http'
  alias clean-docker-machne='docker-machine rm default'
  alias clean-minikube='minikube delete'
fi
