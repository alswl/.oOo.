# not works for error code
# alias myip='curl -s https://ip.cn | jq -r ".ip"'
alias myip='curl -s http://www.cip.cc/ | head -n1 | cut -d " " -f2'

alias random-sentences='curl http://metaphorpsum.com/sentences/1'

# vim: set ft=zsh:
