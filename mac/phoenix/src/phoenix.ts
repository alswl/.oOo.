/**
 * Phoenix
 * doc: https://github.com/jasonm23/phoenix/wiki/JavaScript-API-documentation
 *
 * Global Settings
 */

import { alert, alert_title, assert } from './util';
import * as _ from "lodash";
import { moveToScreen, windowsOnOtherScreen } from './screen';
import { sortByMostRecent, getResizeFrame, getSmallerFrame, getLargerFrame, getCurrentWindow } from './window';

let mash: Phoenix.ModifierKey[] = ['alt'];
let mashShift: Phoenix.ModifierKey[] = ['alt', 'shift'];
let mashCtrl: Phoenix.ModifierKey[] = ['alt', 'ctrl'];
let mousePositions: { [name: number]: Point } = {};
let HIDE_INACTIVE_WINDOW_TIME = 10; // minitus
let ACTIVE_WINDOWS_TIMES: { [name: number]: number } = {};
let DEFAULT_WIDTH = 1280;
let WORK_SPACE_INDEX_MAP: { [name: number]: number } = {}; // is a dict, key is display count, val is work space
WORK_SPACE_INDEX_MAP[1] = 0; // one display case
WORK_SPACE_INDEX_MAP[2] = 3; // two display case
let SECOND_WORK_SPACE_INDEX_MAP: { [name: number]: number } = {}; // is a dict, key is display count, val is work space
SECOND_WORK_SPACE_INDEX_MAP[1] = 0; // one display case
SECOND_WORK_SPACE_INDEX_MAP[2] = 0; // two display case
let PARK_SPACE_INDEX_MAP: { [name: number]: number } = {};
PARK_SPACE_INDEX_MAP[1] = 2;
PARK_SPACE_INDEX_MAP[2] = 2;
let PARK_SPACE_APP_INDEX_MAP: { [name: string]: number } = {};
PARK_SPACE_APP_INDEX_MAP['iTerm'] = 0;
PARK_SPACE_APP_INDEX_MAP['Google Chrome'] = 0;
PARK_SPACE_APP_INDEX_MAP['Chromium'] = 0;
PARK_SPACE_APP_INDEX_MAP['Firefox'] = 0;
//PARK_SPACE_APP_INDEX_MAP['Safari'] = 1;
PARK_SPACE_APP_INDEX_MAP['QQ'] = 1;
PARK_SPACE_APP_INDEX_MAP['Dingtalk'] = 1;
PARK_SPACE_APP_INDEX_MAP['WeChat'] = 2;
PARK_SPACE_APP_INDEX_MAP['Electronic WeChat'] = 2;
PARK_SPACE_APP_INDEX_MAP['BearyChat'] = 1;
PARK_SPACE_APP_INDEX_MAP['Mail'] = 2;
PARK_SPACE_APP_INDEX_MAP['Airmail'] = 2;
let A_BIG_PIXEL = 10000;


/**
 * Window Functions
 */

function hide_inactiveWindow(windows: Window[]) {
  var now = new Date().getTime() / 1000;
  _.chain(windows).filter(function (window) {
    if (!ACTIVE_WINDOWS_TIMES[window.app().processIdentifier()]) {
      ACTIVE_WINDOWS_TIMES[window.app().processIdentifier()] = now;
      return false;
    } return true;
  }).filter(function (window) {
    return now - ACTIVE_WINDOWS_TIMES[window.app().processIdentifier()] > HIDE_INACTIVE_WINDOW_TIME * 60;
    //return now - ACTIVE_WINDOWS_TIMES[window.app().pid]> 5;
  }).map(function (window) { window.app().hide() });
}

function heartbeat_window(window: Window) {
  ACTIVE_WINDOWS_TIMES[window.app().processIdentifier()] = new Date().getTime() / 1000;
  //hide_inactiveWindow(window.otherWindowsOnSameScreen());
}

// TODO use a state save status
function getAnotherWindowsOnSameScreen(window: Window, offset: number, isCycle: boolean): Window | null {
  var windows = window.others({ visible: true, screen: window.screen() });
  windows.push(window);
  var screen = window.screen();
  windows = _.chain(windows).sortBy(function (window) {
    return [(A_BIG_PIXEL + window.frame().y - screen.flippedFrame().y) +
      (A_BIG_PIXEL + window.frame().x - screen.flippedFrame().y),
    window.app().processIdentifier(), window.title()].join('');
  }).value();
  if (isCycle) {
    var index = (_.indexOf(windows, window) + offset + windows.length) % windows.length;
  } else {
    var index = _.indexOf(windows, window) + offset;
  }
  //alert(windows.length);
  //alert(_.map(windows, function(x) {return x.title();}).join(','));
  //alert(_.map(windows, function(x) {return x.app().name();}).join(','));
  if (index >= windows.length || index < 0) {
    return null;
  }
  return windows[index];
}

function getPreviousWindowsOnSameScreen(window: Window): Window | null {
  return getAnotherWindowsOnSameScreen(window, -1, false)
};

function getNextWindowsOnSameScreen(window: Window): Window | null {
  return getAnotherWindowsOnSameScreen(window, 1, false)
};

function setWindowCentral(window: Window) {
  window.setTopLeft({
    x: (window.screen().flippedFrame().width - window.size().width) / 2 + window.screen().flippedFrame().x,
    y: (window.screen().flippedFrame().height - window.size().height) / 2 + window.screen().flippedFrame().y
  });
  heartbeat_window(window);
};


/**
 * Mouse Functions
 */

function save_mouse_position_for_window(window: Window) {
  if (!window) return;
  heartbeat_window(window);
  var pos = Mouse.location()
  //pos.y = 800 - pos.y; // fix phoenix 2.x bug
  mousePositions[window.hash()] = pos;
}

function set_mouse_position_for_window_center(window: Window) {
  Mouse.move({
    x: window.topLeft().x + window.frame().width / 2,
    y: window.topLeft().y + window.frame().height / 2
  });
  heartbeat_window(window);
}

function restore_mouse_position_for_window(window: Window) {
  if (!mousePositions[window.hash()]) {
    set_mouse_position_for_window_center(window);
    return;
  }
  var pos = mousePositions[window.hash()];
  var rect = window.frame();
  if (pos.x < rect.x || pos.x > (rect.x + rect.width) || pos.y < rect.y || pos.y > (rect.y + rect.height)) {
    set_mouse_position_for_window_center(window);
    return;
  }
  //Phoenix.log(String.format('x: {0}, y: {1}', pos.x, pos.y));
  Mouse.move(pos);
  heartbeat_window(window);
}

function restore_mouse_position_for_now() {
  let window = Window.focused();
  if (window === undefined) {
    return;
  }
  restore_mouse_position_for_window(window as Window);
}


/**
 * App Functions
 */


//switch app, and remember mouse position
function callApp(appName: string) {
  var windowOptional = Window.focused();
  if (windowOptional) {
    save_mouse_position_for_window(windowOptional as Window);
  }
  var appOptional: App | undefined = App.launch(appName);
  if (appOptional === undefined) {
    return;
  };
  let app = appOptional as App;
  Timer.after(0.300, function () {
    app.focus();
    var newWindow = _.first(app.windows());
    if (newWindow && windowOptional !== newWindow) {
      restore_mouse_position_for_window(newWindow);
    }
  })
}

/**
 * My Configuartion Global
 */

Phoenix.set({
  'daemon': false,
  'openAtLogin': false
});

/**
 * My Configuartion App
 */

// Launch App
Key.on('escape', mash, function () { callApp('iTerm'); });
Key.on('`', mash, function () { callApp('iTerm'); });
Key.on('1', mash, function () { callApp('Google Chrome'); });
//Key.on('1', mash, function() { callApp('Chromium'); });
Key.on('2', mash, function () { callApp('Safari'); });
//Key.on('2', mashShift, function() { callApp('Firefox'); });
Key.on('3', mash, function () { callApp('DingTalk'); });
Key.on('4', mash, function () { callApp('Electronic WeChat'); });
//Key.on('4', mash, function() { callApp('BearyChat'); });
//Key.on('4', mash, function() { callApp('Wechat'); });
//Key.on('6', mash, function() { callApp('企业微信'); });
//Key.on('8', mash, function() { callApp('虾米音乐'); });
Key.on('8', mash, function () { callApp('NeteaseMusic'); });
Key.on('e', mash, function () { callApp('Preview'); });
Key.on('a', mash, function () { callApp('MacVim'); });
//Key.on('a', mash, function() { callApp('Terminal'); });
Key.on('s', mash, function () { callApp('IntelliJ IDEA'); });
Key.on('d', mash, function () { callApp('Visual Studio Code'); });
Key.on('z', mash, function () { callApp('Macdown'); });
//Key.on('z', mash, function() { callApp('Typora'); });
//Key.on('z', mash, function() { callApp('Atom'); });
//Key.on('z', mash, function() { callApp('Sublime Text'); });
//Key.on(',', mash, function() { callApp('Airmail 3'); });
Key.on(',', mash, function () { callApp('Mail'); });
//Key.on('.', mash, function() { callApp('Evernote'); });
Key.on('.', mash, function () { callApp('Tusk'); });
//Key.on('.', mash, function() { callApp('Alternote'); });
Key.on('/', mash, function () { callApp('Finder'); });


/**
 * My Configuartion Screen
 */

function focusAnotherScreen(window: Window, targetScreen: Screen) {
  if (!window) return;
  const currentScreen = window.screen();
  if (window.screen() === targetScreen) return;
  //if (targetScreen.flippedFrame().x < currentScreen.flippedFrame().x) {
  //return;
  //}
  save_mouse_position_for_window(window);
  var targetScreenWindows = sortByMostRecent(targetScreen.windows());
  if (targetScreenWindows.length == 0) {
    return;
  }
  var targetWindow = targetScreenWindows[0]
  targetWindow.focus(); // bug, two window in two space, focus will focus in same space first
  restore_mouse_position_for_window(targetWindow);
  //App.get('Finder').focus(); // Hack for Screen unfocus
}

// Next screen
Key.on('l', mash, function () {
  var window = getCurrentWindow();
  if (window === undefined) {
    return;
  }
  var allScreens = Screen.all();
  var currentScreen = window.screen();
  if (currentScreen === undefined) {
    return; // TODO use mouse to find current screen
  }
  var targetScreen = currentScreen.next();
  if (_.indexOf(_.map(allScreens, function (x) { return x.hash(); }), targetScreen.hash())
    >= _.indexOf(_.map(allScreens, function (x) { return x.hash(); }), currentScreen.hash())) {
    return;
  }
  focusAnotherScreen(window, targetScreen);
});

// Previous Screen
Key.on('h', mash, function () {
  var window = getCurrentWindow();
  if (window === undefined) {
    return;
  }
  var allScreens = Screen.all();
  var currentScreen = window.screen();
  if (currentScreen === undefined) {
    return; // TODO use mouse to find current screen
  }
  var targetScreen = currentScreen.previous();
  if (_.indexOf(_.map(allScreens, function (x) { return x.hash(); }), targetScreen.hash())
    <= _.indexOf(_.map(allScreens, function (x) { return x.hash(); }), currentScreen.hash())) {
    return;
  }
  focusAnotherScreen(window, targetScreen);
});

// Move Current Window to Next Screen
Key.on('l', mashShift, function () {
  var window = getCurrentWindow();
  if (window === undefined) {
    return;
  }
  if (window.screen() === window.screen().next()) return;
  if (window.screen().next().flippedFrame().x < 0) {
    return;
  }
  moveToScreen(window, window.screen().next());
  restore_mouse_position_for_window(window);
  //App.get('Finder').focus(); // Hack for Screen unfocus
  window.focus();
});

// Move Current Window to Previous Screen
Key.on('h', mashShift, function () {
  var window = getCurrentWindow();
  if (window === undefined) {
    return;
  }
  if (window.screen() === window.screen().next()) return;
  if (window.screen().next().flippedFrame().x == 0) {
    return;
  }
  moveToScreen(window, window.screen().previous());
  restore_mouse_position_for_window(window);
  //App.get('Finder').focus(); // Hack for Screen unfocus
  window.focus();
});


/**
 * My Configuartion Window
 */

// Window Hide Inactive
//Key.on('delete', mash, function() {
//var window = Window.focused();
//if (!window) return;
//heartbeat_window(window);
//hide_inactiveWindow(window.others());
//});

// Window Maximize
Key.on('m', mashShift, function () {
  var window = getCurrentWindow();
  if (window === undefined) {
    return;
  }

  window.maximize();
  setWindowCentral(window);
  //heartbeat_window(window);
});

// Window Smaller
Key.on('-', mash, function () {
  var window = getCurrentWindow();
  if (window === undefined) {
    return;
  }
  var oldFrame: Rectangle = window.frame();
  var frame: Rectangle = getSmallerFrame(oldFrame);
  window.setFrame(frame);
  if (window.frame().width == oldFrame.width || window.frame().height == oldFrame.height) {
    window.setFrame(oldFrame);
  }
  //heartbeat_window(window);
});

// Window Larger
Key.on('=', mash, function () {
  var window = getCurrentWindow();
  if (window === undefined) {
    return;
  }
  var frame = getLargerFrame(window.frame());
  if (frame.width > window.screen().flippedFrame().width ||
    frame.height > window.screen().flippedFrame().height) {
    window.maximize();
  } else {
    window.setFrame(frame);
  }
  //heartbeat_window(window);
});

// Window Central
Key.on('m', mash, function () {
  var window = getCurrentWindow();
  if (window === undefined) {
    return;
  }
  setWindowCentral(window);
});

// Window Height Max
Key.on('\\', mash, function () {
  var window = getCurrentWindow();
  if (window === undefined) {
    return;
  }
  window.setFrame({
    x: window.frame().x,
    y: window.screen().flippedFrame().y,
    width: window.frame().width,
    height: window.screen().flippedFrame().height
  });
  heartbeat_window(window);
});

// Window Width Max
//Key.on('\\', mashShift, function() {
//var window = getCurrentWindow();
//if (window === undefined) {
//return;
//}
//window.setFrame({
//x: window.screen().flippedFrame().x,
//y: window.frame().y,
//width: window.screen().flippedFrame().width,
//height: window.frame().height
//});
//heartbeat_window(window);
//});

// Window width <<
Key.on(',', mashShift, function () {
  var screen = Screen.main()
  var rectangle = screen.flippedVisibleFrame();
  var window = Window.focused();
  if (window === undefined) {
    return;
  }

  window.setTopLeft({
    x: window.topLeft().x - 200,
    y: window.topLeft().y
  });
  window.setSize({
    width: window.size().width + 200,
    height: window.size().height
  });
});

// Window width >>
Key.on('.', mashShift, function () {
  var screen = Screen.main()
  var rectangle = screen.flippedVisibleFrame();
  var window = Window.focused();
  if (window === undefined) {
    return;
  }

  window.setSize({
    width: window.size().width + 200,
    height: window.size().height
  });
});

// Window <
Key.on('h', mashCtrl, function () {
  var window = getCurrentWindow();
  if (window === undefined) {
    return;
  }
  window.setFrame({
    x: window.frame().x - 100,
    y: window.frame().y,
    width: window.frame().width,
    height: window.frame().height
  });
  heartbeat_window(window);
});

// Window >
Key.on('l', mashCtrl, function () {
  var window = getCurrentWindow();
  if (window === undefined) {
    return;
  }
  window.setFrame({
    x: window.frame().x + 100,
    y: window.frame().y,
    width: window.frame().width,
    height: window.frame().height
  });
  heartbeat_window(window);
});

// Window <
Key.on('h', mashCtrl, function () {
  var window = getCurrentWindow();
  if (window === undefined) {
    return;
  }
  window.setFrame({
    x: window.frame().x - 100,
    y: window.frame().y,
    width: window.frame().width,
    height: window.frame().height
  });
  heartbeat_window(window);
});

// Window ^
Key.on('k', mashCtrl, function () {
  var window = getCurrentWindow();
  if (window === undefined) {
    return;
  }
  window.setFrame({
    x: window.frame().x,
    y: window.frame().y - 100,
    width: window.frame().width,
    height: window.frame().height
  });
  heartbeat_window(window);
});

// Window v
Key.on('j', mashCtrl, function () {
  var window = getCurrentWindow();
  if (window === undefined) {
    return;
  }
  window.setFrame({
    x: window.frame().x,
    y: window.frame().y + 100,
    width: window.frame().width,
    height: window.frame().height
  });
  heartbeat_window(window);
});

// Window ^ half
Key.on('up', mashShift, function () {
  var screen = Screen.main().flippedVisibleFrame();
  var window = Window.focused();

  if (window === undefined) {
    return;
  }

  //x: screen.x + (screen.width / 2) - (window.frame().width / 2),
  //y: screen.y + (screen.height / 2) - (window.frame().height / 2)
  window.setTopLeft({
    x: screen.x,
    y: screen.y
  });
  window.setSize({
    width: screen.width,
    height: screen.height / 2
  });
});

// Window v half
Key.on('down', mashShift, function () {
  var screen = Screen.main().flippedVisibleFrame();
  var window = Window.focused();

  if (window === undefined) {
    return;
  }
  window.setTopLeft({
    x: screen.x,
    y: screen.y + (screen.height / 2)
  });
  window.setSize({
    width: screen.width,
    height: screen.height / 2
  });
});

// Window < half
Key.on('left', mashShift, function () {
  var screen = Screen.main().flippedVisibleFrame();
  var window = Window.focused();

  if (window === undefined) {
    return;
  }
  window.setTopLeft({
    x: screen.x,
    y: screen.y
  });
  window.setSize({
    width: screen.width / 2,
    height: screen.height
  });
});

// Window > half
Key.on('right', mashShift, function () {
  var screen = Screen.main().flippedVisibleFrame();
  var window = Window.focused();

  if (window === undefined) {
    return;
  }
  window.setTopLeft({
    x: screen.x + screen.width / 2,
    y: screen.y
  });
  window.setSize({
    width: screen.width / 2,
    height: screen.height
  });
});

// Window < 0 margin
Key.on('left', mashCtrl, function () {
  var screen = Screen.main().flippedVisibleFrame();
  var window = Window.focused();

  if (window === undefined) {
    return;
  }
  window.setTopLeft({
    x: screen.x,
    y: screen.y
  });
});

// Window > 0 margin
Key.on('right', mashCtrl, function () {
  var screen = Screen.main().flippedVisibleFrame();
  var window = Window.focused();

  if (window === undefined) {
    return;
  }
  window.setTopLeft({
    x: screen.x + (screen.width - window.size().width),
    y: screen.y
  });
});

// window auto range by recent
Key.on('\\', mashShift, function () {
  var screen = Screen.main()
  var rectangle = screen.flippedVisibleFrame();

  const windows: Window[] = sortByMostRecent(screen.windows({ visible: true }));
  _.map(windows, (window, index) => {
    window.setTopLeft({
      x: rectangle.x + index * 100,
      y: rectangle.y
    });
    window.setSize({
      width: window.size().width,
      height: rectangle.height
    });
  });
});


// Previous Window in One Screen
Key.on('k', mash, function () {
  const window = Window.focused();
  if (!window) {
    if (Window.recent().length == 0) return;
    Window.recent()[0].focus();
    return;
  }
  const screen = Screen.main()
  const visibleWindows = screen.windows({ visible: true });
  const rectangle = screen.flippedVisibleFrame();
  save_mouse_position_for_window(window);
  const targetWindow = getPreviousWindowsOnSameScreen(window);
  if (!targetWindow) {
    return;
  }
  targetWindow.focus();
  restore_mouse_position_for_window(targetWindow);
  display_all_visiable_window_modal(visibleWindows, targetWindow, rectangle);
});

// Next Window in One Screen
Key.on('j', mash, function () {
  var window = Window.focused();
  if (!window) {
    if (Window.recent().length == 0) return;
    Window.recent()[0].focus();
    return;
  }
  const screen = Screen.main()
  const visibleWindows = screen.windows({ visible: true });
  const rectangle = screen.flippedVisibleFrame();
  save_mouse_position_for_window(window);
  var targetWindow = getNextWindowsOnSameScreen(window); // <- most time cost
  if (!targetWindow) {
    return;
  }
  targetWindow.focus();
  restore_mouse_position_for_window(targetWindow);
  display_all_visiable_window_modal(visibleWindows, targetWindow, rectangle);
});


/**
 * My Configuartion Mouse
 */

// Central Mouse
Key.on('space', mash, function () {
  var window = getCurrentWindow();
  if (window === undefined) {
    return;
  }
  set_mouse_position_for_window_center(window);
});


/**
 * Mission Control
 */

// use Mac Keyboard setting
// mash + i
// mash + o

// move window to prev space
Key.on('i', mashShift, function () {
  var window = getCurrentWindow();
  if (window === undefined) {
    return;
  }
  if (window.isFullScreen() || window.isMinimized()) return;
  var currentOptional: Space | undefined = Space.active();
  if (currentOptional === undefined) {
    return;
  }
  let current = currentOptional as Space;
  var allSpaces: Space[] = Space.all();
  var previousOptinal = current.previous();
  if (previousOptinal === undefined) {
    return;
  }
  let previous = previousOptinal as Space;
  if (previous.isFullScreen()) return;
  if (previous.screens().length == 0) return;
  if (previous.screens()[0].hash() != current.screens()[0].hash()) {
    return;
  }
  if (_.indexOf(_.map(allSpaces, function (x) { return x.hash(); }), previous.hash())
    >= _.indexOf(_.map(allSpaces, function (x) { return x.hash(); }), current.hash())) {
    return;
  }
  current.removeWindows([window]);
  previous.addWindows([window]);
  var prevWindow = getPreviousWindowsOnSameScreen(window);
  if (prevWindow) {
    prevWindow.focus();
  }
});

// move window to next space
Key.on('o', mashShift, function () {
  var window = getCurrentWindow();
  if (window === undefined) {
    return;
  }
  if (window.isFullScreen() || window.isMinimized()) return;
  var currentOptional: Space | undefined = Space.active();
  if (currentOptional === undefined) {
    return;
  }
  let current = currentOptional as Space;
  var allSpaces = Space.all();
  var nextOptional: Space | undefined = current.next();
  if (nextOptional === undefined) return;
  let next = nextOptional as Space;
  if (next.isFullScreen()) return;
  if (next.screens().length == 0) return;
  if (next.screens()[0].hash() != current.screens()[0].hash()) {
    return;
  }
  if (_.indexOf(_.map(allSpaces, function (x) { return x.hash(); }), next.hash())
    <= _.indexOf(_.map(allSpaces, function (x) { return x.hash(); }), current.hash())) {
    return;
  }
  current.removeWindows([window]);
  next.addWindows([window]);
  var nextWindow = getNextWindowsOnSameScreen(window);
  if (nextWindow) {
    nextWindow.focus();
  }
});


function moveWindowToTargetSpace(window: Window, nextWindow: Window | null, allSpaces: Space[], spaceIndex: number) {
  var targetSpace = allSpaces[spaceIndex];
  var currentSpaceOptional = Space.active();
  if (currentSpaceOptional === undefined) return;
  let currentSpace = currentSpaceOptional as Space;
  //_.map(targetSpace.windows(), function(w) { alert(w.title()); } );

  if (currentSpace.screens()[0].hash() != targetSpace.screens()[0].hash()) {
    moveToScreen(window, targetSpace.screens()[0]);
  }
  currentSpace.removeWindows([window]);
  targetSpace.addWindows([window]);
  if (nextWindow) {
    //App.get('Finder').focus(); // Hack for Screen unfocus
    //nextWindow.raise();
    nextWindow.focus();
    restore_mouse_position_for_window(nextWindow);
  }
};

// move window to park space
Key.on('delete', mash, function () {
  var isFollow = false;
  var windowOptional = getCurrentWindow();
  if (windowOptional === undefined) {
    return;
  }
  let window = windowOptional as Window;
  var nextWindowOptional = isFollow ? window : getNextWindowsOnSameScreen(window);
  var allSpaces = Space.all();
  var screenCount = Screen.all().length;
  var parkSpaceIndex = PARK_SPACE_APP_INDEX_MAP[window.app().name()] || PARK_SPACE_INDEX_MAP[screenCount];
  //alert(parkSpaceIndex);
  //alert(allSpaces.length);
  //var parkSpaceIndex = PARK_SPACE_INDEX_MAP[screenCount];
  if (parkSpaceIndex >= allSpaces.length) return;
  moveWindowToTargetSpace(window, nextWindowOptional, allSpaces, parkSpaceIndex);
});

// move window to work space
Key.on('return', mashCtrl, function () {
  var isFollow = true;
  var window = getCurrentWindow();
  if (window === undefined) {
    return;
  }
  var nextWindowOptional = isFollow ? window : getNextWindowsOnSameScreen(window);
  var allSpaces = Space.all();
  var screenCount = Screen.all().length;
  if (WORK_SPACE_INDEX_MAP[screenCount] >= allSpaces.length) return;
  moveWindowToTargetSpace(window, nextWindowOptional, allSpaces, WORK_SPACE_INDEX_MAP[screenCount]);
});

// move window to sencond work space
Key.on('return', mashShift, function () {
  var isFollow = true;
  var window = getCurrentWindow();
  if (window === undefined) {
    return;
  }
  var nextWindow = isFollow ? window : getNextWindowsOnSameScreen(window);
  var allSpaces = Space.all();
  var screenCount = Screen.all().length;
  if (SECOND_WORK_SPACE_INDEX_MAP[screenCount] >= allSpaces.length) return;
  _.each(window.app().windows(), function (window) {
    //alert(allSpaces[SECOND_WORK_SPACE_INDEX_MAP[screenCount]].hash());
    moveWindowToTargetSpace(window, nextWindow, allSpaces, SECOND_WORK_SPACE_INDEX_MAP[screenCount]);
  });
});

// move other window in this space to park space
Key.on('delete', mashShift, function () {
  var isFollow = false;
  var windowOptional: Window | undefined = getCurrentWindow();
  if (windowOptional === undefined) {
    return;
  }
  let window = windowOptional as Window;
  var nextWindow = window;
  var allSpaces = Space.all();
  var otherWindowsInSameSpace = _.filter(window.spaces()[0].windows(), function (x) { return x.hash() != window.hash(); });
  var screenCount = Screen.all().length;
  _.each(otherWindowsInSameSpace, function (parkedWindow) {
    if (window.app().hash() === parkedWindow.app().hash()) {
      return;
    }
    var parkSpaceIndex = PARK_SPACE_APP_INDEX_MAP[parkedWindow.app().name()] || PARK_SPACE_INDEX_MAP[screenCount];
    if (parkSpaceIndex >= allSpaces.length) return;
    moveWindowToTargetSpace(parkedWindow, nextWindow, allSpaces, parkSpaceIndex);
  })
});

// TODO WIP
Event.on('appDidActivate', (app) => {
  // alert(app.name());
});
//Event.on('windowDidOpen', (window) => {
//alert(window.title());
//});

function display_all_visiable_window_modal(windows: Window[], window: Window, rectangle: Rectangle) {
  const modal = Modal.build({
    appearance: 'dark',
    text: _.chain(windows)
      .map(x => window.hash() === x.hash() ? '[[' + x.app().name() + ']]' : ' ' + x.app().name() + ' ')
      .join('     ')
      .value(),
    duration: 1,
    // animationDuration: 0,
    weight: 18,
    origin: function (frame) {
      return {
        x: rectangle.x + (rectangle.width / 2) - (frame.width / 2),
        //y: rectangle.y + (rectangle.height / 2) - (frame.height / 2)
        y: rectangle.y + rectangle.height - (frame.height / 2)
      }
    }
  }).show();
};


// Test
Key.on('0', mash, function () {
  //_.map(App.all(), function(app) { Modal.show(app.title(), 5)});
  //_.map([Window.focused()], function(window) { Modal.show(window.title())}); // current one
  //_.map(Window.all(), function(window) { Modal.show(window.title(), 5)}); // all, include hide
  //_.map(Window.all({visible: true}), function(window) { Modal.show(window.title())}); // all, no hide
  //_.map(Window.recent(), function(window) { Modal.show(window.title())});
  //_.map(Window.focused().others(), function(window) { Modal.show(window.title())}); // no space
  //_.map(Window.focused().windowsOnOtherScreen(), alert_title);
  //_.map(cw.sortByMostRecent(cw.windowsOnOtherScreen()), alert_title);
  //_.map(cw.windowsOnOtherScreen(), alert_title);
  //Modal.show(Window.focused().screen());

  //_.chain(Window.all()).difference(Window.all(visible: true)).map(function(window) { Modal.show(window.title())});  // all, include hide
  //Modal.show(_.chain(Window.all()).difference(Window.all(visible: true)).value().length);
  //Modal.show(_.chain(Window.all()).value().length);
  //hide_inactiveWindow(Window.focused().others());
  //var modal = new Modal();
  //modal.message = 'F!';
  //modal.duration = 2;
  //modal.show();
  //var window = Window.focused();
  //var pos = mousePositions[window.hash()];
  //var curPos = Mouse.location();
  //Phoenix.log(String.format('x: {0}, y: {1}, c: {2}, {3}', pos.x, pos.y, curPos.x, curPos.y));

  //var visibleAppMostRecentFirst = _.map(Window.recent(), function(w) { return w.hash(); });
  //var visibleAppMostRecentFirstWithWeight = _.zipObject(visibleAppMostRecentFirst,
  //_.range(visibleAppMostRecentFirst.length));
  //alert(visibleAppMostRecentFirst);
  //alert(visibleAppMostRecentFirstWithWeight['Google Chrome']);
  //alert(visibleAppMostRecentFirstWithWeight['MacDown']);
  //Mouse.move({
  //x: 991,
  //y: 385
  //});
  //Task.run('/usr/local/bin/cliclick', [
  //'-w 200', 'c:847,732', 'kp:delete', 'kp:delete', 'kp:delete', 'c:989,623'
  //], function(handler) { });
  //Timer.after(0.5, function() {
  //Task.run('/usr/local/bin/cliclick', ['c:971,385'], function(handler) {
  //});
  //});
  //Timer.after(1, function() {
  //Task.run('/usr/local/bin/cliclick', ['c:941,385'], function(handler) {
  //});
  //})
  //alert(cw.spaces().length);
  //App.get('Finder').focus(); // Hack for Screen unfocus
  //cw.focus();
  //cw.focus();
  //

  //alert(_.each(Space.all(), function(x) { x.hash() }));

});

// vim: set ft=javascript sw=2:

