local awful = require("awful")
local vicious = require("vicious")

module("memwidget")

function register()
    local widget = awful.widget.progressbar()
    widget:set_width(8)
    widget:set_height(10)
    widget:set_vertical(true)
    widget:set_background_color("#494B4F")
    widget:set_border_color(nil)
    widget:set_color("#AECF96")
    widget:set_gradient_colors({ "#AECF96", "#88A175", "#FF5656" })
    -- Register widget
    vicious.register(widget, vicious.widgets.mem, "$1", 13)
    return widget
end
