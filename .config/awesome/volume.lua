---------------------------------------------------------------
-- Volume manager for the awesome window manager
---------------------------------------------------------------
-- Usage:
-- 1. require("volume")
-- 2.  volume1 = widget({ type = "textbox", name = "volume1", align = "right" })
--     volume.register(volume1)
-- 3.  s == 1 and volume1 or nil, -- in and volume1
-- 4.  volume.get_keys(volume1) -- in globalkeys
---------------------------------------------------------------
-- Grab environment
local timer = timer
local io = io
local os = os
local string = string
local awful = require("awful")
local widget_module = require("widget")

module("volume")

local volume_cardid  = 0
local volume_channel = "Master"

function update(widget)
    local fd = io.popen("amixer -c " .. volume_cardid .. " -- sget " .. volume_channel)
    local status = fd:read("*all")
    fd:close()

    local volume = string.match(status, "(%d?%d?%d)%%")
    volume = string.format("% 3d", volume)

    status = string.match(status, "%[(o[^%]]*)%]")

    if string.find(status, "on", 1, true) then
        volume = '♫' .. volume .. "%"
    else
        volume = '♫' .. volume .. '<span color="red">M</span>'
    end
    widget.text = volume
end

function up(widget)
    io.popen("amixer -q -c " .. volume_cardid .. " sset " .. volume_channel .. " 5%+"):read("*all")
    update(widget)
end

function down(widget)
    io.popen("amixer -q -c " .. volume_cardid .. " sset " .. volume_channel .. " 5%-"):read("*all")
    update(widget)
end

function toggle(widget)
    io.popen("amixer -c " .. volume_cardid .. " sset " .. volume_channel .. " toggle"):read("*all")
    update(widget)
end

function register()
    local widget = widget_module({ type = "textbox", name = "volume1", align = "right" })
    widget.width = 45
    widget:buttons(awful.util.table.join(
        awful.button({ }, 4, function () up(widget) end),
        awful.button({ }, 5, function () down(widget) end),
        awful.button({ }, 1, function () toggle(widget) end)
    ))

    local volume_clock = timer({ timeout = 10 })
    volume_clock:add_signal("timeout", function () update(widget) end)
    volume_clock:start()

    update(widget)
    return widget
end

function get_keys(widget)
    keys = awful.util.table.join(
        awful.key({}, "XF86AudioMute",
            function () toggle(widget) end),
        awful.key({}, "XF86AudioRaiseVolume",
            function () up(widget) end),
        awful.key({}, "XF86AudioLowerVolume",
            function () down(widget) end)
    )
    return keys
end
