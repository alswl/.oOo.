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

    hostess del ${domain};
  done <<< "${hosts_content}"
}

# sample
#
# test_com_hosts="
# 127.0.0.1 test.com
# "
# alias hosts-on-test="hosts-on test_com_hosts"
# alias hosts-off-test="hosts-off test_com_hosts"
