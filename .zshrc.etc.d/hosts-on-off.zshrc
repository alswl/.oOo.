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

