-- Pull in the wezterm API
local wezterm = require 'wezterm'

-- This will hold the configuration.
local config = wezterm.config_builder()

-- This is where you actually apply your config choices

-- For example, changing the color scheme:
-- config.color_scheme = 'AdventureTime'
-- config.font = wezterm.font 'Monaco'
config.font = wezterm.font("Monaco", {weight="Regular", stretch="Normal", style="Normal"})
-- config.font = wezterm.font 'Menlo'
config.font_size = 13.0

config.default_prog = { '/opt/homebrew/bin/tmux' }


-- and finally, return the configuration to wezterm
return config
