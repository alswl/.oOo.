kube_prompt_info () {
        local context
        if [[ "$(command kubectl config get-contexts | grep '*' | wc -l 2>/dev/null)" != "0" ]]
        then
                context=$(command kubectl config get-contexts | grep '*' |  awk '{print $2"@"$3}' 2> /dev/null) || return 0
                echo "%{%}(%{%}${context}%{%})%{%}"
        fi
}
