/**
 * Phoenix
 * doc: https://github.com/jasonm23/phoenix/wiki/JavaScript-API-documentation
 *
 * Global Settings
 */
import * as _ from "lodash";
import { callApp } from './app';
import * as config from './config';
import { setMousePositionForWindowCenter } from './mouse';
import { focusNextScreen, focusPreviousScreen, getNextWindowsOnSameScreen, getPreviousWindowsOnSameScreen, moveWindowToScreen, sortedWindowsOnSameScreen } from './screen';
import { moveWindowToSpace, moveWindowToTargetSpace } from './space';
import { log, showTitleModal } from "./util";
import { autoRangeByRecent, focusWindowInSameScreen, getCurrentWindow, getLargerFrame, getSmallerFrame, marginWindow, setWindowCentral } from './window';

const WORK_SPACE_INDEX_MAP: { [name: number]: number } = config.WORK_SPACE_INDEX_MAP
const SECOND_WORK_SPACE_INDEX_MAP: { [name: number]: number } = config.SECOND_WORK_SPACE_INDEX_MAP
const PARK_SPACE_INDEX_MAP: { [name: number]: number } = config.PARK_SPACE_APP_INDEX_MAP
const PARK_SPACE_APP_INDEX_MAP: { [name: string]: number } = config.PARK_SPACE_APP_INDEX_MAP

/**
 * My Configuartion Global
 */

Phoenix.set({
  daemon: true,
  openAtLogin: false,
});

/**
 * My Configuartion App
 */

// Launch App
Key.on('escape', config.MASH, () => callApp('iTerm'));
Key.on('`', config.MASH, () => callApp('iTerm'));
Key.on('1', config.MASH, () => callApp('Google Chrome'));
// Key.on('1', mash, () => callApp('Chromium'));
Key.on('2', config.MASH, () => callApp('Safari'));
// Key.on('2', mashShift, () => callApp('Firefox'));
Key.on('3', config.MASH, () => callApp('DingTalk'));
// Key.on('4', mash, () => callApp('BearyChat'));
Key.on('4', config.MASH, () => callApp('Wechat', 'YouShang'));
// Key.on('6', mash, () => callApp('企业微信'));
// Key.on('8', mash, () => callApp('虾米音乐'));
Key.on('8', config.MASH, () => callApp('NeteaseMusic'));
Key.on('e', config.MASH, () => callApp('Preview'));
Key.on('a', config.MASH, () => callApp('MacVim'));
// Key.on('a', mash, () => callApp('Terminal'));
Key.on('s', config.MASH, () => callApp('IntelliJ IDEA 2018'));
Key.on('d', config.MASH, () => callApp('Visual Studio Code'));
Key.on('z', config.MASH, () => callApp('Macdown'));
// Key.on('z', mash, () => callApp('Typora'));
// Key.on('z', mash, () => callApp('Atom'));
// Key.on('z', mash, () => callApp('Sublime Text'));
// Key.on(',', mash, () => callApp('Airmail 3'));
Key.on(',', config.MASH, () => callApp('Mail'));
Key.on('.', config.MASH, () => callApp('Evernote', 'Tusk'));
// Key.on('.', mash, () => callApp('Alternote'));
Key.on('/', config.MASH, () => callApp('Finder'));

// Next screen
Key.on('l', config.MASH, () => {
  config.MAC_SCREEN_IN_THE_RIGHT ? focusNextScreen() : focusPreviousScreen();
});

// Previous Screen
Key.on('h', config.MASH, () => {
  config.MAC_SCREEN_IN_THE_RIGHT ? focusPreviousScreen() : focusNextScreen();
});

// Move Current Window to Next Screen
Key.on('l', config.MASH_SHIFT, () => {
  config.MAC_SCREEN_IN_THE_RIGHT ?
    moveWindowToScreen(getCurrentWindow(), (window: Window) => window.screen().next())
    :
    moveWindowToScreen(getCurrentWindow(), (window: Window) => window.screen().previous());
});

// Move Current Window to Previous Screen
Key.on('h', config.MASH_SHIFT, () => {
  config.MAC_SCREEN_IN_THE_RIGHT ?
    moveWindowToScreen(getCurrentWindow(), (window: Window) => window.screen().previous())
    :
    moveWindowToScreen(getCurrentWindow(), (window: Window) => window.screen().next())
    ;
});

/**
 * My Configuartion Window
 */

// Window Hide Inactive
// Key.on('delete', mash, () => {
// var window = Window.focused();
// if (!window) return;
// heartbeat_window(window);
// hide_inactiveWindow(window.others());
// });

// Window Maximize
Key.on('m', config.MASH_SHIFT, () => {
  const window = getCurrentWindow();

  window.maximize();
  setWindowCentral(window);
  // heartbeat_window(window);
});

// Window Smaller
Key.on('-', config.MASH, () => {
  const window = getCurrentWindow();
  const oldFrame: Rectangle = window.frame();
  const frame: Rectangle = getSmallerFrame(oldFrame);
  window.setFrame(frame);
  if (window.frame().width === oldFrame.width || window.frame().height === oldFrame.height) {
    window.setFrame(oldFrame);
  }
  // heartbeat_window(window);
});

// Window Larger
Key.on('=', config.MASH, () => {
  const window = getCurrentWindow();
  const frame = getLargerFrame(window.frame());
  if (frame.width > window.screen().flippedFrame().width ||
    frame.height > window.screen().flippedFrame().height) {
    window.maximize();
  } else {
    window.setFrame(frame);
  }
  // heartbeat_window(window);
});

// Window Central
Key.on('m', config.MASH, () => {
  const window = getCurrentWindow();
  setWindowCentral(window);
});

// Window Height Max
Key.on('\\', config.MASH, () => {
  const window = getCurrentWindow();
  window.setFrame({
    x: window.frame().x,
    y: window.screen().flippedFrame().y,
    width: window.frame().width,
    height: window.screen().flippedFrame().height,
  });
  // heartbeatWindow(window);
});

// Window Width Max
// Key.on('\\', mashShift, () => {
// var window = getCurrentWindow();
// if (window === undefined) {
// return;
// }
// window.setFrame({
// x: window.screen().flippedFrame().x,
// y: window.frame().y,
// width: window.screen().flippedFrame().width,
// height: window.frame().height
// });
// heartbeat_window(window);
// });

// Window width <<
Key.on(',', config.MASH_SHIFT, () => {
  const screen = Screen.main()
  const window = Window.focused();
  if (window === undefined) {
    return;
  }

  window.setTopLeft({
    x: window.topLeft().x - 200,
    y: window.topLeft().y,
  });
  window.setSize({
    width: window.size().width + 200,
    height: window.size().height,
  });
});

// Window width >>
Key.on('.', config.MASH_SHIFT, () => {
  const screen = Screen.main()
  const window = Window.focused();
  if (window === undefined) {
    return;
  }

  window.setSize({
    width: window.size().width + 200,
    height: window.size().height,
  });
});

// Window <
Key.on('h', config.MASH_CTRL, () => {
  const window = getCurrentWindow();
  window.setFrame({
    x: window.frame().x - 100,
    y: window.frame().y,
    width: window.frame().width,
    height: window.frame().height,
  });
  // heartbeatWindow(window);
});

// Window >
Key.on('l', config.MASH_CTRL, () => {
  const window = getCurrentWindow();
  window.setFrame({
    x: window.frame().x + 100,
    y: window.frame().y,
    width: window.frame().width,
    height: window.frame().height,
  });
  // heartbeatWindow(window);
});

// Window <
Key.on('h', config.MASH_CTRL, () => {
  const window = getCurrentWindow();
  window.setFrame({
    x: window.frame().x - 100,
    y: window.frame().y,
    width: window.frame().width,
    height: window.frame().height,
  });
  // heartbeatWindow(window);
});

// Window ^
Key.on('k', config.MASH_CTRL, () => {
  const window = getCurrentWindow();
  window.setFrame({
    x: window.frame().x,
    y: window.frame().y - 100,
    width: window.frame().width,
    height: window.frame().height,
  });
  // heartbeatWindow(window);
});

// Window v
Key.on('j', config.MASH_CTRL, () => {
  const window = getCurrentWindow();
  window.setFrame({
    x: window.frame().x,
    y: window.frame().y + 100,
    width: window.frame().width,
    height: window.frame().height,
  });
  // heartbeatWindow(window);
});

// Window ^ half
Key.on('up', config.MASH_SHIFT, () => {
  const screen = Screen.main().flippedVisibleFrame();
  const window = Window.focused();

  if (window === undefined) {
    return;
  }

  // x: screen.x + (screen.width / 2) - (window.frame().width / 2),
  // y: screen.y + (screen.height / 2) - (window.frame().height / 2)
  window.setTopLeft({
    x: screen.x,
    y: screen.y,
  });
  window.setSize({
    width: screen.width,
    height: screen.height / 2,
  });
});

// Window v half
Key.on('down', config.MASH_SHIFT, () => {
  const screen = Screen.main().flippedVisibleFrame();
  const window = Window.focused();

  if (window === undefined) {
    return;
  }
  window.setTopLeft({
    x: screen.x,
    y: screen.y + (screen.height / 2),
  });
  window.setSize({
    width: screen.width,
    height: screen.height / 2,
  });
});

// Window < half
Key.on('left', config.MASH_SHIFT, () => {
  const screen = Screen.main().flippedVisibleFrame();
  const window = Window.focused();

  if (window === undefined) {
    return;
  }
  window.setTopLeft({
    x: screen.x,
    y: screen.y,
  });
  window.setSize({
    width: screen.width / 2,
    height: screen.height,
  });
});

// Window > half
Key.on('right', config.MASH_SHIFT, () => {
  const screen = Screen.main().flippedVisibleFrame();
  const window = Window.focused();

  if (window === undefined) {
    return;
  }
  window.setTopLeft({
    x: screen.x + screen.width / 2,
    y: screen.y,
  });
  window.setSize({
    width: screen.width / 2,
    height: screen.height,
  });
});

// Window < 0 margin
Key.on('left', config.MASH_CTRL, () => {
  marginWindow((window: Window, frame: Rectangle) => {
    window.setTopLeft({
      x: frame.x,
      y: window.topLeft().y,
    });
  })
});

// Window > 0 margin
Key.on('right', config.MASH_CTRL, () => {
  marginWindow((window: Window, frame: Rectangle) => {
    window.setTopLeft({
      x: frame.x + (frame.width - window.size().width),
      y: window.topLeft().y,
    });
  })
});

// window auto range by recent
Key.on('\\', config.MASH_SHIFT, () => autoRangeByRecent());

// Previous Window in One Screen
Key.on('k', config.MASH, () => focusWindowInSameScreen(getCurrentWindow(), sortedWindowsOnSameScreen, getPreviousWindowsOnSameScreen));

// Next Window in One Screen
Key.on('j', config.MASH, () => focusWindowInSameScreen(getCurrentWindow(), sortedWindowsOnSameScreen, getNextWindowsOnSameScreen));

/**
 * My Configuartion Mouse
 */

// Central Mouse
Key.on('space', config.MASH, () => setMousePositionForWindowCenter(getCurrentWindow()));

/**
 * Mission Control
 */

// use Mac Keyboard setting
// mash + i
// mash + o

// move window to prev space
Key.on('i', config.MASH_SHIFT, () => moveWindowToSpace(getCurrentWindow(), (space: Space) => space.previous(), -1));

// move window to next space
Key.on('o', config.MASH_SHIFT, () => moveWindowToSpace(getCurrentWindow(), (space: Space) => space.next(), 1));

// move window to park space
Key.on('delete', config.MASH, () => {
  const isFollow = false;
  const window = getCurrentWindow();
  const nextWindowOptional = isFollow ? window : getNextWindowsOnSameScreen(window, sortedWindowsOnSameScreen(window));
  const allSpaces = Space.all();
  const screenCount = Screen.all().length;
  const parkSpaceIndex = PARK_SPACE_APP_INDEX_MAP[window.app().name()] || PARK_SPACE_INDEX_MAP[screenCount];
  // alert(parkSpaceIndex);
  // alert(allSpaces.length);
  // var parkSpaceIndex = PARK_SPACE_INDEX_MAP[screenCount];
  if (parkSpaceIndex >= allSpaces.length) { return; }
  log(`${window}, ${nextWindowOptional}, ${allSpaces[parkSpaceIndex]}`)
  
  // moveWindowToTargetSpace(window, nextWindowOptional, allSpaces[parkSpaceIndex]);
});

// move window to work space
Key.on('return', config.MASH_CTRL, () => {
  const isFollow = true;
  const window = getCurrentWindow();
  const nextWindowOptional = isFollow ? window : getNextWindowsOnSameScreen(window, sortedWindowsOnSameScreen(window));
  const allSpaces = Space.all();
  const screenCount = Screen.all().length;
  if (WORK_SPACE_INDEX_MAP[screenCount] >= allSpaces.length) { return; }
  moveWindowToTargetSpace(window, nextWindowOptional, allSpaces[WORK_SPACE_INDEX_MAP[screenCount]]);
});

// move window to sencond work space
Key.on('return', config.MASH_SHIFT, () => {
  const isFollow = true;
  const window = getCurrentWindow();
  const nextWindow = isFollow ? window : getNextWindowsOnSameScreen(window, sortedWindowsOnSameScreen(window));
  const allSpaces = Space.all();
  const screenCount = Screen.all().length;
  if (SECOND_WORK_SPACE_INDEX_MAP[screenCount] >= allSpaces.length) { return; }
  _.each(window.app().windows(), (x: Window) => {
    // alert(allSpaces[SECOND_WORK_SPACE_INDEX_MAP[screenCount]].hash());
    moveWindowToTargetSpace(x, nextWindow, allSpaces[SECOND_WORK_SPACE_INDEX_MAP[screenCount]]);
  });
});

// move other window in this space to park space
Key.on('delete', config.MASH_SHIFT, () => {
  const window = getCurrentWindow();
  const nextWindow = window;
  const allSpaces = Space.all();
  const otherWindowsInSameSpace = _.filter(window.spaces()[0].windows(), (x) => x.hash() !== window.hash());
  const screenCount = Screen.all().length;
  _.each(otherWindowsInSameSpace, (parkedWindow) => {
    if (window.app().hash() === parkedWindow.app().hash()) {
      return;
    }
    const parkSpaceIndex = PARK_SPACE_APP_INDEX_MAP[parkedWindow.app().name()] || PARK_SPACE_INDEX_MAP[screenCount];
    if (parkSpaceIndex >= allSpaces.length) { return; }
    moveWindowToTargetSpace(parkedWindow, nextWindow, allSpaces[parkSpaceIndex]);
  })
});

// TODO WIP
Event.on('appDidActivate', () => {
  // alert(app.name());
});
// Event.on('windowDidOpen', (window) => {
// alert(window.title());
// });

// Test
Key.on('0', config.MASH, () => {
  log(`mouse x: ${Mouse.location().x}, y: ${Mouse.location().y}`);
  // _.map(App.all(), (app) => { Modal.show(app.title(), 5)});
  // _.map([Window.focused()], (window) => { Modal.show(window.title())}); // current one
  // _.map(Window.all(), (window) => { Modal.show(window.title(), 5)}); // all, include hide
  // _.map(Window.all({visible: true}), (window) => { Modal.show(window.title())}); // all, no hide
  // _.map(Window.recent(), (window) => { Modal.show(window.title())});
  // _.map(Window.focused().others(), (window) => { Modal.show(window.title())}); // no space
  // _.map(Window.focused().windowsOnOtherScreen(), alert_title);
  // _.map(cw.sortByMostRecent(cw.windowsOnOtherScreen()), alert_title);
  // _.map(cw.windowsOnOtherScreen(), alert_title);
  // Modal.show(Window.focused().screen());

  // _.chain(Window.all()).difference(Window.all(visible: true)).map((window) => { Modal.show(window.title())});  // all, include hide
  // Modal.show(_.chain(Window.all()).difference(Window.all(visible: true)).value().length);
  // Modal.show(_.chain(Window.all()).value().length);
  // hide_inactiveWindow(Window.focused().others());
  // var modal = new Modal();
  // modal.message = 'F!';
  // modal.duration = 2;
  // modal.show();
  // var window = Window.focused();
  // var pos = mousePositions[window.hash()];
  // var curPos = Mouse.location();
  // Phoenix.log(String.format('x: {0}, y: {1}, c: {2}, {3}', pos.x, pos.y, curPos.x, curPos.y));

  // var visibleAppMostRecentFirst = _.map(Window.recent(), (w) => { return w.hash(); });
  // var visibleAppMostRecentFirstWithWeight = _.zipObject(visibleAppMostRecentFirst,
  // _.range(visibleAppMostRecentFirst.length));
  // alert(visibleAppMostRecentFirst);
  // alert(visibleAppMostRecentFirstWithWeight['Google Chrome']);
  // alert(visibleAppMostRecentFirstWithWeight['MacDown']);
  // Mouse.move({
  // x: 991,
  // y: 385
  // });
  // Task.run('/usr/local/bin/cliclick', [
  // '-w 200', 'c:847,732', 'kp:delete', 'kp:delete', 'kp:delete', 'c:989,623'
  // ], (handler) => { });
  // Timer.after(0.5, () => {
  // Task.run('/usr/local/bin/cliclick', ['c:971,385'], (handler) => {
  // });
  // });
  // Timer.after(1, () => {
  // Task.run('/usr/local/bin/cliclick', ['c:941,385'], (handler) => {
  // });
  // })
  // alert(cw.spaces().length);
  // App.get('Finder').focus(); // Hack for Screen unfocus
  // cw.focus();
  // cw.focus();
  //

  // alert(_.each(Space.all(), (x) => { x.hash() }));

});

const phoenixApp = App.get('Phoenix');
showTitleModal('Phoenix (re)loaded!', 2, phoenixApp && phoenixApp.icon());

// vim: set ft=javascript sw=2:
