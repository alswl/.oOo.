-- Standard awesome library
require("awful")
require("awful.autofocus")
require("awful.rules")
-- Theme handling library
require("beautiful")
-- Notification library
require("naughty")
-- Third party
require("vicious")
require("volume")
require("netwidget")
require("cpuwidget")
require("memwidget")

-- {{{ Error handling
-- Check if awesome encountered an error during startup and fell back to
-- another config (This code will only ever execute for the fallback config)
if awesome.startup_errors then
    naughty.notify({ preset = naughty.config.presets.critical,
                     title = "Oops, there were errors during startup!",
                     text = awesome.startup_errors })
end

-- Handle runtime errors after startup
do
    local in_error = false
    awesome.add_signal("debug::error", function (err)
        -- Make sure we don't go into an endless error loop
        if in_error then return end
        in_error = true

        naughty.notify({ preset = naughty.config.presets.critical,
                         title = "Oops, an error happened!",
                         text = err })
        in_error = false
    end)
end
-- }}}

-- {{{ Variable definitions
-- Themes define colours, icons, and wallpapers
beautiful.init("/usr/share/awesome/themes/default/theme.lua")

-- This is used later as the default terminal and editor to run.
terminal = "tilda"
editor = os.getenv("EDITOR") or "vim"
editor_cmd = terminal .. " -e " .. editor

-- Default modkey.
-- Usually, Mod4 is the key with a logo between Control and Alt.
-- If you do not like this or do not have such a key,
-- I suggest you to remap Mod4 to another key using xmodmap or other tools.
-- However, you can use another modifier like Mod1, but it may interact with others.
modkey = "Mod4"

-- auto run
awful.util.spawn_with_shell("./autorun.sh")

-- Table of layouts to cover with awful.layout.inc, order matters.
layouts =
{
    awful.layout.suit.floating,
    awful.layout.suit.tile,
    --awful.layout.suit.tile.left,
    awful.layout.suit.tile.bottom,
    --awful.layout.suit.tile.top,
    --awful.layout.suit.fair,
    --awful.layout.suit.fair.horizontal,
    --awful.layout.suit.spiral,
    --awful.layout.suit.spiral.dwindle,
    awful.layout.suit.max,
    --awful.layout.suit.max.fullscreen,
    awful.layout.suit.magnifier
}

-- Mouse position for every tag
mouse_position = {} -- TODO
for s = 1, screen.count() do
    mouse_position[s] = {}
    for t =  1, 9 do
        local screen_geometry = screen[s].workarea
        mouse_position[s][t] = {
            x = screen_geometry.x + screen_geometry.width / 2,
            y = screen_geometry.y + screen_geometry.height / 2,
        }
    end
end

-- Save last used tag over all screen
last_tag = 1
-- }}}

-- {{{ Tags
-- Define a tag table which hold all screen tags.
tags = {
    -- www / dev / im / dev / dev / dev / media / util / nautilus
    names = {"1:w", "2:d", "3:im", "4:d", "5:m", "6:d", "7", "8:u","9:n"},
    layouts = {
        awful.layout.suit.tile,
        awful.layout.suit.tile,
        awful.layout.suit.max,
        awful.layout.suit.floating,
        awful.layout.suit.floating,
        awful.layout.suit.floating,
        awful.layout.suit.floating,
        awful.layout.suit.floating,
        awful.layout.suit.floating
    }
}
for s = 1, screen.count() do
    -- Each screen has its own tag table.
    if s == 1 then
        tags[s] = awful.tag(tags.names, s, tags.layouts)
    else -- 第二屏幕，是竖起来的
        tags[s] = awful.tag(tags.names, s, awful.layout.suit.tile.bottom)
    end
end
-- }}}

-- {{{ Menu
-- Create a laucher widget and a main menu
myawesomemenu = {
   --{ "manual", terminal .. " -e man awesome" },
   { "edit config", editor_cmd .. " " .. awesome.conffile },
   { "restart", awesome.restart },
   { "quit", awesome.quit },
   { "suspend", function () awful.util.spawn("sudo pm-suspend") end},
   { "power off", "dbus-send --system --print-reply --dest=org.freedesktop.ConsoleKit /org/freedesktop/ConsoleKit/Manager org.freedesktop.ConsoleKit.Manager.Stop",  '/usr/share/icons/gnome/16x16/actions/gtk-quit.png'},
}

mymainmenu = awful.menu({
    items = {
        {"awesome", myawesomemenu, beautiful.awesome_icon},
        {"&Nautilus", "nautilus --no-desktop", '/usr/share/icons/hicolor/32x32/apps/nautilus.png'},
        {"&Thunar", "thunar"},
        {"屏幕键盘", "matchbox-keyboard", '/usr/share/pixmaps/matchbox-keyboard.png'},
        {"open terminal", terminal }
    }
})

mylauncher = awful.widget.launcher({
    image = image(beautiful.awesome_icon),
    menu = mymainmenu })
-- }}}

-- {{{ Wibox
-- Text Clock
local textclock1 = awful.widget.textclock({ align = "right" })
-- Memory Widget
local memwidget1 = memwidget.register()
-- Cpu Widget
local cpuwidget1 = cpuwidget.register()
-- Net Interface Speed
local netwidget1 = netwidget.register(widget({ type = "textbox" }), "wlan0")
-- Volume Control
local volume1 = volume.register()
-- Battery
local batwidget1 = widget({ type = "textbox" })
vicious.register(batwidget1, vicious.widgets.bat, ' <span color="#0000ff">$1$2%</span>', 5, 'BAT0')

-- Create a systray
mysystray = widget({ type = "systray" })

-- Create a wibox for each screen and add it
mywibox = {}
mypromptbox = {}
mylayoutbox = {}
mytaglist = {}
-- mouse control tag list bar
mytaglist.buttons = awful.util.table.join(
    awful.button({ }, 1, awful.tag.viewonly),
    awful.button({ modkey }, 1, awful.client.movetotag),
    awful.button({ }, 3, awful.tag.viewtoggle),
    awful.button({ modkey }, 3, awful.client.toggletag),
    awful.button({ }, 4, awful.tag.viewnext),
    awful.button({ }, 5, awful.tag.viewprev)
)
mytasklist = { }
mystatuslist = { }
mytasklist.buttons = awful.util.table.join(
    awful.button({}, 1,
        function (c)
            if c == client.focus then
                c.minimized = true
            else
                if not c:isvisible() then
                    awful.tag.viewonly(c:tags()[1])
                end
                -- This will also un-minimize
                -- the client, if needed
                client.focus = c
                c:raise()
            end
        end),
    awful.button({ }, 3,
        function ()
            if instance then
                instance:hide()
                instance = nil
            else
                instance = awful.menu.clients({ width=250 })
            end
        end),
    awful.button({ }, 4,
        function ()
            awful.client.focus.byidx(1)
            if client.focus then client.focus:raise() end
        end),
    awful.button({ }, 5,
        function ()
            awful.client.focus.byidx(-1)
            if client.focus then client.focus:raise() end
        end)
)

for s = 1, screen.count() do
    -- Create a promptbox for each screen
    mypromptbox[s] = awful.widget.prompt({
        layout = awful.widget.layout.horizontal.leftright})
    -- Create an imagebox widget which will contains an icon indicating which layout we're using.
    -- We need one layoutbox per screen.
    mylayoutbox[s] = awful.widget.layoutbox(s)
    mylayoutbox[s]:buttons(
        awful.util.table.join(
            awful.button({ }, 1,
                function () awful.layout.inc(layouts, 1) end),
            awful.button({ }, 3,
                function () awful.layout.inc(layouts, -1) end),
            awful.button({ }, 4,
                function () awful.layout.inc(layouts, 1) end),
            awful.button({ }, 5,
                function () awful.layout.inc(layouts, -1) end)
        )
    )
    -- Create a taglist widget
    mytaglist[s] = awful.widget.taglist(
        s, awful.widget.taglist.label.all, mytaglist.buttons)

    -- Create a tasklist widget
    mytasklist[s] = awful.widget.tasklist(
        function(c)
            return awful.widget.tasklist.label.currenttags(c, s)
        end, mytasklist.buttons
    )

    -- Create the wibox
    mywibox[s] = awful.wibox({ position = "top", screen = s })
    -- Add widgets to the wibox - order matters
    mywibox[s].widgets = {
        {
            s == 1 and cpuwidget1 or nil,
            s == 1 and memwidget1 or nil,
            mylauncher,
            mytaglist[s],
            mypromptbox[s],
            layout = awful.widget.layout.horizontal.leftright
        },
        mylayoutbox[s],
        textclock1,
        s == 1 and mysystray or nil,
        s == 1 and netwidget1 or nil,
        s == 1 and volume1 or nil,
        s == 1 and batwidget1 or nil,
        mytasklist[s],
        layout = awful.widget.layout.horizontal.rightleft
    }
end
-- }}}

-- {{{ Mouse bindings
root.buttons(awful.util.table.join(
    awful.button({ }, 3, function () mymainmenu:toggle() end),
    awful.button({ }, 4, awful.tag.viewnext),
    awful.button({ }, 5, awful.tag.viewprev)
))
-- }}}

-- {{{ Key bindings
globalkeys = awful.util.table.join(
    awful.key({ modkey,}, "Left", awful.tag.viewprev),
    awful.key({ modkey,}, "Right", awful.tag.viewnext),
    awful.key({ modkey,}, "Escape", awful.tag.history.restore),

    awful.key({ modkey,}, "j",
        function ()
            awful.client.focus.byidx( 1)
            set_mouse_to_client_center()
            if client.focus then client.focus:raise() end
        end),
    awful.key({ modkey, }, "k",
        function ()
            awful.client.focus.byidx(-1)
            set_mouse_to_client_center()
            if client.focus then client.focus:raise() end
        end),
    --awful.key({ modkey,           }, "w", function () mymainmenu:show({keygrabber=true}) end),

    -- Layout manipulation
    awful.key({ modkey, "Shift"   }, "j", function () awful.client.swap.byidx(  1)    end),
    awful.key({ modkey, "Shift"   }, "k", function () awful.client.swap.byidx( -1)    end),
    awful.key({ modkey, }, "q",
        function ()
            tag_switch(last_tag)
        end),
    awful.key({ modkey, }, "w",
        function ()
            save_tag_status()
            awful.screen.focus_relative(-1)
            set_tag_status()
        end),
    awful.key({ modkey,           }, "u", awful.client.urgent.jumpto),
    awful.key({ modkey,           }, "Tab",
        function ()
            awful.client.focus.history.previous()
            if client.focus then
                client.focus:raise()
            end
        end),

    -- Standard program
    awful.key({ modkey, }, "Return",
        function () awful.util.spawn(terminal) end),
    awful.key({ modkey, "Control" }, "r", awesome.restart),
    awful.key({ modkey, "Shift"   }, "q", awesome.quit),

    awful.key({ modkey, }, "l",
        function () awful.tag.incmwfact( 0.05) end),
    awful.key({ modkey,           }, "h",
        function () awful.tag.incmwfact(-0.05)    end),
    awful.key({ modkey, "Shift"   }, "h",
        function () awful.tag.incnmaster( 1)      end),
    awful.key({ modkey, "Shift"   }, "l",
        function () awful.tag.incnmaster(-1)      end),
    awful.key({ modkey, "Control" }, "h",
        function () awful.tag.incncol( 1)         end),
    awful.key({ modkey, "Control" }, "l",
        function () awful.tag.incncol(-1)         end),
    awful.key({ modkey,           }, "space",
        function () awful.layout.inc(layouts,  1) end),
    awful.key({ modkey, "Shift"   }, "space",
        function () awful.layout.inc(layouts, -1) end),

    awful.key({ modkey, "Control" }, "n", awful.client.restore),

    -- Lock screen
    awful.key({ modkey, "Shift" }, "l",
        function () awful.util.spawn("xscreensaver-command -lock") end),

    -- Prompt
    awful.key({ modkey }, "p",
        function () mypromptbox[mouse.screen]:run() end),

    awful.key({ modkey }, "x",
        function ()
            awful.prompt.run({ prompt = "Run Lua code: " },
            mypromptbox[mouse.screen].widget,
            awful.util.eval, nil,
            awful.util.getdir("cache") .. "/history_eval")
        end),
    volume.get_keys(volume1)
)

clientkeys = awful.util.table.join(
    awful.key({ modkey, }, "f",
        function (c) c.fullscreen = not c.fullscreen  end),
    awful.key({ modkey, "Shift" }, "c", function (c) c:kill() end),
    awful.key({ modkey, "Control" }, "space", awful.client.floating.toggle),
    awful.key({ modkey, "Control" }, "Return",
        function (c) c:swap(awful.client.getmaster()) end),
    awful.key({ modkey, }, "i",
        function (c)
            if screen.count() == 1 then
                return
            end
            save_tag_status()
            local tag_idx = awful.tag.getidx(awful.tag.selected(client.focus.screen))
            awful.client.movetoscreen(c)
            awful.client.movetotag(tags[client.focus.screen][tag_idx])
            awful.tag.viewonly(tags[client.focus.screen][tag_idx])
            set_tag_status()
        end),
    awful.key({ modkey, }, "o", function (c)
        if screen.count() == 1 then
            return
        end
        awful.client.movetoscreen(c)
    end),
    awful.key({ modkey, "Shift" }, "r", function (c) c:redraw() end),
    awful.key({ modkey, }, "t", function (c) c.ontop = not c.ontop end),
    awful.key({ modkey, }, "n",
        function (c)
            -- The client currently has the input focus, so it cannot be
            -- minimized, since minimized clients can't have the focus.
            c.minimized = true
        end),
    awful.key({ modkey, }, "m",
        function (c)
            c.maximized_horizontal = not c.maximized_horizontal
            c.maximized_vertical   = not c.maximized_vertical
        end)
)

-- Compute the maximum number of digit we need, limited to 9
keynumber = 0
for s = 1, screen.count() do
   keynumber = math.min(9, math.max(#tags[s], keynumber));
end

-- Switch Tag for multi screen
function tag_switch(i)
    local cs = mouse.screen
    local selected_tag_idx = awful.tag.getidx(awful.tag.selected(cs))
    if i == selected_tag_idx then
        return -- not current screen
    end
    save_tag_status()
    local ismatched = false
    if tags[cs][i] and table.getn(tags[cs][i]:clients()) > 0 then
        awful.tag.viewonly(tags[cs][i]) -- current screen's tag is active
    else -- other screen's tag is active
        for j = 1, screen.count() do
            if table.getn(tags[j][i]:clients()) > 0 then
                awful.tag.viewonly(tags[j][i])
                awful.screen.focus(j)
                ismatched = true
                break
            end
        end
    end
    if not ismatched and tags[cs][i] then
        awful.tag.viewonly(tags[cs][i])
    end
    set_tag_status()
end

-- Move mouse to client center
function set_mouse_to_client_center()
    local cc = awful.client.next(0)
    local x = cc:geometry().x
    local y = cc:geometry().y
    local width = cc:geometry().width
    local height = cc:geometry().height
    mouse.coords({ x = x + width / 2, y = y + height / 2 })
end

-- save tag status
function save_tag_status(screen, tag)
    last_tag = awful.tag.getidx(awful.tag.selected(mouse.screen))
    if screen == nil then
        screen = mouse.screen
    end
    if tag == nil then
        tag = last_tag
    end
    mouse_position[screen][tag] = mouse.coords()
end

-- set tag status
function set_tag_status(screen, tag)
    if screen == nil then
        screen = mouse.screen
    end
    if tag == nil then
        tag = awful.tag.getidx(awful.tag.selected(mouse.screen))
    end
    mouse.coords(mouse_position[screen][tag])
end

-- Bind all key numbers to tags.
-- Be careful: we use keycodes to make it works on any keyboard layout.
-- This should map on the top row of your keyboard, usually 1 to 9.
for i = 1, keynumber do
    globalkeys = awful.util.table.join(globalkeys,
        awful.key({ modkey }, "#" .. i + 9,
            function ()
                tag_switch(i)
            end),
        awful.key({ modkey, "Control" }, "#" .. i + 9,
                  function ()
                      local screen = mouse.screen
                      if tags[screen][i] then
                          awful.tag.viewtoggle(tags[screen][i])
                      end
                  end),
        awful.key({ modkey, "Shift" }, "#" .. i + 9,
                  function ()
                      if client.focus and tags[client.focus.screen][i] then
                          awful.client.movetotag(tags[client.focus.screen][i])
                      end
                  end),
        awful.key({ modkey, "Control", "Shift" }, "#" .. i + 9,
                  function ()
                      if client.focus and tags[client.focus.screen][i] then
                          awful.client.toggletag(tags[client.focus.screen][i])
                      end
                  end))
end

clientbuttons = awful.util.table.join(
    awful.button({ }, 1, function (c) client.focus = c; c:raise() end),
    awful.button({ modkey }, 1, awful.mouse.client.move),
    awful.button({ modkey }, 3, awful.mouse.client.resize))

-- Set keys
root.keys(globalkeys)
-- }}}

-- {{{ Rules
awful.rules.rules = {
    -- All clients will match this rule.
    {rule = {},
     properties = {border_width = beautiful.border_width,
                   border_color = beautiful.border_normal,
                   focus = true,
                   keys = clientkeys,
                   buttons = clientbuttons}},
    {rule = {class = "Firefox", name = "Navigator"},
      properties = {tag = tags[1][1]}},
    {rule = {class = "Firefox", name = "Browser"},
      properties = {floating = true}},
    {rule = {class = "Firefox", name = "Download"},
      properties = {floating = true}},
    --{rule = {class = "Gvim"},
      --properties = {tag = tags[1][2]}},
    --{rule = {class = "Chromium"},
      --properties = {tag = tags[1][3]}},
    {rule = {class = "Thunderbird"},
      properties = {tag = tags[1][8]}},
    {rule = {class = "VirtualBox"},
      properties = {floating = true, tag = tags[1][3]}},
    {rule = {class = "Smplayer"},
     properties = {floating = true, tag = tags[1][7]}},
    {rule = {class = "MPlayer"},
     properties = {floating = true}, tag = tags[1][7]},
    --{ rule = { class = "pinentry" },
      --properties = { floating = true } },
    { rule = { class = "gimp" },
      properties = { floating = true } },
    {rule = {class = "Goldendict"},
      properties = {floating = true}},
    -- Set Firefox to always map on tags number 2 of screen 1.
    -- { rule = { class = "Firefox" },
    --   properties = { tag = tags[1][2] } },
}
-- }}}

-- {{{ Signals
-- Signal function to execute when a new client appears.
client.add_signal("manage", function (c, startup)
    -- Add a titlebar
    -- awful.titlebar.add(c, { modkey = modkey })

    -- Enable sloppy focus
    c:add_signal("mouse::enter", function(c)
        if awful.layout.get(c.screen) ~= awful.layout.suit.magnifier
            and awful.client.focus.filter(c) then
            client.focus = c
        end
    end)

    if not startup then
        -- Set the windows at the slave,
        -- i.e. put it at the end of others instead of setting it master.
        -- awful.client.setslave(c)

        -- Put windows in a smart way, only if they does not set an initial position.
        if not c.size_hints.user_position and not c.size_hints.program_position then
            awful.placement.no_overlap(c)
            awful.placement.no_offscreen(c)
        end
    end
end)

client.add_signal("focus", function(c)
    c.border_color = beautiful.border_focus
    c.opacity = 1
end)
client.add_signal("unfocus", function(c)
    c.border_color = beautiful.border_normal
    c.opacity = 0.6
end)
-- }}}
