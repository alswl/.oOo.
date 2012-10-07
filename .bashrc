#
# ~/.bashrc
#

# If not running interactively, don't do anything
[[ $- != *i* ]] && return

PS1='[\u@\h \W]\$ '

alias ls='ls --color=auto'
alias ll='ls -l'
alias la='ls -a'
alias mkdir='mkdir -p'
alias ..='cd ..'

export EDITOR=vim
