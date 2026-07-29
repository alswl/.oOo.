# login shells: build PATH here, after /etc/zprofile's path_helper, so our
# ordering survives. Env vars live in .zshenv.

# homebrew (Apple Silicon)
[ -f /opt/homebrew/bin/brew ] && eval $(/opt/homebrew/bin/brew shellenv)

# Added by Toolbox App
export PATH="$PATH:$HOME/Library/Application Support/JetBrains/Toolbox/scripts"


# PATH {{{

# keep PATH/FPATH entries unique (avoid duplicates on re-source)
typeset -U path PATH fpath FPATH

PATH=/opt/homebrew/bin:/opt/homebrew/sbin:/usr/local/bin:/usr/local/sbin:$PATH
PATH=$HOME/.jenv/bin:$PATH
PATH=$HOME/.local/bin:$PATH
PATH=$HOME/.luarocks/bin:$PATH
# PATH=$HOME/.virtualenvs/sys/bin:$PATH
PATH=$HOME/.krew/bin:$PATH
PATH=$HOME/.cargo/bin:$PATH

[ -d $HOME_LOCAL_BIN_PATH ] && PATH=$HOME_LOCAL_BIN_PATH:$PATH

FPATH=$HOME/.zsh_completion/:$FPATH
FPATH=$HOME/.zfunc/:$FPATH


if [[ -d $HOME_LOCAL_PATH ]]; then
	for p in `find $HOME_LOCAL_PATH -maxdepth 1 -type d -exec test -d {}/bin \; -print`; do
		PATH=$p/bin:$PATH
	done
fi
if [[ -d $HOME/.docker/bin ]]; then
    PATH=$HOME/.docker/bin:$PATH
fi

# mysql-client (Apple Silicon)
if [[ -d /opt/homebrew/opt/mysql-client/bin ]]; then
    PATH=/opt/homebrew/opt/mysql-client/bin:$PATH
fi
if [[ -d $HOME/.codeium/windsurf/bin ]]; then
    PATH="$HOME/.codeium/windsurf/bin:$PATH"
fi
if [[ -d $HOME/.utoo-proxy ]]; then
    PATH="$HOME/.utoo-proxy:$PATH"
fi
# golang (GOPATH exported in .zshenv)
PATH=$GOPATH/bin:$PATH
# kusion
if [[ -d $HOME/local/kusion/bin ]]; then
  export KUSION_SKIP_UPDATE_CHECK=true
  export KUSION_HOME="$HOME/local/kusion"
  export KUSION_PATH="$KUSION_HOME/bin"
  export PATH=$KUSION_HOME/kclvm/bin:$PATH
fi

if [[ -d /Applications/Obsidian.app/Contents/MacOS ]]; then
  PATH="$PATH:/Applications/Obsidian.app/Contents/MacOS"
fi


# bun
export BUN_INSTALL="$HOME/.bun"
PATH="$BUN_INSTALL/bin:$PATH"

export PATH
# PATH }}}
