local awful = require("awful")
local vicious = require("vicious")
local widget_module = require("widget")

module("battery")

function register(widget)
    widget = widget or widget_module({ type = "textbox" })
    vicious.register(widget, vicious.widgets.bat, ' <span color="#0000ff">$1$2%</span>', 5, 'BAT0')
    return widget
end
