local awful = require("awful")
local vicious = require("vicious")

module("cpuwidget")

function register()
    local widget = awful.widget.graph()
    widget:set_width(8)
    widget:set_background_color("#494B4F")
    widget:set_color("#FF5656")
    widget:set_gradient_colors({ "#FF5656", "#88A175", "#AECF96" })
    vicious.register(widget, vicious.widgets.cpu, "$1")
    return widget
end
