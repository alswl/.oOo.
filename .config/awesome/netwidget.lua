local vicious = require("vicious")

module("netwidget")

function netwidget_text(netif)
    return '↓<span color="#5798d9">${' ..netif.. ' down_kb}</span> ↑<span color="#c2ba62">${' ..netif.. ' up_kb}</span> '
end

function register(widget, netif)
    vicious.register(widget, vicious.widgets.net, netwidget_text(netif) , 2)
    return widget
end
