---------------------------------------------------------------
-- Volume manager for the awesome window manager
---------------------------------------------------------------
-- Usage:
-- 1. require("volume")
-- 2.  tb_volume = widget({ type = "textbox", name = "tb_volume", align = "right" })
--     volume.register(tb_volume)
-- 3.  s == 1 and tb_volume or nil, -- in and tb_volume
-- 4.  volume.get_keys(tb_volume) -- in globalkeys
---------------------------------------------------------------
-- Grab environment
local timer = timer
local io = io
local os = os
local string = string
local awful = require("awful")

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

function register(tb_volume)
    tb_volume.width = 45
    tb_volume:buttons(awful.util.table.join(
        awful.button({ }, 4, function () up(tb_volume) end),
        awful.button({ }, 5, function () down(tb_volume) end),
        awful.button({ }, 1, function () toggle(tb_volume) end)
    ))

    local volume_clock = timer({ timeout = 10 })
    volume_clock:add_signal("timeout", function () update(tb_volume) end)
    volume_clock:start()

    update(tb_volume)
end

function get_keys(tb_volume)
    keys = awful.util.table.join(
        awful.key({}, "XF86AudioMute",
            function () toggle(tb_volume) end),
        awful.key({}, "XF86AudioRaiseVolume",
            function () up(tb_volume) end),
        awful.key({}, "XF86AudioLowerVolume",
            function () down(tb_volume) end)
    )
    return keys
end
