# hosts-on-off can managed your hosts files
# Feature: one click / groups / managed by zshrc.etc.d
#
# Required: hostess:
# brew install hostess
# sudo chown root /usr/local/Cellar/hostess/*/bin/hostess
# sudo chmod +s /usr/local/Cellar/hostess/*/bin/hostess

# Usage:
# put the following into ~/.zshrc.etc.d/hosts-sample.zshrc and `source ~/.zshrc.etc.d/hosts-sample.zshrc`
#
# test_com_hosts="
# 127.0.0.1 a.test.com
# 127.0.0.1 b.test.com
# "
# alias hosts-on-test="hosts-on test_com_hosts"
# alias hosts-off-test="hosts-off test_com_hosts"

function hosts-on {
  hosts="$1"
  if [ -z ${hosts} ]; then
    print "error read \$hosts"
    return
  fi
  hosts_content=$(printf '%s\n' "${(P)$(echo "$hosts")}")

  while read -r line; do
    ip=$(echo ${line} | awk '{print $1}')
    domain=$(echo ${line} | awk '{print $2}')
    if [ -z ${ip} ] || [ -z ${domain} ]; then
      continue
    fi
    
    # chmod-root-s-hostess first
    hostess add ${domain} ${ip}
  done <<< "${hosts_content}"
}


function hosts-off {
  hosts="$1"
  if [ -z ${hosts} ]; then
    print "error read \$hosts"
    return
  fi
  hosts_content=$(printf '%s\n' "${(P)$(echo "$hosts")}")

  while read -r line; do
    ip=$(echo ${line} | awk '{print $1}')
    domain=$(echo ${line} | awk '{print $2}')
    if [ -z ${ip} ] || [ -z ${domain} ]; then
      continue
    fi

    # chmod-root-s-hostess first
    hostess rm ${domain};
  done <<< "${hosts_content}"
}
