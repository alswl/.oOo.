#
# ~/.bashrc
#

# If not running interactively, don't do anything
[[ $- != *i* ]] && return

PS1='[\u@\h \W]\$ '

export PATH=$PATH/opt/java/bin:
source /usr/bin/virtualenvwrapper.sh

alias ls='ls --color=auto'
alias ll='ls -l'
alias la='ls -a'
alias mkdir='mkdir -p'
alias ..='cd ..'

# xintong alias
alias cdxt='pushd /home/alswl/work/xintong/workspace/MYB_WENDA/myb/myb'
alias xt-run='/home/alswl/work/xintong/workspace/MYB_WENDA/myb/run_server.sh'

# 常用alias
alias ssh-log4d='ssh alswl@log4d.com'
alias ssh-dddspace='ssh alswl@dddspace.com'
alias ssh-route='ssh root@192.168.1.254'
alias ssh-myb='ssh myblogin@221.130.6.212 -p 2122'
alias ssh-proxy='ssh alswl@log4d.com -ND 7070 &'

PATH=$PATH:$HOME/.rvm/bin # Add RVM to PATH for scripting

export EDITOR=vim
