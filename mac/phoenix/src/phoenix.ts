/**
 * Phoenix
 * doc: https://github.com/jasonm23/phoenix/wiki/JavaScript-API-documentation
 *
 * This file is intentionally thin: it wires keyboard shortcuts to handlers.
 * Launch apps live in config.APP_LAUNCH; move/resize gestures in config.WINDOW_ADJUST;
 * all handler logic lives in window.ts / screen.ts / space.ts / mouse.ts / app.ts.
 */
import { callApp } from './features/app';
import * as config from './config';
import { setMousePositionForWindowCenter } from './lib/mouse';
import {
  focusNextScreen,
  focusPreviousScreen,
  getNextWindowsOnSameScreen,
  getPreviousWindowsOnSameScreen,
  moveWindowToScreen,
  sortedWindowsOnSameScreen,
} from './features/screen';
import {
  moveWindowToParkSpace,
  moveWindowToSecondWorkSpace,
  moveWindowToSpace,
  moveWindowToWorkSpace,
  parkOtherWindowsInSpace,
} from './features/space';
import { alert, getEnv, showTitleModal } from './lib/util';
import {
  adjustFrame,
  centralizeWindow,
  enlargeWindow,
  focusWindowInSameScreen,
  getCurrentWindow,
  growWidthLeft,
  growWidthRight,
  marginBottom,
  marginLeft,
  marginRight,
  marginTop,
  maximizeHeight,
  maximizeWidth,
  shrinkWindow,
  snapHalf,
  toggleMaximize,
} from './features/window';

var homedir: string;

/**
 * My Configuration Global
 */

Phoenix.set({
  daemon: true,
  openAtLogin: true,
});

getEnv('HOME')
  .then((v) => {
    homedir = (v as string).trim();
  })
  .catch((e) => {
    alert('Error: get HOME failed' + e);
  });

/**
 * My Configuration App — launch apps (all under MASH_CTRL), table-driven from config.
 */
config.APP_LAUNCH.forEach((b) => {
  Key.on(b.key, config.MASH_CTRL, () => callApp(b.app, b.fallback));
});

/**
 * My Configuration Screen
 */

// Next screen
Key.on('l', config.MASH_CTRL, () => {
  config.MAC_SCREEN_IN_THE_RIGHT ? focusNextScreen() : focusPreviousScreen();
});

// Previous Screen
Key.on('h', config.MASH_CTRL, () => {
  config.MAC_SCREEN_IN_THE_RIGHT ? focusPreviousScreen() : focusNextScreen();
});

// Move Current Window to Next Screen
Key.on('o', config.MASH_CTRL, () => {
  config.MAC_SCREEN_IN_THE_RIGHT
    ? moveWindowToScreen(getCurrentWindow(), (window: Window) => window.screen().next())
    : moveWindowToScreen(getCurrentWindow(), (window: Window) => window.screen().previous());
});

// Move Current Window to Previous Screen
Key.on('i', config.MASH_CTRL, () => {
  config.MAC_SCREEN_IN_THE_RIGHT
    ? moveWindowToScreen(getCurrentWindow(), (window: Window) => window.screen().previous())
    : moveWindowToScreen(getCurrentWindow(), (window: Window) => window.screen().next());
});

/**
 * My Configuration Window
 */

// Window Maximize / restore
Key.on('m', config.MASH_CTRL_SHIFT, () => toggleMaximize());

// Window Smaller, sticks to border when maximized
Key.on('-', config.MASH_CTRL, () => shrinkWindow());

// Window Larger (`=` is `+`)
Key.on('=', config.MASH_CTRL, () => enlargeWindow());

// Window Central
Key.on('m', config.MASH_CTRL, () => centralizeWindow());

// Window Height Max
Key.on('\\', config.MASH_CTRL_SHIFT, () => maximizeHeight());

// Window Width Max
Key.on('-', config.MASH_CTRL_SHIFT, () => maximizeWidth());

// Resize window width <<
Key.on(',', config.MASH_CTRL_SHIFT, () => growWidthLeft());

// Resize window width >>
Key.on('.', config.MASH_CTRL_SHIFT, () => growWidthRight());

// Move / enlarge by frame deltas (arrows), table-driven from config.
config.WINDOW_ADJUST.forEach((b) => {
  Key.on(b.key, b.mod, () => adjustFrame(b.dx, b.dy, b.dw, b.dh));
});

// Resize window to a half of the screen
Key.on('k', config.MASH_CTRL_SHIFT, () => snapHalf('top'));
Key.on('j', config.MASH_CTRL_SHIFT, () => snapHalf('bottom'));
Key.on('h', config.MASH_CTRL_SHIFT, () => snapHalf('left'));
Key.on('l', config.MASH_CTRL_SHIFT, () => snapHalf('right'));

// Move window to screen edge (note: h/l + MASH_CTRL are also bound above for screen
// switching; this later binding intentionally matches the original ordering).
Key.on('h', config.MASH_CTRL, () => marginLeft());
Key.on('l', config.MASH_CTRL, () => marginRight());
Key.on('k', config.MASH_CTRL, () => marginTop());
Key.on('j', config.MASH_CTRL, () => marginBottom());

// Previous Window in One Screen
Key.on('k', config.MASH_SHIFT, () =>
  focusWindowInSameScreen(
    getCurrentWindow(),
    sortedWindowsOnSameScreen,
    getPreviousWindowsOnSameScreen
  )
);

// Next Window in One Screen
Key.on('j', config.MASH_SHIFT, () =>
  focusWindowInSameScreen(getCurrentWindow(), sortedWindowsOnSameScreen, getNextWindowsOnSameScreen)
);

/**
 * My Configuration Mouse
 */

// Central Mouse
Key.on('space', config.MASH_CTRL, () => setMousePositionForWindowCenter(getCurrentWindow()));

/**
 * Mission Control / Spaces
 */

// move window to prev space
Key.on('i', config.MASH_CTRL_SHIFT, () =>
  moveWindowToSpace(getCurrentWindow(), (space: Space) => space.previous(), -1)
);

// move window to next space
Key.on('o', config.MASH_CTRL_SHIFT, () =>
  moveWindowToSpace(getCurrentWindow(), (space: Space) => space.next(), 1)
);

// move window to park space
Key.on('delete', config.MASH_CTRL, () => moveWindowToParkSpace());

// move window to work space
Key.on('return', config.MASH_CTRL, () => moveWindowToWorkSpace());

// move window to second work space
Key.on('return', config.MASH_CTRL_SHIFT, () => moveWindowToSecondWorkSpace());

// move other windows in this space to park space
Key.on('delete', config.MASH_CTRL_SHIFT, () => parkOtherWindowsInSpace());

// TODO WIP
Event.on('appDidActivate', () => {
  // alert(app.name());
});
// Event.on('windowDidOpen', (window) => {
// alert(window.title());
// });

// Test / scratchpad
Key.on('0', config.MASH_CTRL, () => {
  const windows = Window.recent();
  const spaces = Space.all();
  // log(`mouse x: ${Mouse.location().x}, y: ${Mouse.location().y}`);
  // _.map(App.all(), (app) => { Modal.show(app.title(), 5)});
  // _.map([Window.focused()], (window) => { Modal.show(window.title())}); // current one
  // _.map(Window.all(), (window) => { Modal.show(window.title(), 5)}); // all, include hide
  // _.map(Window.all({visible: true}), (window) => { Modal.show(window.title())}); // all, no hide
  // _.map(Window.recent(), (window) => { Modal.show(window.title())});
  // _.map(Window.focused().others(), (window) => { Modal.show(window.title())}); // no space
});

const phoenixApp = App.get('Phoenix');
showTitleModal('Phoenix (re)loaded!', 2, phoenixApp && phoenixApp.icon());

// vim: set ft=javascript sw=2:
