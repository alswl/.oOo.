# my zsh configurations, works for macOS / Linux / Cygwin
#
# https://github.com/alswl/.oOo.
#
# speed-up:
# time zsh -i -c exit
# zsh -xv


# interactive shells only. PATH -> .zprofile, exported env -> .zshenv


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
if [ -n "$SSH_CONNECTION" ]; then
  ZSH_THEME="bira"
fi


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
	bower colored-man-pages docker docker-compose fabric fnm gem git git-flow golang dotenv \
	gradle history history-substring-search httpie kubectl mvn npm nmap pip python redis-cli rsync sbt scala \
	screen ssh-agent sudo svn terraform tmux urltools uv \
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

# oh-my-zsh runs compinit itself; set the dump path before sourcing it
export ZSH_COMPDUMP=$ZSH/cache/.zcompdump-$HOST-$ZSH_VERSION
# skip compaudit security check on this single-user machine (saves ~30ms)
ZSH_DISABLE_COMPFIX="true"
# defer loading ssh keys until first ssh use (saves ~15ms)
zstyle :omz:plugins:ssh-agent lazy yes
source $ZSH/oh-my-zsh.sh

export HISTSIZE=10000000
export SAVEHIST=10000000
setopt EXTENDED_HISTORY

#export POWERLINE_RIGHT_B="none"
#export POWERLINE_HIDE_HOST_NAME="true"

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


# Sheel Preference }}}


# Dev Tools {{{

# export MACOSX_DEPLOYMENT_TARGET=12.4

## golang

alias loadgopathdev="export GOPATH=${HOME}/dev/go"
alias savegopathdevenv="echo 'export GOPATH=\$HOME/dev/go' >> .env"
# loadgoXXX aliases for each brew-installed go@X.Y (Apple Silicon)
for _go in 1.16 1.17 1.18 1.19 1.20 1.21 1.22 1.23 1.24 1.25; do
	[ -f /opt/homebrew/opt/go@$_go/bin/go ] && \
		alias loadgo${_go//./}="export PATH=\"/opt/homebrew/opt/go@$_go/bin:\$PATH\""
done
unset _go


# pyenv
[[ $(type pyenv) == function ]] && eval "$(pyenv init -)"
alias loadpyenv='eval "$(pyenv init -)"'


# nnn
# export NNN_OPENER=$HOME/.config/nnn/plugins/nuke


# virtualenvwrapper (lazy, load on demand)
alias loadvirtualenvwrapper="
[ -f /opt/homebrew/bin/python3 ] && export VIRTUALENVWRAPPER_PYTHON=/opt/homebrew/bin/python3;
[ -f /usr/bin/virtualenvwrapper.sh ] && source /usr/bin/virtualenvwrapper.sh;
[ -f /opt/homebrew/bin/virtualenvwrapper.sh ] && source /opt/homebrew/bin/virtualenvwrapper.sh;
[ -f /etc/bash_completion.d/virtualenvwrapper ] && source /etc/bash_completion.d/virtualenvwrapper;"

# node
# nvm
# NOTICE: nvm is slow, load yourself
alias loadnvm="[ -f ~/.nvm/nvm.sh ] && source ~/.nvm/nvm.sh;
[ -f /usr/share/nvm/init-nvm.sh ] && source /usr/share/nvm/init-nvm.sh;  # arch linux
[ -s /opt/homebrew/opt/nvm/nvm.sh ] && \. /opt/homebrew/opt/nvm/nvm.sh  # macos arm
autoload -U nvm;"

# fnm
alias loadfnm='eval $(fnm env);'

# rvm(deprecated)
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
[[ -s "$HOME/.sdkman/bin/sdkman-init.sh" ]] && source "$HOME/.sdkman/bin/sdkman-init.sh"
# gitlab
[[ -s $HOME/.gitlabrc ]] && source $HOME/.gitlabrc

# ansible
#[[ -s $HOME_LOCAL_PATH/ansible/hacking/env-setup ]] && source $HOME_LOCAL_PATH/ansible/hacking/env-setup -q

# google cloud sdk
alias loadgcloud="[ -f '/opt/homebrew/share/google-cloud-sdk/completion.zsh.inc' ] && source '/opt/homebrew/share/google-cloud-sdk/completion.zsh.inc';
[ -f '/opt/homebrew/share/google-cloud-sdk/path.zsh.inc' ] && source '/opt/homebrew/share/google-cloud-sdk/path.zsh.inc';

autoload -U gcloud;"

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

# tmux auto rename ssh
ssht() {
    if [[ -n "$TMUX" ]]; then
        local target="${@: -1}"
        _zsh_tmux_plugin_run rename-window "$target"
        command ssh "$@"
        local ret=$?
        _zsh_tmux_plugin_run set-window-option automatic-rename on >/dev/null
        return $ret
    else
        command ssh "$@"
    fi
}

# s2 is hack alias for ssh
alias s2=ssht

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
# export DOCKER_HOST="unix:///$HOME/.docker/run/docker.sock"

# autojump
[ -f /usr/share/autojump/autojump.sh ] && source /usr/share/autojump/autojump.sh

# zoxide (replaces z.lua): `j` jumps, `jj` is interactive (fzf)
(( $+commands[zoxide] )) && eval "$(zoxide init zsh)" && alias j=z && alias jj='zi'

# z.lua fallback when zoxide is unavailable
if (( ! $+commands[zoxide] )); then
  [ -f /usr/share/z.lua/z.lua ] && eval "$(lua /usr/share/z.lua/z.lua --init zsh enhanced)" && export _ZL_HYPHEN=1 && alias j=z && alias jj='z -I'
  [ -f /opt/homebrew/share/z.lua/z.lua ] && eval "$(lua /opt/homebrew/share/z.lua/z.lua --init zsh enhanced)" && export _ZL_HYPHEN=1 && alias j=z && alias jj='z -I'
fi

# ldd

# aliyun
if (( $+commands[aliyun] )); then
  autoload -Uz bashcompinit && bashcompinit
  complete -o nospace -C aliyun aliyun
fi

## gitstatus

# https://github.com/romkatv/gitstatus
# [ -d $HOME/local/gitstatus ] && source $HOME/local/gitstatus/gitstatus.prompt.zsh

# bun
[ -s "$HOME/.bun/_bun" ] && source "$HOME/.bun/_bun"

# claude-mem https://github.com/thedotmack/claude-mem
alias claude-mem='bun "$HOME/.claude/plugins/marketplaces/thedotmack/plugin/scripts/worker-service.cjs"'


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
	alias mute='osascript -e "set volume 0"'
	alias unmute='osascript -e "set volume 2"'
	# alias find='gfind'
	# alias date='gdate'
	# alias sed='gsed'
	# alias sort='gsort'
	# https://support.typora.io/Use-Typora-From-Shell-or-cmd/
	[ -f "/Applications/Typora.app/Contents/MacOS/Typora" ] && alias typora="open -a Typora"
fi

# common
alias c='cat'
alias mkdir='mkdir -p'
alias rmm='rm -rf'
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
alias s='sudo'
if [[ "$OSTYPE" == 'linux'* ]] || [[ "$OSTYPE" == 'cygwin'* ]]; then
	alias fd="fdfind"
fi
alias f='fd -I'
alias ff='fd --type f | fzf'
alias ffp='fd --type f | fzf --preview "less {}"'
alias fzp='fzf --preview "less {}"'
# functions (not aliases) so filenames with spaces survive the pipe
fzl() { local f; f=$(fd --type f | fzf) && less "$f"; }
fzv() { local f; f=$(fd --type f | fzf) && command "$EDITOR" -p "$f"; }
# pick a git-changed file (modified/staged/untracked) via fzf
_fzg_files() { { git -c core.quotePath=false diff --name-only HEAD; git -c core.quotePath=false ls-files --others --exclude-standard; } | fzf; }
fzgv() { local f; f=$(_fzg_files) && command "$EDITOR" -p "$f"; }
fzgvv() {
	local f; f=$(_fzg_files) || return
	[[ "$OSTYPE" == darwin* ]] && neovide --fork --reuse-instance --new-window "$f" || gvim -p "$f"
}
fzvv() {
	local f; f=$(fd --type f | fzf) || return
	[[ "$OSTYPE" == darwin* ]] && neovide --fork --reuse-instance --new-window "$f" || gvim -p "$f"
}
fzcd() { local d; d=$(fd --type d | fzf) && cd "$d"; }
fzo() { local f; f=$(fd --type f | fzf) && open "$f"; }
alias tarx='tar xzvf'
alias tarc='tar czvf'
alias e='echo'
alias vh='sudo "$EDITOR" /etc/hosts'
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
	alias gource-ext='gource --font-file '/System/Library/Fonts/STHeiti Medium.ttc' --user-image-dir ~/.config/my-gource/avatars --seconds-per-day 3 --auto-skip-seconds 1'
fi
alias ca=cursor-agent


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
# Use Vim inside GNU screen for compatibility. Outside screen, prefer
# Neovim when installed and fall back to Vim otherwise.
if [[ -z "$STY" ]] && (( $+commands[nvim] )); then
	export EDITOR=nvim
	export VISUAL=nvim
else
	export EDITOR=vim
	export VISUAL=vim
fi
alias v='command "$EDITOR" -p'
alias vim='command "$EDITOR" -p'
if [[ "$OSTYPE" == "darwin"*  ]]; then
	# alias vv='open -a MacVim'
	# open -a goneovim not works
	# alias vv='goneovim'
	alias vv='neovide --fork --reuse-instance --new-window'
	alias vvd='neovide --fork --reuse-instance --new-window -- -d'
elif [[ "$OSTYPE" == "linux"* ]] || [[ "$OSTYPE" == 'cygwin'* ]]; then
	alias vv='gvim -p'
fi
alias vd='command "$EDITOR" -d'
alias vdiff=vd
alias vdv='v +DiffviewOpen'
alias vvdv='vv +DiffviewOpen'
alias neovim-install-dep="cnpm install -g neovim && pip3 install --break-system-packages neovim"

# git
# alias g=git
# alias gc='git c'
# alias gci='git ci'
# alias gcv='git civ'
alias gcbr='git checkout -b'
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
if alias gdt &>/dev/null; then unalias gdt; fi
gdt() {
  git diff --no-ext-diff --color "$@" | delta
}
if alias gdtc &>/dev/null; then unalias gdtc; fi
gdtc() {
  git diff --no-ext-diff --color --cached "$@" | delta
}
alias gcls='git clone --depth 1'
alias gshallow='git pull --depth 1 && git gc --prune=all'
alias gdc='git diff --color=always'
alias gdcc='git diff --color=always --cached'
alias gdv='git difftool'
alias gdvc='git difftool --cached'
# override gbda of git plugin
alias gbda='git branch --no-color --merged | command grep -vE "^(\+|\*|\s*(master|develop|dev|EI[0-9_]+|sprint-[a-zA-Z0-9\-]+)\s*$)" | command xargs -n 1 git branch -d'
alias gchs='git-changes'
alias gwtn='git-worktree-new'
alias gbsu='git branch -u origin/$(git branch --show-current)'
alias git-shallow="git pull --depth 1 && git gc --prune=all"
alias git-unshallow="git fetch --unshallow"
alias git-omz-hide='git config --replace-all oh-my-zsh.hide-status 1 && git config --replace-all oh-my-zsh.hide-dirty 1'
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

# relink repo local/bin tools into ~/local/bin (logic + diff in local/bin/oOo-install-local-bin)
alias oOo-install-local-bin='repo="$(dirname "$(readlink "$HOME/.zshrc")")"; "$repo"/local/bin/oOo-install-local-bin'

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
	for RC in $HOME/.zshrc.etc.d/*.zshrc(N); do
		source $RC;
	done
fi
# Local setting }}}
