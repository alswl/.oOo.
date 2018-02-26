
--dofile(package.searchpath("grid", package.path))


local application = require "mjolnir.application"
local hotkey = require "mjolnir.hotkey"
local window = require "mjolnir.window"
local alert = require "mjolnir.alert"
local fnutils = require "mjolnir.fnutils"
local grid = require "mjolnir.bg.grid"
--_ = require 'underscore'

local mash = {"alt"}
local mash_ctrl = {"ctrl", "alt"}
local mash_shift = {"shift", "alt"}

-- Start

alert.show('Mjolnir on service now.')


-- Functions >>>

table.indexOf = function( t, object )
    local result
    if "table" == type( t ) then
        for i=1,#t do
            if object == t[i] then
                result = i
                break
            end
        end
    end
    return result
end

function getAnotherWindowsOnSameScreen(win, offset)
  local windows = win:otherwindows_samescreen()
  table.insert(windows, win)
  table.sort(windows, function(x, y) return x:frame().x > y:frame().x end)
  local index = table.indexOf(windows, win)
  return windows[(index + offset + #windows) % #windows]
end

function getNextWindowsOnSameScreen(win)
    return getAnotherWindowsOnSameScreen(win, 1)
end

function getPreviousWindowsOnSameScreen(win)
    return getAnotherWindowsOnSameScreen(win, -1)
end

-- Functions <<<


-- Application >>>

hotkey.bind(mash, '`', function() application.launchorfocus("iTerm") end)
hotkey.bind(mash, '1', function() application.launchorfocus("Firefox") end)
hotkey.bind(mash, '2', function() application.launchorfocus("Google Chrome") end)
hotkey.bind(mash, '3', function() application.launchorfocus("QQ") end)
hotkey.bind(mash, 'e', function() application.launchorfocus("Preview") end)
hotkey.bind(mash, 'a', function() application.launchorfocus("MacVim") end)
hotkey.bind(mash, 's', function() application.launchorfocus("IntelliJ IDEA 14") end)
hotkey.bind(mash, 'z', function() application.launchorfocus("MacDown") end)
hotkey.bind(mash, ',', function() application.launchorfocus("Airmail") end)
hotkey.bind(mash, '9', function() application.launchorfocus("NeteaseMusic") end)
hotkey.bind(mash, '.', function() application.launchorfocus("Evernote") end)
hotkey.bind(mash, '/', function() application.launchorfocus("Finder") end)

-- Application <<<


-- Size >>>

hotkey.bind(mash_shift, 'm', grid.maximize_window) -- TODO

hotkey.bind(mash, "=", function()  -- TODO
    grid.adjustheight(1)
end)
-- hotkey.bind(mash, '+', function() grid.adjustheight(1) end)  -- my
hotkey.bind(mash, '-', function()  -- TODO
    grid.adjustheight(-1)
end)

hotkey.bind(mash, '\\', function()  -- TODO
end)

-- Size <<<

-- Position >>>

hotkey.bind(mash_ctrl, "l", function() -- <
  local win = window.focusedwindow()
  local f = win:frame()
  f.x = f.x + 100
  win:setframe(f)
end)

hotkey.bind(mash_ctrl, "h", function() -- >
  local win = window.focusedwindow()
  local f = win:frame()
  f.x = f.x - 100
  win:setframe(f)
end)

hotkey.bind(mash_ctrl, "j", function() -- v
  local win = window.focusedwindow()
  local f = win:frame()
  f.y = f.y + 100
  win:setframe(f)
end)

hotkey.bind(mash_ctrl, "k", function() -- ^
  local win = window.focusedwindow()
  local f = win:frame()
  f.y = f.y - 100
  win:setframe(f)
end)

-- Position <<<


-- Multi Screen >>>

hotkey.bind(mash, "h", function() -- TODO
end)


hotkey.bind(mash, "l", function() -- TODO
end)


hotkey.bind(mash_shift, "h", function() -- TODO
end)


hotkey.bind(mash_shift, "l", function() -- TODO
end)

-- Multi Screen <<<


-- Screen >>>

hotkey.bind(mash, "j", function() -- TODO
  local win = window.focusedwindow()
  if win == nil then
      return
  end
  --local others = win:otherwindows_samescreen()
  --if #others == 0 then return end
  --others[1]:focus()
  getNextWindowsOnSameScreen(win):focus()
end)

hotkey.bind(mash, "k", function() -- TODO
  local win = window.focusedwindow()
  if win == nil then
      return
  end
  getPreviousWindowsOnSameScreen(win):focus()
end)

-- Screen <<<


hotkey.bind(mash, "0", function()
    alert.show('Focus')
end)

