{-# OPTIONS_GHC -cpp #-}
 
{-
#include <X11/XF86keysym.h>
-}

import XMonad
import XMonad.Hooks.ManageDocks
import XMonad.Hooks.DynamicLog

{-import XMonad.Actions.Volume -- use cabal-install / cabal install xmonad-extras-}

import XMonad.Config.Desktop
import XMonad.Util.Run (spawnPipe)

import Graphics.X11.ExtraTypes.XF86 

{-import XMonad.Config.Gnome-}

import System.IO

import Data.Monoid
import System.Exit

import qualified XMonad.StackSet as W
import qualified Data.Map as M

-- The preferred terminal program, which is used in a binding below and by
-- certain contrib modules.
--
myTerminal = "gnome-terminal"

-- Whether focus follows the mouse pointer.
myFocusFollowsMouse :: Bool
myFocusFollowsMouse = True

-- Width of the window border in pixels.
--
myBorderWidth = 2

-- modMask lets you specify which modkey you want to use. The default
-- is mod1Mask ("left alt").  You may also consider using mod3Mask
-- ("right alt"), which does not conflict with emacs keybindings. The
-- "windows key" is usually mod4Mask.
--
myModMask = mod4Mask

-- The default number of workspaces (virtual screens) and their names.
-- By default we use numeric strings, but any string may be used as a
-- workspace name. The number of workspaces is determined by the length
-- of this list.
--
-- A tagging example:
--
-- > workspaces = ["web", "irc", "code" ] ++ map show [4..9]
--
myWorkspaces = ["1:web","2:dev","3:im","4:dev","5:dev","6","7:media","8:util","9:nautilus"]

-- Border colors for unfocused and focused windows, respectively.
--
myNormalBorderColor  = "#0f0f0f"
myFocusedBorderColor = "#ff0000"

------------------------------------------------------------------------
-- Key bindings. Add, modify or remove key bindings here.
--
myKeys conf@(XConfig {XMonad.modMask = modm}) = M.fromList $

    -- launch a terminal
    [ ((modm .|. shiftMask, xK_Return), spawn $ XMonad.terminal conf)

    -- launch dmenu
    , ((modm, xK_p), spawn "dmenu_run")

    -- launch gmrun
    , ((modm .|. shiftMask, xK_p), spawn "gmrun")

    -- close focused window
    , ((modm .|. shiftMask, xK_c), kill)

     -- Rotate through the available layout algorithms
    , ((modm, xK_space ), sendMessage NextLayout)

    --  Reset the layouts on the current workspace to default
    , ((modm .|. shiftMask, xK_space ), setLayout $ XMonad.layoutHook conf)

    -- Resize viewed windows to the correct size
    , ((modm, xK_n), refresh)

    -- Move focus to the next window
    , ((modm, xK_Tab), windows W.focusDown)

    -- Move focus to the next window
    , ((modm, xK_j), windows W.focusDown)

    -- Move focus to the previous window
    , ((modm, xK_k), windows W.focusUp  )

    -- Move focus to the master window
    , ((modm, xK_m), windows W.focusMaster)

    -- Swap the focused window and the master window
    , ((modm, xK_Return), windows W.swapMaster)

    -- Swap the focused window with the next window
    , ((modm .|. shiftMask, xK_j), windows W.swapDown)

    -- Swap the focused window with the previous window
    , ((modm .|. shiftMask, xK_k), windows W.swapUp)

    -- Shrink the master area
    , ((modm, xK_h), sendMessage Shrink)

    -- Expand the master area
    , ((modm, xK_l), sendMessage Expand)

    -- Push window back into tiling
    , ((modm,               xK_t     ), withFocused $ windows . W.sink)

    -- Increment the number of windows in the master area
    , ((modm              , xK_comma ), sendMessage (IncMasterN 1))

    -- Deincrement the number of windows in the master area
    , ((modm              , xK_period), sendMessage (IncMasterN (-1)))

	, ((modm, xK_Print), spawn "/usr/bin/gnome-screenshot -i")

    -- Toggle the status bar gap
    -- Use this binding with avoidStruts from Hooks.ManageDocks.
    -- See also the statusBar function from Hooks.DynamicLog.
    --
    -- , ((modm              , xK_b     ), sendMessage ToggleStruts)

    -- Quit xmonad
    , ((modm .|. shiftMask, xK_r     ), io (exitWith ExitSuccess))

    -- Restart xmonad
    , ((modm , xK_r), spawn "xmonad --recompile; xmonad --restart")

    -- Lock
    , ((modm .|. shiftMask, xK_l), spawn "xscreensaver-command -lock")

    -- Suspend
    , ((modm .|. shiftMask, xK_s), spawn "xscreensaver-command -lock && sudo pm-suspend")
    ]
    ++

    --
    -- mod-[1..9], Switch to workspace N
    -- mod-shift-[1..9], Move client to workspace N
    --
    [((m .|. modm, k), windows $ f i)
        | (i, k) <- zip (XMonad.workspaces conf) [xK_1 .. xK_9]
        , (f, m) <- [(W.greedyView, 0), (W.shift, shiftMask)]]
    ++

    --
    -- mod-{w,e,r}, Switch to physical/Xinerama screens 1, 2, or 3
    -- mod-shift-{w,e,r}, Move client to screen 1, 2, or 3
    --
    [((m .|. modm, key), screenWorkspace sc >>= flip whenJust (windows . f))
        | (key, sc) <- zip [xK_q, xK_w] [0..]
        , (f, m) <- [(W.view, 0), (W.shift, shiftMask)]]
	
	++ multimedia

multimedia =
    [ player "prev" XF86XK_AudioPrev
	, player "next" XF86XK_AudioNext
	, amixer "toggle" XF86XK_AudioMute
	, players "pause" "play-pause" XF86XK_AudioPlay
	, player "stop" XF86XK_AudioStop
	, volume '-' XF86XK_AudioLowerVolume
	, volume '+' XF86XK_AudioRaiseVolume
	]

shortcut :: MonadIO x => keyMask -> String -> keySym -> ((keyMask, keySym), x ())
shortcut keyMask command keySym = ((keyMask, keySym), spawn command)

player :: String -> keySym -> ((KeyMask, keySym), X ())
player command = players command command

players :: String -> String -> keySym -> ((KeyMask, keySym), X ())
players decibel rhythmbox =
  noMask $ "decibel-audio-player-remote " ++ decibel ++ "; rhythmbox-client --no-start --" ++ rhythmbox
 
noMask :: String -> keySym -> ((KeyMask, keySym), X ())
noMask = shortcut 0
 
amixer :: String -> keySym -> ((KeyMask, keySym), X ())
amixer option = noMask $ "amixer set Master " ++ option
 
volume :: Char -> keySym -> ((KeyMask, keySym), X ())
volume signal = amixer $ " -c 0 3dB" ++ [signal]

------------------------------------------------------------------------
-- Mouse bindings: default actions bound to mouse events
--
myMouseBindings (XConfig {XMonad.modMask = modm}) = M.fromList $

    -- mod-button1, Set the window to floating mode and move by dragging
    [ ((modm, button1), (\w -> focus w >> mouseMoveWindow w
                                       >> windows W.shiftMaster))

    -- mod-button2, Raise the window to the top of the stack
    , ((modm, button2), (\w -> focus w >> windows W.shiftMaster))

    -- mod-button3, Set the window to floating mode and resize by dragging
    , ((modm, button3), (\w -> focus w >> mouseResizeWindow w
                                       >> windows W.shiftMaster))

    -- you may also bind events to the mouse scroll wheel (button4 and button5)
    ]

------------------------------------------------------------------------
-- Layouts:

-- You can specify and transform your layouts by modifying these values.
-- If you change layout bindings be sure to use 'mod-shift-space' after
-- restarting (with 'mod-q') to reset your layout state to the new
-- defaults, as xmonad preserves your old layout settings by default.
--
-- The available layouts.  Note that each layout is separated by |||,
-- which denotes layout choice.
--
myLayout = tiled ||| Mirror tiled ||| Full
  where
     -- default tiling algorithm partitions the screen into two panes
     tiled   = Tall nmaster delta ratio

     -- The default number of windows in the master pane
     nmaster = 1

     -- Default proportion of screen occupied by master pane
     ratio   = 1/2

     -- Percent of screen to increment by when resizing panes
     delta   = 3/100

------------------------------------------------------------------------
-- Window rules:

-- Execute arbitrary actions and WindowSet manipulations when managing
-- a new window. You can use this to, for example, always float a
-- particular program, or have a client always appear on a particular
-- workspace.
--
-- To find the property name associated with a program, use
-- > xprop | grep WM_CLASS
-- and click on the client you're interested in.
--
-- To match on the WM_NAME, you can use 'title' in the same way that
-- 'className' and 'resource' are used below.
--
myManageHook = composeAll
    [ className =? "Firefox" --> doShift "1:web"
	, className =? "Gvim" --> doShift "2:dev"
	, className =? "Gnome-terminal" --> doShift "2:dev"
    , className =? "Chromium" --> doShift "3:im"
    , className =? "Eclipse" --> doShift "4:dev"
    , className =? "Mysql-workbench-bin" --> doShift "5:dev"
    , className =? "MPlayer" --> doShift "7:media"
	, className =? "banshee" --> doShift "7:media"
	, className =? "Rhythmbox" --> doShift "7:media"
	, className =? "Thunderbird" --> doShift "8:util"
	, className =? "Nautilus" --> doShift "9:nautilus"
    , className =? "Gimp" --> doFloat
    , className =? "Tilda" --> doFloat
    , className =? "VirtualBox" --> doFloat
    , resource  =? "desktop_window" --> doIgnore
    , resource  =? "kdesktop"       --> doIgnore
    , manageDocks
	]

------------------------------------------------------------------------
-- Event handling

-- * EwmhDesktops users should change this to ewmhDesktopsEventHook
--
-- Defines a custom handler function for X Events. The function should
-- return (All True) if the default handler is to be run afterwards. To
-- combine event hooks use mappend or mconcat from Data.Monoid.
--
myEventHook = mempty

------------------------------------------------------------------------
-- Status bars and logging

-- Perform an arbitrary action on each internal state change or X event.
-- See the 'XMonad.Hooks.DynamicLog' extension for examples.
--
myLogHook xmproc = dynamicLogWithPP defaultPP
	{ ppOutput = hPutStrLn xmproc  
	, ppTitle = xmobarColor "green" "" . shorten 50   
	, ppLayout = const "" -- to disable the layout info on xmobar
	}

------------------------------------------------------------------------
-- Startup hook

-- Perform an arbitrary action each time xmonad starts or is restarted
-- with mod-q.  Used by, e.g., XMonad.Layout.PerWorkspace to initialize
-- per-workspace layout choices.
--
-- By default, do nothing.
myStartupHook = return ()


------------------------------------------------------------------------
-- Now run xmonad with all the defaults we set up.

-- Run xmonad with the settings you specify. No need to modify this.
--
main = do
    xmproc <- spawnPipe "xmobar"
    xmonad $ defaultConfig {
      -- simple stuff
        terminal           = myTerminal,
        focusFollowsMouse  = myFocusFollowsMouse,
        borderWidth        = myBorderWidth,
        modMask            = myModMask,
        workspaces         = myWorkspaces,
        normalBorderColor  = myNormalBorderColor,
        focusedBorderColor = myFocusedBorderColor,

      -- key bindings
        keys               = myKeys,
        mouseBindings      = myMouseBindings,

      -- hooks, layouts
        layoutHook         = avoidStruts myLayout,
        manageHook         = myManageHook <+> manageHook defaultConfig,
        handleEventHook    = myEventHook,
        logHook            = myLogHook xmproc,
        startupHook        = myStartupHook
    }
{-main = xmonad gnomeConfig-}

-- A structure containing your configuration settings, overriding
-- fields in the default config. Any you don't override, will
-- use the defaults defined in xmonad/XMonad/Config.hs
--
-- No need to modify this.
--
