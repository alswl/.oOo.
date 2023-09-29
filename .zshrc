# my zsh configurations, works for macOS / Linux / Cygwin
#
# https://github.com/alswl/.oOo.
#
# speed-up:
# time zsh -i -c exit
# zsh -xv


# PATH {{{

PATH=/opt/homebrew/bin:/opt/homebrew/sbin:/usr/local/bin:/usr/local/sbin:$PATH
PATH=$HOME/.jenv/bin:$PATH
PATH=$HOME/.luarocks/bin:$PATH
# PATH=$HOME/.virtualenvs/sys/bin:$PATH
PATH=$HOME/.krew/bin:$PATH:

HOME_LOCAL_PATH=$HOME/local
HOME_LOCAL_BIN_PATH=$HOME_LOCAL_PATH/bin
[ -d $HOME_LOCAL_BIN_PATH ] && PATH=$HOME_LOCAL_BIN_PATH:$PATH

FPATH=$HOME/.zsh_completion/:$FPATH

# virtual wrapper
[ -f /opt/homebrew/bin/python3 ] && export VIRTUALENVWRAPPER_PYTHON=/opt/homebrew/bin/python3  # for mac apple silicon
[ -f /usr/bin/virtualenvwrapper.sh ] && source /usr/bin/virtualenvwrapper.sh # arch
[ -f /opt/homebrew/bin/virtualenvwrapper.sh ] && source /opt/homebrew/bin/virtualenvwrapper.sh # arch
[ -f /etc/bash_completion.d/virtualenvwrapper ] && source /etc/bash_completion.d/virtualenvwrapper # ubuntu
[ -f /usr/local/opt/python3/libexec/bin/python ] && export VIRTUALENVWRAPPER_PYTHON=/usr/local/opt/python3/libexec/bin/python  # for mac


if [[ -d $HOME_LOCAL_PATH ]]; then
	for p in `find $HOME_LOCAL_PATH -maxdepth 1 -type d -exec test -d {}/bin \; -print`; do
		PATH=$p/bin:$PATH
	done
fi
if [[ -d $HOME/.docker/bin ]]; then
    PATH=$HOME/.docker/bin:$PATH
fi
if [[ -d "/Applications/IntelliJ IDEA.app/Contents/MacOS" ]]; then
    PATH="/Applications/IntelliJ IDEA.app/Contents/MacOS":$PATH
fi
export PATH
# PATH }}}


# ZSH Config {{{

# Path to your oh-my-zsh configuration.
ZSH=$HOME/.oh-my-zsh

# Set name of the theme to load.
# Look in ~/.oh-my-zsh/themes/
# Optionally, if you set this to "random", it'll load a random theme each
# time that oh-my-zsh is loaded.
# ZSH_THEME="robbyrussell"
[[ "$OSTYPE" == "darwin"* ]] && ZSH_THEME="robbyrussell"
[[ "$OSTYPE" == "linux"* ]] && ZSH_THEME="bira"


# using local theme
[ -f $HOME/.zshrc.etc.d/_local_theme.zshrc ] && source $HOME/.zshrc.etc.d/_local_theme.zshrc


# Set to this to use case-sensitive completion
CASE_SENSITIVE="true"

# Comment this out to disable weekly auto-update checks
# DISABLE_AUTO_UPDATE="true"

# Uncomment following line if you want to disable colors in ls
# DISABLE_LS_COLORS="true"

# Uncomment following line if you want to disable autosetting terminal title.
# DISABLE_AUTO_TITLE="true"

# Uncomment following line if you want red dots to be displayed while waiting for completion
COMPLETION_WAITING_DOTS="true"

# Which plugins would you like to load? (plugins can be found in ~/.oh-my-zsh/plugins/*)
# Custom plugins may be added to ~/.oh-my-zsh/custom/plugins/
# Example format: plugins=(rails git textmate ruby lighthouse)
# NOTICE: rbenv is slow
# NOTICE: nvm is slow
plugins=( \
	bower colored-man-pages compleat docker docker-compose fabric gem git git-flow golang golang dotenv \
	gradle history history-substring-search httpie kubectl mvn npm nmap pip python redis-cli rsync sbt scala \
	screen ssh-agent sudo svn terraform tmux urltools ripgrep virtualenvwrapper \
	)
# historical used plugins
# vagrant
[ -f /etc/redhat-release ] && plugins+=( yum )
[ -f /etc/debian_version ] && plugins+=( debian ubuntu )
[ -f /etc/arch-release ] && plugins+=( archlinux )
# disable brew in plugin, it will put brew path in front of ~/local/bin
[[ "$OSTYPE" == "darwin"* ]] && plugins+=( macos xcode )

# disable zsh substitution/autocomplete with URL and backslashes
# https://stackoverflow.com/questions/25614613/how-to-disable-zsh-substitution-autocomplete-with-url-and-backslashes/
DISABLE_MAGIC_FUNCTIONS=true

source $ZSH/oh-my-zsh.sh

export HISTSIZE=10000000
export SAVEHIST=10000000
setopt EXTENDED_HISTORY

#export POWERLINE_RIGHT_B="none"
#export POWERLINE_HIDE_HOST_NAME="true"

autoload -U compinit; compinit

# ZSH Config }}}


# Shell Preference {{{

# use bash style for in
# setopt sh_word_split

# key binding
bindkey '\e.' insert-last-word

#bindkey "\e[1~" beginning-of-line # Home
#bindkey "\e[4~" end-of-line # End
#bindkey "\e[5~" beginning-of-history # PageUp
#bindkey "\e[6~" end-of-history # PageDown
#bindkey "\e[2~" quoted-insert # Ins
#bindkey "\e[3~" delete-char # Del
#bindkey "\e[5C" forward-word
#bindkey "\eOc" emacs-forward-word
#bindkey "\e[5D" backward-word
#bindkey "\eOd" emacs-backward-word
#bindkey "\e\e[C" forward-word
#bindkey "\e\e[D" backward-word
#bindkey "\e[Z" reverse-menu-complete # Shift+Tab
# for rxvt
#bindkey "\e[7~" beginning-of-line # Home
#bindkey "\e[8~" end-of-line # End
# for non RH/Debian xterm, can't hurt for RH/Debian xterm
#bindkey "\eOH" beginning-of-line
#bindkey "\eOF" end-of-line
# for freebsd console
#bindkey "\e[H" beginning-of-line
#bindkey "\e[F" end-of-line
bindkey \^U backward-kill-line

bindkey "^x^e" edit-command-line

bindkey "[16~" delete-char # F5 pass to tmux
bindkey "[17~" delete-char # F6 pass to tmux
bindkey "[18~" delete-char # F7 pass to tmux
bindkey "[19~" delete-char # F8 pass to tmux
bindkey "^[[20~" delete-char # F9 pass to tmux
bindkey "^[[21~" delete-char # F10 pass to tmux
bindkey "^[[23~" delete-char # F11 pass to tmux
bindkey "[24~" delete-char # F12 pass to tmux

bindkey -M emacs '^P' history-substring-search-up
bindkey -M emacs '^N' history-substring-search-down
bindkey -M vicmd 'k' history-substring-search-up
bindkey -M vicmd 'j' history-substring-search-down


#color
LS_COLORS='rs=0:di=01;34:ln=01;36:mh=00:pi=40;33:so=01;35:do=01;35:bd=40;33;01:cd=40;33;01:or=40;31;01:su=37;41:sg=30;43:ca=30;41:tw=30;42:ow=34;42:st=37;44:ex=01;32:*.tar=01;31:*.tgz=01;31:*.arj=01;31:*.taz=01;31:*.lzh=01;31:*.lzma=01;31:*.tlz=01;31:*.txz=01;31:*.zip=01;31:*.z=01;31:*.Z=01;31:*.dz=01;31:*.gz=01;31:*.lz=01;31:*.xz=01;31:*.bz2=01;31:*.bz=01;31:*.tbz=01;31:*.tbz2=01;31:*.tz=01;31:*.deb=01;31:*.rpm=01;31:*.jar=01;31:*.war=01;31:*.ear=01;31:*.sar=01;31:*.rar=01;31:*.ace=01;31:*.zoo=01;31:*.cpio=01;31:*.7z=01;31:*.rz=01;31:*.jpg=01;35:*.jpeg=01;35:*.gif=01;35:*.bmp=01;35:*.pbm=01;35:*.pgm=01;35:*.ppm=01;35:*.tga=01;35:*.xbm=01;35:*.xpm=01;35:*.tif=01;35:*.tiff=01;35:*.png=01;35:*.svg=01;35:*.svgz=01;35:*.mng=01;35:*.pcx=01;35:*.mov=01;35:*.mpg=01;35:*.mpeg=01;35:*.m2v=01;35:*.mkv=01;35:*.webm=01;35:*.ogm=01;35:*.mp4=01;35:*.m4v=01;35:*.mp4v=01;35:*.vob=01;35:*.qt=01;35:*.nuv=01;35:*.wmv=01;35:*.asf=01;35:*.rm=01;35:*.rmvb=01;35:*.flc=01;35:*.avi=01;35:*.fli=01;35:*.flv=01;35:*.gl=01;35:*.dl=01;35:*.xcf=01;35:*.xwd=01;35:*.yuv=01;35:*.cgm=01;35:*.emf=01;35:*.axv=01;35:*.anx=01;35:*.ogv=01;35:*.ogx=01;35:*.aac=00;36:*.au=00;36:*.flac=00;36:*.mid=00;36:*.midi=00;36:*.mka=00;36:*.mp3=00;36:*.mpc=00;36:*.ogg=00;36:*.ra=00;36:*.wav=00;36:*.axa=00;36:*.oga=00;36:*.spx=00;36:*.xspf=00;36:';
export LS_COLORS
export LESSCHARSET=utf-8

# LANG
export LC_COLLATE="en_US.UTF-8"
export LC_CTYPE="en_US.UTF-8"
export LC_MESSAGES="en_US.UTF-8"
export LC_MONETARY="en_US.UTF-8"
export LC_NUMERIC="en_US.UTF-8"
export LC_TIME="en_US.UTF-8"
export LC_ALL="en_US.UTF-8"
#LC_COLLATE="C"
#LC_CTYPE="C"
#LC_MESSAGES="C"
#LC_MONETARY="C"
#LC_NUMERIC="C"
#LC_TIME="C"
#LC_ALL="C"

#LANG="zh_CN.UTF-8"
export LANG="en_US.UTF-8"
export LANGUAGE="en_US.UTF--8"
export SUPPORTED="zh_CN.UTF-8:zh_CN.GB18030:zh_CN.GB2312:zh_CN"
#LANGUAGE="zh_CN.UTF-8:zh_CN.GB18030:zh_CN.GB2312:zh_CN"
#SUPPORTED="zh_CN.UTF-8:zh_CN:zh"
#SUPPORTED="zh_CN.UTF-8"



# Sheel Preference }}}


# Dev Tools {{{

# export EDITOR=vim
export EDITOR=nvim
export RLWRAP_EDITOR="vim '+call cursor(%L,%C)'"
# export MACOSX_DEPLOYMENT_TARGET=12.4

## golang

alias loadgopathdev="export GOPATH=${HOME}/dev/go"
alias savegopathdevenv="echo 'export GOPATH=\$HOME/dev/go' >> .env"
[ -f /usr/local/opt/go@1.12/bin/go ] && alias loadgo112="export PATH=\"/usr/local/opt/go@1.12/bin:${PATH}\""
[ -f /usr/local/opt/go@1.12/bin/go ] && alias savego112env="echo 'export PATH=\"/usr/local/opt/go@1.12/bin:\$PATH\"' >> .env"
[ -f /usr/local/opt/go@1.13/bin/go ] && alias loadgo113="export PATH=\"/usr/local/opt/go@1.13/bin:$PATH\""
[ -f /usr/local/opt/go@1.13/bin/go ] && alias savego113env="echo 'export PATH=\"/usr/local/opt/go@1.13/bin:\$PATH\"' >> .env"
[ -f /usr/local/opt/go@1.15/bin/go ] && alias loadgo115="export PATH=\"/usr/local/opt/go@1.15/bin:$PATH\""
[ -f /usr/local/opt/go@1.16/bin/go ] && alias loadgo116="export PATH=\"/usr/local/opt/go@1.16/bin:$PATH\""
[ -f /usr/local/opt/go@1.17/bin/go ] && alias loadgo117="export PATH=\"/usr/local/opt/go@1.17/bin:$PATH\""
[ -f /usr/local/opt/go@1.18/bin/go ] && alias loadgo118="export PATH=\"/usr/local/opt/go@1.18/bin:$PATH\""
[ -f /usr/local/opt/go@1.19/bin/go ] && alias loadgo119="export PATH=\"/usr/local/opt/go@1.19/bin:$PATH\""
[ -f /usr/local/opt/go@1.20/bin/go ] && alias loadgo120="export PATH=\"/usr/local/opt/go@1.20/bin:$PATH\""

[ -f /opt/homebrew/opt/go@1.16/bin/go ] && alias loadgo116="export PATH=\"/opt/homebrew/opt/go@1.16/bin:$PATH\""
[ -f /opt/homebrew/opt/go@1.17/bin/go ] && alias loadgo117="export PATH=\"/opt/homebrew/opt/go@1.17/bin:$PATH\""
[ -f /opt/homebrew/opt/go@1.18/bin/go ] && alias loadgo118="export PATH=\"/opt/homebrew/opt/go@1.18/bin:$PATH\""
[ -f /opt/homebrew/opt/go@1.19/bin/go ] && alias loadgo119="export PATH=\"/opt/homebrew/opt/go@1.19/bin:$PATH\""
[ -f /opt/homebrew/opt/go@1.20/bin/go ] && alias loadgo120="export PATH=\"/opt/homebrew/opt/go@1.20/bin:$PATH\""


# golangci-lint not works with golang 1.21
[ -f /usr/local/opt/go@1.20/bin/go ] && loadgo120
[ -f /opt/homebrew/opt/go@1.20/bin/go ] && loadgo120

# pyenv
[[ $(type pyenv) == function ]] && eval "$(pyenv init -)"
alias loadpyenv='eval "$(pyenv init -)"'


# nnn
# export NNN_OPENER=$HOME/.config/nnn/plugins/nuke
export NNN_TRASH=1 # trash (needs trash-cli aka trash-put) instead of delete
export NNN_COLORS="2136" # use a different color for each context


# nvm
# NOTICE: nvm is slow, load yourself
alias loadnvm="[ -f ~/.nvm/nvm.sh ] && source ~/.nvm/nvm.sh;
[ -f /usr/local/opt/nvm/nvm.sh ] && source /usr/local/opt/nvm/nvm.sh;  # ubuntu linux
[ -f /usr/share/nvm/init-nvm.sh ] && source /usr/share/nvm/init-nvm.sh;  # arch linux
autoload -U nvm;"

# rvm
# NOTICE: rvm is slow, load yourself
alias loadrvm="[[ -s $HOME/.rvm/scripts/rvm ]] && source $HOME/.rvm/scripts/rvm; autoload -U rvm;"

# rbenv
# NOTICE: rbenv is slow, load yourself
alias loadrbenv="autoload -U rbenv;"

# mercurial
# NOTICE: mercurial summary is slow, load yourself
alias loadmercurial="autoload -U mercurial;"

# arc
[[ -s $HOME_LOCAL_PATH/arcanist/resources/shell/bash-completion ]] && source $HOME_LOCAL_PATH/arcanist/resources/shell/bash-completion
# sdkman
export SDKMAN_DIR="$HOME/.sdkman"
[[ -s "$HOME/.sdkman/bin/sdkman-init.sh" ]] && source "$HOME/.sdkman/bin/sdkman-init.sh"
# gitlab
[[ -s $HOME/.gitlabrc ]] && source $HOME/.gitlabrc

# ansible
#[[ -s $HOME_LOCAL_PATH/ansible/hacking/env-setup ]] && source $HOME_LOCAL_PATH/ansible/hacking/env-setup -q

# google cloud sdk
[ -f '/usr/local/Caskroom/google-cloud-sdk/latest/google-cloud-sdk/path.zsh.inc' ] && source '/usr/local/Caskroom/google-cloud-sdk/latest/google-cloud-sdk/path.zsh.inc'
[ -f '/usr/local/Caskroom/google-cloud-sdk/latest/google-cloud-sdk/completion.zsh.inc' ] && source '/usr/local/Caskroom/google-cloud-sdk/latest/google-cloud-sdk/completion.zsh.inc'

# source-highlight
[[ -s /usr/share/source-highlight/src-hilite-lesspipe.sh ]] && export LESSOPEN="| /usr/share/source-highlight/src-hilite-lesspipe.sh %s"
[[ -s /usr/bin/src-hilite-lesspipe.sh ]] && export LESSOPEN="| /usr/bin/src-hilite-lesspipe.sh %s"
[[ -s /usr/local/bin/src-hilite-lesspipe.sh ]] && export LESSOPEN="| /usr/local/bin/src-hilite-lesspipe.sh %s"
[[ -s /opt/homebrew/bin/src-hilite-lesspipe.sh ]] && export LESSOPEN="| /opt/homebrew/bin/src-hilite-lesspipe.sh %s"

#. ~/dev/project/shell/powerline/powerline/bindings/zsh/powerline.zsh

# jenv
# TODO jenv rehash is slow
# eval "$(jenv init -)"
# java env, use jenv alternative
if [[ "$OSTYPE" == "darwin"* ]]; then
	#export JAVA_HOME=`/usr/libexec/java_home -v 1.8.0_202` # oracle jdk
	#export JAVA_HOME=`/usr/libexec/java_home -v 1.8.0_212` # adopt open jdk
	#export JAVA_HOME=`/usr/libexec/java_home -v 1.8.0_282` # openjdk@8
	export JAVA_HOME=`/usr/libexec/java_home -v 1.8` # adoptopenjdk-8.jdk
fi
alias loadjenv='eval "$(jenv init -)";'

# go
export GOPATH=$HOME/dev/go
export PATH=$GOPATH/bin:$PATH
export GO111MODULE=on
export GOPROXY="https://goproxy.cn,https://mirrors.aliyun.com/goproxy,direct"
export GOPRIVATE="github.com/alswl/go-*"

# homebrew
if [[ "$OSTYPE" == "darwin"* ]]; then
  export HOMEBREW_NO_AUTO_UPDATE=1
  export HOMEBREW_NO_ANALYTICS=1
  # https://github.com/Homebrew/brew/issues/13794
  export HOMEBREW_NO_INSTALL_FROM_API=1
  # tuna
  export HOMEBREW_BOTTLE_DOMAIN=https://mirrors.tuna.tsinghua.edu.cn/homebrew-bottles
  # ustc
  # export HOMEBREW_BOTTLE_DOMAIN=https://mirrors.ustc.edu.cn/homebrew-bottles
  # sjtu
  # export HOMEBREW_BOTTLE_DOMAIN=https://mirrors.sjtug.sjtu.edu.cn/homebrew-bottles/bottles

  # HB_CNF_HANDLER="$(brew --repository)/Library/Taps/homebrew/homebrew-command-not-found/handler.sh"
  # if [ -f "$HB_CNF_HANDLER" ]; then
    # source "$HB_CNF_HANDLER";
  # fi
fi

# ansible
export ANSIBLE_NOCOWS=1

# android
export ANDROID_HOME=/usr/local/opt/android-sdk

# tmux

ssh() {
    if [ -n "${TMUX}" ]; then
        tmux rename-window "$(echo $* | awk '{print $1}')"
        command ssh "$@"
        tmux set-window-option automatic-rename "on" 1>/dev/null
    else
        command ssh "$@"
    fi
}

export FZF_DEFAULT_COMMAND='fd --type f --hidden --follow --exclude .git --exclude "*.png" --exclude "*.generated.*"'

alias lima-docker-install="
lima sudo apt -y install docker.io
lima sudo usermod -aG docker $USER"

alias lima-docker-install-lima="
lima sudo apt -y install docker.io
lima sudo usermod -aG docker lima"

# paste below configs to ~/.ssh/config
# Host 127.0.0.1
# Port 60022
# User lima
alias lima-docker-mapping="
sudo rm -f /var/run/docker.sock -f $HOME/.lima/default/docker.sock
/usr/bin/ssh -p 60022 -i $HOME/.lima/_config/user -o NoHostAuthenticationForLocalhost=yes -L $HOME/.lima/default/docker.sock:/var/run/docker.sock -N -f 127.0.0.1
sudo ln -s $HOME/.lima/default/docker.sock /var/run/docker.sock"

# Podman
# TODO
# export DOCKER_HOST="unix://$HOME/.local/share/containers/podman/machine/podman-machine-default/podman.sock"

# Docker Desktop
export DOCKER_HOST="unix:///$HOME/.docker/run/docker.sock"


# autojump
[ -f /usr/share/autojump/autojump.sh ] && source /usr/share/autojump/autojump.sh

# z.lua
[ -f /usr/local/share/z.lua/z.lua ] && eval "$(lua /usr/local/share/z.lua/z.lua --init zsh)" && export _ZL_HYPHEN=1 && alias j=z && alias ji='z -I'
[ -f /usr/share/z.lua/z.lua ] && eval "$(lua /usr/share/z.lua/z.lua --init zsh)" && export _ZL_HYPHEN=1 && alias j=z && alias ji='z -I'
[ -f /opt/homebrew/share/z.lua/z.lua ] && eval "$(lua /opt/homebrew/share/z.lua/z.lua --init zsh)" && export _ZL_HYPHEN=1 && alias j=z && alias ji='z -I'

# ldd

# aliyun
complete -o nospace -F /usr/local/bin/aliyun aliyun

## Dev Tools }}}
if [[ "$OSTYPE" == "darwin"* ]]; then
	alias ldd='otool -L'
fi



# Alias {{{

# macOS specific
if [[ "$OSTYPE" == "darwin"* ]]; then
	alias b=brew
	alias simulator='open /Applications/Xcode.app/Contents/Developer/Platforms/iPhoneSimulator.platform/Developer/Applications/iPhone\ Simulator.app'
	alias readlink=greadlink
	[ -f /usr/local/bin/screen ] && alias screen='TERM=xterm-256color /usr/local/bin/screen'
	[ -f /opt/homebrew/bin/screen ] && alias screen='TERM=xterm-256color /opt/homebrew/bin/screen'
	alias mute='osascript -e "set volume 0"'
	alias unmute='osascript -e "set volume 2"'
	# alias find='gfind'
	# alias date='gdate'
	# alias sed='gsed'
	# alias sort='gsort'
	# https://support.typora.io/Use-Typora-From-Shell-or-cmd/
	[ -f "/Applications/Typora.app/Contents/MacOS/Typora" ] && alias typora="/Applications/Typora.app/Contents/MacOS/Typora"
fi

# common
alias c='cat'
alias mkdir='mkdir -p'
alias rmm='rm -R'
alias ..='cd ..'
alias mem='free -m'
alias less='less -i'
alias rv='rview'
alias dstat='dstat -cdlmnpsy'
if [[ "$OSTYPE" == "darwin"* ]]; then
	alias ggrep='ggrep --exclude-dir=".git" --exclude-dir=".svn" --color=auto'
elif [[ "$OSTYPE" == 'linux'* ]] || [[ "$OSTYPE" == 'cygwin'* ]]; then
	alias grep='grep --exclude-dir=".git" --exclude-dir=".svn" --color=auto'
fi
alias ag='ag --pager "less -R"'
alias aga='ag -a --pager "less -R"'
alias agl='ag -l'
alias tmux='tmux -2'
alias dk=docker
alias ldk=lazydocker
alias le=less
alias psg='ps -ef | grep '
# alias ipy=$HOME/.virtualenvs/3/bin/ipython
alias py='python'
alias jy='jython'
alias ksh='killall ssh'
alias screen='TERM=xterm-256color screen'
alias s='sudo'
alias f='fd -I'
alias ff='fd --type f | fzf'
alias ffp='fd --type f | fz --preview "less {}"'
alias fzp='fzf --preview "less {}"'
alias fzl='less $(fd --type f | fzf)'
alias fzv='v $(fd --type f | fzf)'
alias fzvv='vv $(fd --type f | fzf)'
alias tarx='tar xzvf'
alias tarc='tar czvf'
alias e='echo'
alias vh='sudo nvim /etc/hosts'
alias fff='fuck'
alias wo='workon'
alias ta='tmux attach -t'
alias k='kubectl'
alias k9='kill -9 '
alias nnn='VISUAL=less nnn -c -d'
alias n='VISUAL=less nnn -c -d'
alias po=popd
alias girl='man'
alias p2a='pbpaste > /tmp/a.html && open /tmp/a.html'
alias p2v='pbpaste | vi -'
alias ssh-keygen-ed25519='ssh-keygen -t ed25519'
if [[ "$OSTYPE" == "darwin"* ]]; then
	alias gource='gource --font-file "/System/Library/Fonts/PingFang.ttc"'
fi


# ls
if [[ "$OSTYPE" == "darwin"* ]]; then
	alias ls='ls -Gv'
	alias ll='gls --color=auto -l'
	alias llh='gls --color=auto -lh'
	alias la='gls --color=auto -a'
elif [[ "$OSTYPE" == 'linux'* ]] || [[ "$OSTYPE" == 'cygwin'* ]]; then
	alias ls="ls --color=auto"
	alias ll='ls -l'
	alias llh='ls -lh'
	alias la='ls -a'
fi
# vim
alias mk=mkdir
# alias v='vim -p'
alias v='nvim -p'
if [[ "$OSTYPE" == "darwin"*  ]]; then
	# alias vv='open -a MacVim'
	# open -a goneovim not works
	# alias vv='goneovim'
	alias vv='vimr'
	alias vvd='vimr --nvim -d'
elif [[ "$OSTYPE" == "linux"* ]] || [[ "$OSTYPE" == 'cygwin'* ]]; then
	alias vv='gvim -p'
fi
alias vd='nvim -d'
alias vdiff=vd
alias neovim-install-dep="cnpm install -g neovim && pip3 install neovim"

# git
# alias g=git
# alias gc='git c'
# alias gci='git ci'
# alias gcv='git civ'
alias gcor='git checkoutr'
alias gcbr='git checkoutr -b'
alias gcota="git checkoutr $TARGET"
alias gdn='git diff --no-ext-diff'
#alias gpl='git pl'
#alias gps='git ps'
#alias gspl='git spl'
#alias gsps='git sps'
#alias gf='git f'
alias gs='git status'
alias gdf='git diff --no-ext-diff --color | diff-so-fancy | less'
alias gfuck='git reset --hard ORIG_HEAD && git clean -fd'
alias gmnf='git merge --no-ff'
alias gmod='git merge origin/develop'
alias gn='git number --column'
alias gnst='git number status'
alias gdt='git difftool'
alias gcls='git clone --depth 1'
alias gshallow='git pull --depth 1 && git gc --prune=all'
alias gdc='git diff --color=always'
alias gdcc='git diff --color=always --cached'
alias gdtc='git difftool --cached'
# override gbda of git plugin
alias gbda='git branch --no-color --merged | command grep -vE "^(\+|\*|\s*(master|develop|dev|EI[0-9_]+|sprint-[a-zA-Z0-9\-]+)\s*$)" | command xargs -n 1 git branch -d'
alias git-shallow="git pull --depth 1 && git gc --prune=all"
alias git-unshallow="git fetch --unshallow"
# `git co` show locals, https://gist.github.com/mmrko/b3ec6da9bea172cdb6bd83bdf95ee817?permalink_comment_id=3645021#gistcomment-3645021
export GIT_COMPLETION_CHECKOUT_NO_GUESS=1
alias lg="lazygit"

# maven
alias m=mvn
alias mc='mvn clean'
alias mcc='mvn clean compile'
alias mcp='mvn clean package'

# kubectl
# enable kubectl plugin first
alias kex='keti'
alias kgpyaml='kgp -oyaml'
alias kgnowide='kgno -owide'
alias kgnoyaml='kgno -oyaml'
alias kgdyaml='kgd -oyaml'
alias kgsa='k get sa'

# markdown utils commands
alias pmh=paste-md-to-html
alias pmr=paste-md-to-rtf
alias prh=paste-rtf-to-html
alias prm=paste-rtf-to-md
alias phm=paste-html-to-md
alias phr=paste-html-to-rtf
alias pmhc=paste-md-to-html-copy
alias pmrc=paste-md-to-rtf-copy
alias prhc=paste-rtf-to-html-copy
alias prmc=paste-rtf-to-md-copy
alias phmc=paste-html-to-md-copy
alias phrc=paste-html-to-rtf-copy

# shortcut command

alias sshg='luit -encoding gbk ssh'
alias iftop-nali-5s='iftop -nt -s 5 | nali'
alias myip="myip-dig"
# not works any more
# alias myip-cip-gd='curl -sL http://ip.cip.cc/'
alias myip-dig="dig +short myip.opendns.com @resolver1.opendns.com"
alias myip-ipip="curl -s https://myip.ipip.net | awk -F '：' '{print \$2}' | awk '{print \$1}'"
alias myip-ip-me-usa="curl -sL https://ip.me"
alias myip-ifconfig-gcs="curl -sL http://ifconfig.me"
alias myip-ipinfo="curl -sL https://ipinfo.io/ip"
alias myip-ipecho="curl -sL http://ipecho.net/plain"
alias myip-ip-sb="curl -s http://ip.sb"
alias myip-ip-sb-hk="curl -sL http://ip.sb"
alias random-sentences='curl -sL http://metaphorpsum.com/sentences/1'
alias json-format-clipboard='pbpaste | jq --raw-output -M | pbcopy'
alias cookies-from-editthiscookie="pbpaste | jq '.[] | (.name + \"=\" + .value+\"; \")' -j"
alias conns='lsof -PiTCP -n'
alias conns-nali='lsof -PiTCP -n | nali'
alias conns-estab-nali='lsof -PiTCP -n -sTCP:ESTABLISHED | nali'
alias conns-estab-wan-nali='lsof -PiTCP -n -sTCP:ESTABLISHED | grep -v "127.0.0.1.*->127.0.0.1" | nali'
alias rmdirempty='find . -maxdepth 1 -mindepth 1 -type d -empty -exec rmdir {} \;'
alias fuck-maven-force-update-release-jar="fd --type d common-service-facade $HOME/.m2/repository/ --exec trash {} \;"
alias gen-gitignore-go='curl -s "https://www.toptal.com/developers/gitignore/api/jetbrains,vim,intellij+all,go"'
alias gen-gitignore-java='curl -s "https://www.toptal.com/developers/gitignore/api/jetbrains,vim,intellij+all,java"'
alias gen-gitignore-python='curl -s "https://www.toptal.com/developers/gitignore/api/jetbrains,vim,intellij+all,python"'
alias gen-gitignore-node='curl -s "https://www.toptal.com/developers/gitignore/api/jetbrains,vim,intellij+all,visualstudiocode,node" > .gitignore'
alias gen-gitignore-common='curl -s "https://www.toptal.com/developers/gitignore/api/jetbrains,vim,intellij+all,visualstudiocode" > .gitignore'
alias daterfc3339='gdate --rfc-3339=seconds | sed "s/ /T/"'
alias datets='date +%s'
alias datenow='date "+%Y-%m-%d %H:%M:%S"'
alias app-identifier='/usr/libexec/PlistBuddy -c "Print CFBundleIdentifier"'
alias ac=antcode

# mssql cli interface
alias rlmssql='rlwrap -n -i -a -c -S "mssql> " -f ~/local/etc/mssql_bindings.txt mssql'  # https://github.com/hasankhan/sql-cli
alias rlscheme='rlwrap -i -r -c -f ~/local/etc/mit_scheme_bindings.txt scheme'
alias rllua='rlwrap -i -r -c -a lua'

# Hash Alias
#hash -d WWW="/srv/http/" # use http instead
#hash -d ib="$HOME/Desktop/md/inbox"

# global alias

alias -g L='| less'
alias -g G='| grep --color=auto'
#alias -g H='| head'
alias -g J='| jq -C '
alias -g W='| wc -l'
alias -g V='| v -'
alias -g VJ='| v - "+set ft=json"'
alias -g VY='| v - "+set ft=yaml"'
alias -g VM='| v - "+set ft=markdown"'
if [[ "$OSTYPE" == 'linux'* ]]; then
	alias pbcopy='xclip -selection clipboard'
	alias pbpaste='xclip -selection clipboard -o'
	alias open='mimeopen'
fi
alias -g C='| pbcopy'
alias -g P='pbpaste'
alias -g H='http_proxy=http://127.0.0.1:1235 https_proxy=http://127.0.0.1:1235'
alias -g GP='GIT_PROXY_COMMAND=~/local/bin/socks5proxywrapper; GIT_SSH=~/local/bin/soks5proxyssh'
alias -g TOA=' > /tmp/a.html && open /tmp/a.html'
alias -g SUS='| sort | uniq -c | sort -gr'


# Alias }}}


# Local setting {{{

if [[ -d $HOME/.zshrc.etc.d/ ]]; then
	for RC in `ls $HOME/.zshrc.etc.d/*.zshrc`; do
		source $RC;
	done
fi
# Local setting }}}
