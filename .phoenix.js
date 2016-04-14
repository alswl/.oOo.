/**
 * Phoenix
 * doc: https://github.com/jasonm23/phoenix/wiki/JavaScript-API-documentation
 *
 * Global Settings
 */

var keys = [];

var mash = ["alt"];
var mashShift = ["alt", "shift"];
var mashCtrl = ["alt", "ctrl"];
var mashCmd = ["alt", "cmd"];
var mousePositions = {};
var HIDE_INACTIVE_WINDOW_TIME = 10;  // minitus
var ACTIVE_WINDOWS_TIMES = {};
var DEFAULT_WIDTH = 1280;
var WORK_SPACE_INDEX_MAP = {};  // is a dict, key is display count, val is work space
WORK_SPACE_INDEX_MAP[1] = 0;  // one display case
WORK_SPACE_INDEX_MAP[2] = 3;  // two display case
var PARK_SPACE_INDEX_MAP = {};
PARK_SPACE_INDEX_MAP[1] = 2;
PARK_SPACE_INDEX_MAP[2] = 2;
var PARK_SPACE_APP_INDEX_MAP = {};
PARK_SPACE_APP_INDEX_MAP['iTerm'] = 0;
PARK_SPACE_APP_INDEX_MAP['Safari'] = 1;
PARK_SPACE_APP_INDEX_MAP['QQ'] = 1;
PARK_SPACE_APP_INDEX_MAP['BearyChat'] = 1;


/**
 * Utils Functions
 */

function alert(message) {
  var modal = new Modal();
  modal.message = message;
  modal.duration = 2;
  modal.show();
}

function assert(condition, message) {
  if (!condition) {
    throw message || "Assertion failed";
  }
}

if (!String.format) {
  String.format = function(format) {
    var args = Array.prototype.slice.call(arguments, 1);
    return format.replace(/{(\d+)}/g, function(match, number) { 
      return typeof args[number] != 'undefined'
      ? args[number] 
      : match
      ;
    });
  };
}

var alert_title = function(window) { Modal.show(window.title()); };

function sortByMostRecent(windows) {
  var visibleAppMostRecentFirst = _.map(Window.visibleWindowsInOrder(),
                                        function(w) { return w.hash(); });
  var visibleAppMostRecentFirstWithWeight = _.object(visibleAppMostRecentFirst,
                                                     _.range(visibleAppMostRecentFirst.length));
  return _.sortBy(windows, function(window) { return visibleAppMostRecentFirstWithWeight[window.hash()]; });
};

function getNewFrame(frame, oldScreenRect, newScreenRect) {
}

function getResizeFrame(frame, ratio) {
  var mid_pos_x = frame.x + 0.5 * frame.width;
  var mid_pos_y = frame.y + 0.5 * frame.height;
  return {
    x: Math.round(frame.x + frame.width / 2 * (1 - ratio)),
    y: Math.round(frame.y + frame.height / 2 * (1 - ratio)),
    width: Math.round(frame.width * ratio),
    height: Math.round(frame.height * ratio)
  }
}

function getSmallerFrame(frame) {
  return getResizeFrame(frame, 0.9);
}

function getLargerFrame(frame) {
  return getResizeFrame(frame, 1.1);
}

/**
 * Screen Functions
 */

function moveToScreen(window, screen) {
  if (!window) return;
  if (!screen) return;

  var frame = window.frame();
  var oldScreenRect = window.screen().visibleFrameInRectangle();
  var newScreenRect = screen.visibleFrameInRectangle();
  var xRatio = newScreenRect.width / oldScreenRect.width;
  var yRatio = newScreenRect.height / oldScreenRect.height;

  var mid_pos_x = frame.x + Math.round(0.5 * frame.width);
  var mid_pos_y = frame.y + Math.round(0.5 * frame.height);

  window.setFrame({
    x: (mid_pos_x - oldScreenRect.x) * xRatio + newScreenRect.x - 0.5 * frame.width,
    y: (mid_pos_y - oldScreenRect.y) * yRatio + newScreenRect.y - 0.5 * frame.height,
    width: frame.width,
    height: frame.height
  });
};

function windowsOnOtherScreen() {
  var otherWindowsOnSameScreen = Window.focusedWindow().otherWindowsOnSameScreen();  // slow
  var otherWindowTitlesOnSameScreen = _.map(otherWindowsOnSameScreen , function(w) { return w.title(); });
  var return_value = _.chain(Window.focusedWindow().otherWindowsOnAllScreens())
    .filter(function(window) { return ! _.contains(otherWindowTitlesOnSameScreen, window.title()); })
    .value();
  return return_value;
};


/**
 * Window Functions
 */

function hide_inactiveWindow(windows) {
  var now = new Date().getTime() / 1000;
  _.chain(windows).filter(function(window) {
    if (!ACTIVE_WINDOWS_TIMES[window.app().pid]) {
      ACTIVE_WINDOWS_TIMES[window.app().pid] = now;
      return false;
    } return true;
  }).filter(function(window) {
    return now - ACTIVE_WINDOWS_TIMES[window.app().pid]> HIDE_INACTIVE_WINDOW_TIME * 60;
    //return now - ACTIVE_WINDOWS_TIMES[window.app().pid]> 5;
  }).map(function(window) {window.app().hide()});
}

function heartbeat_window(window) {
  ACTIVE_WINDOWS_TIMES[window.app().pid] = new Date().getTime() / 1000;
  //hide_inactiveWindow(window.otherWindowsOnSameScreen());
}

function getAnotherWindowsOnSameScreen(window, offset) {
  var windows = window.otherWindowsOnSameScreen(); // slow, makes `Saved spin report for Phoenix version 1.2 (1.2) to /Library/Logs/DiagnosticReports/Phoenix_2015-05-30-170354_majin.spin`
  windows.push(window);
  windows = _.chain(windows).sortBy(function(window) {
    return [window.frame().x, window.frame().y, window.app().pid, window.title()].join('_');
  }).value().reverse();
  return windows[(_.indexOf(windows, window) + offset + windows.length) % windows.length];
}

function getPreviousWindowsOnSameScreen(window) {
  return getAnotherWindowsOnSameScreen(window, -1)
};

function getNextWindowsOnSameScreen(window) {
  return getAnotherWindowsOnSameScreen(window, 1)
};

function setWindowCentral(window) {
  window.setTopLeft({
    x: (window.screen().frameInRectangle().width - window.size().width) / 2 + window.screen().frameInRectangle().x,
    y: (window.screen().frameInRectangle().height - window.size().height) / 2 + window.screen().frameInRectangle().y
  });
  heartbeat_window(window);
};


/**
 * Mouse Functions
 */

function save_mouse_position_for_window(window) {
  if (!window) return;
  heartbeat_window(window);
  var pos = Mouse.location()
  //pos.y = 800 - pos.y;  // fix phoenix 2.x bug
  mousePositions[window.hash()] = pos;
}

function set_mouse_position_for_window_center(window) {
  Mouse.moveTo({
    x: window.topLeft().x + window.frame().width / 2,
    y: window.topLeft().y + window.frame().height / 2
  });
  heartbeat_window(window);
}

function restore_mouse_position_for_window(window) {
  if (!mousePositions[window.hash()]) {
    set_mouse_position_for_window_center(window);
    return;
  }
  var pos = mousePositions[window.hash()];
  var rect = window.frame();
  if (pos.x < rect.x || pos.x > (rect.x + rect.width) || pos.y < rect.y || pos. y > (rect.y + rect.height)) {
    set_mouse_position_for_window_center(window);
    return;
  }
  //Phoenix.log(String.format('x: {0}, y: {1}', pos.x, pos.y));
  Mouse.moveTo(pos);
  heartbeat_window(window);
}

function restore_mouse_position_for_now() {
  if (Window.focusedWindow() === undefined) {
    return;
  }
  restore_mouse_position_for_window(Window.focusedWindow());
}


/**
 * App Functions
 */

function launchOrFocus(appName) {
  var app = App.launch(appName);
  assert(app !== undefined);
  app.focus();
  return app;
}

//switch app, and remember mouse position
function callApp(appName) {
  var window = Window.focusedWindow();
  if (window) {
    save_mouse_position_for_window(window);
  }
  //App.launch(appName);
  var newWindow = _.first(launchOrFocus(appName).windows());
  if (newWindow && window !== newWindow) {
    restore_mouse_position_for_window(newWindow);
  }
}

/**
 * My Configuartion Global
 */

Phoenix.set({
    'daemon': true,
    'openAtLogin': true
});

/**
 * My Configuartion App
 */

// Launch App
keys.push(Phoenix.bind('`', mash, function() { callApp('iTerm'); }));
keys.push(Phoenix.bind('1', mash, function() { callApp('Google Chrome'); }));
//keys.push(Phoenix.bind('1', mash, function() { callApp('Chromium'); }));
//var handler_mash_1 = Phoenix.bind('1', mash, function() { callApp('FirefoxDeveloperEdition'); });
keys.push(Phoenix.bind('2', mash, function() { callApp('Safari'); }));
keys.push(Phoenix.bind('2', mashShift, function() { callApp('Firefox'); }));
//var handler_mashShift_2 = Phoenix.bind('2', mashShift, function() { callApp('Chromium'); });
keys.push(Phoenix.bind('3', mash, function() { callApp('QQ'); }));
keys.push(Phoenix.bind('4', mash, function() { callApp('BearyChat'); }));
keys.push(Phoenix.bind('8', mash, function() { callApp('Wechat'); }));
keys.push(Phoenix.bind('e', mash, function() { callApp('Preview'); }));
keys.push(Phoenix.bind('a', mash, function() { callApp('MacVim'); }));
//var handler_mash_s = Phoenix.bind('s', mash, function() { callApp('IntelliJ IDEA 15 CE'); });
//keys.push(Phoenix.bind('s', mash, function() { callApp('IntelliJ IDEA 14'); }));
keys.push(Phoenix.bind('s', mash, function() { callApp('IntelliJ IDEA'); }));
//var handler_mash_z = Phoenix.bind('z', mash, function() { callApp('Mou'); });
keys.push(Phoenix.bind('z', mash, function() { callApp('Macdown'); }));
//var handler_mash_z = Phoenix.bind('z', mash, function() { callApp('Typora'); });
//var handler_mash_z = Phoenix.bind('z', mash, function() { callApp('Typora'); });
//var handler_mash_z = Phoenix.bind('z', mash, function() { callApp('Atom'); });
//var handler_mash_comma = Phoenix.bind(',', mash, function() { callApp('Airmail 2'); });
keys.push(Phoenix.bind(',', mash, function() { callApp('Mail'); }));
keys.push(Phoenix.bind('9', mash, function() { callApp('NeteaseMusic'); }));
//var handler_mash_, = Phoenix.bind(',', mash, function() { callApp('Sparrow'); });
//var handler_mash_, = Phoenix.bind(',', mash, function() { callApp('Inky'); });
keys.push(Phoenix.bind('.', mash, function() { callApp('Evernote'); }));
//keys.push(Phoenix.bind('.', mash, function() { callApp('Alternote'); }));
keys.push(Phoenix.bind('/', mash, function() { callApp('Finder'); }));


/**
 * My Configuartion Screen
 */

function focusAnotherScreen(window, targetScreen) {
  if (!window) return;
  var currentScreen = window.screen();
  if (window.screen() === targetScreen) return;
  //if (targetScreen.frameInRectangle().x < currentScreen.frameInRectangle().x) {
    //return;
  //}
  save_mouse_position_for_window(window);
  var targetScreenWindows = sortByMostRecent(targetScreen.windows());
  if (targetScreenWindows.length == 0) {
    return;
  }
  var targetWindow = targetScreenWindows[0]
  targetWindow.focus();  // bug, two window in two space, focus will focus in same space first
  restore_mouse_position_for_window(targetWindow);
}

// Next screen
keys.push(Phoenix.bind('l', mash, function() {
  var window = Window.focusedWindow();
  var allScreens = Screen.screens();
  var currentScreen = window.screen();
  var targetScreen = window.screen().next();
  if (_.indexOf(_.map(allScreens, function(x) { return x.hash(); }), targetScreen.hash())
	  >= _.indexOf(_.map(allScreens, function(x) { return x.hash(); }), currentScreen.hash())) {
		return;
	  }
	  focusAnotherScreen(window, targetScreen);
}));

// Previous Screen
keys.push(Phoenix.bind('h', mash, function() {
  var window = Window.focusedWindow();
  var allScreens = Screen.screens();
  var currentScreen = window.screen();
  var targetScreen = window.screen().previous();
  if (_.indexOf(_.map(allScreens, function(x) { return x.hash(); }), targetScreen.hash())
	  <= _.indexOf(_.map(allScreens, function(x) { return x.hash(); }), currentScreen.hash())) {
		return;
	  }
  focusAnotherScreen(window, targetScreen);
}));

// Move Current Window to Next Screen
keys.push(Phoenix.bind('l', mashShift, function() {
  var window = Window.focusedWindow();
  if (!window) return;
  if (window.screen() === window.screen().next()) return;
  if (window.screen().next().frameInRectangle().x < 0) {
    return;
  }
  moveToScreen(window, window.screen().next());
  restore_mouse_position_for_window(window);
}));

// Move Current Window to Previous Screen
keys.push(Phoenix.bind('h', mashShift, function() {
  var window = Window.focusedWindow();
  if (!window) return;
  if (window.screen() === window.screen().next()) return;
  if (window.screen().next().frameInRectangle().x == 0) {
    return;
  }
  moveToScreen(window, window.screen().previous());
  restore_mouse_position_for_window(window);
}));


/**
 * My Configuartion Window
 */

// Window Hide Inactive
keys.push(Phoenix.bind('delete', mash, function() {
  var window = Window.focusedWindow();
  if (!window) return;
  heartbeat_window(window);
  hide_inactiveWindow(window.otherWindowsOnAllScreens());
}));

// Window Maximize
keys.push(Phoenix.bind('m', mashShift, function() {
  var window = Window.focusedWindow();
  if (!window) return;
  window.maximize();
  setWindowCentral(window);
  //heartbeat_window(window);
}));

// Window Smaller
keys.push(Phoenix.bind('-', mash, function() {
  var window = Window.focusedWindow();
  if (!window) return;
  var oldFrame = window.frame();
  var frame = getSmallerFrame(oldFrame);
  window.setFrame(frame);
  if (window.frame().width == oldFrame.width || window.frame().height == oldFrame.height) {
    window.setFrame(oldFrame);
  }
  //heartbeat_window(window);
}));

// Window Larger
keys.push(Phoenix.bind('=', mash, function() {
  var window = Window.focusedWindow();
  if (!window) return;
  var frame = getLargerFrame(window.frame());
  if (frame.width > window.screen().frameInRectangle().width ||
      frame.height > window.screen().frameInRectangle().height) {
    window.maximize();
  } else {
    window.setFrame(frame);
  }
  //heartbeat_window(window);
}));

// Window Central
keys.push(Phoenix.bind('m', mash, function() {
  var window = Window.focusedWindow();
  if (!window) return;
  setWindowCentral(window);
}));

// Window Height
keys.push(Phoenix.bind('\\', mash, function() {
  var window = Window.focusedWindow();
  if (!window) return;
  window.setFrame({
    x: window.frame().x,
    y: window.screen().frameInRectangle().y,
    width: window.frame().width,
    height: window.screen().frameInRectangle().height
  });
  heartbeat_window(window);
}));

// Window Width
keys.push(Phoenix.bind('\\', mashShift, function() {
  var window = Window.focusedWindow();
  if (!window) return;
  window.setFrame({
    x: window.frame().x,
    y: window.screen().frameInRectangle().y,
    width: DEFAULT_WIDTH,  // Mac width
    height: window.frame().height
  });
  heartbeat_window(window);
}));

// Window >
keys.push(Phoenix.bind('l', mashCtrl, function() {
  var window = Window.focusedWindow();
  if (!window) return;
  window.setFrame({
    x: window.frame().x + 100,
    y: window.frame().y,
    width: window.frame().width,
    height: window.frame().height
  });
  heartbeat_window(window);
}));

// Window <
keys.push(Phoenix.bind('h', mashCtrl, function() {
  var window = Window.focusedWindow();
  if (!window) return;
  window.setFrame({
    x: window.frame().x - 100,
    y: window.frame().y,
    width: window.frame().width,
    height: window.frame().height
  });
  heartbeat_window(window);
}));

// Window ^
keys.push(Phoenix.bind('k', mashCtrl, function() {
  var window = Window.focusedWindow();
  if (!window) return;
  window.setFrame({
    x: window.frame().x,
    y: window.frame().y - 100,
    width: window.frame().width,
    height: window.frame().height
  });
  heartbeat_window(window);
}));

// Window v
keys.push(Phoenix.bind('j', mashCtrl, function() {
  var window = Window.focusedWindow();
  if (!window) return;
  window.setFrame({
    x: window.frame().x,
    y: window.frame().y + 100,
    width: window.frame().width,
    height: window.frame().height
  });
  heartbeat_window(window);
}));

// Previous Window in One Screen
keys.push(Phoenix.bind('k', mash, function() {
  var window = Window.focusedWindow();
  if (!window) {
    if (Window.visibleWindowsInOrder().length == 0) return;
    Window.visibleWindowsInOrder()[0].focus();
    return;
  }
  save_mouse_position_for_window(window);
  var targetWindow = getPreviousWindowsOnSameScreen(window);
  targetWindow.focus();
  restore_mouse_position_for_window(targetWindow);
}));

// Next Window in One Screen
keys.push(Phoenix.bind('j', mash, function() {
  var window = Window.focusedWindow();
  if (!window) {
    if (Window.visibleWindowsInOrder().length == 0) return;
    Window.visibleWindowsInOrder()[0].focus();
    return;
  }
  save_mouse_position_for_window(window);
  var targetWindow = getNextWindowsOnSameScreen(window);  // <- most time cost
  targetWindow.focus();
  restore_mouse_position_for_window(targetWindow);
}));


/**
 * My Configuartion Mouse
 */

// Central Mouse
keys.push(Phoenix.bind('space', mash, function() {
  var window = Window.focusedWindow();
  if (!window) return;
  set_mouse_position_for_window_center(window);
}));


/**
 * Mission Control
 */

// use Mac Keyboard setting
// mash + i
// mash + o

// move window to prev space
keys.push(Phoenix.bind('i', mashCtrl, function() {
  var window = Window.focusedWindow();
  if (!window) return;
  if (window.isFullScreen() || window.isMinimized()) return;
  var current = Space.activeSpace();
  var allSpaces = Space.spaces();
  var previous = current.previous();
  if (previous.isFullScreen()) return;
  if (previous.screen().hash() != current.screen().hash()) {
    return;
  }
  if (_.indexOf(_.map(allSpaces, function(x) { return x.hash(); }), previous.hash())
      >= _.indexOf(_.map(allSpaces, function(x) { return x.hash(); }), current.hash())) {
    return;
  }
  current.removeWindows([window]);
  previous.addWindows([window]);
}));

// move window to next space
keys.push(Phoenix.bind('o', mashCtrl, function() {
  var window = Window.focusedWindow();
  if (!window) return;
  if (window.isFullScreen() || window.isMinimized()) return;
  var current = Space.activeSpace();
  var allSpaces = Space.spaces();
  var next = current.next();
  if (next.isFullScreen()) return;
  if (next.screen().hash() != current.screen().hash()) {
    return;
  }
  if (_.indexOf(_.map(allSpaces, function(x) { return x.hash(); }), next.hash())
      <= _.indexOf(_.map(allSpaces, function(x) { return x.hash(); }), current.hash())) {
    return;
  }
  current.removeWindows([window]);
  next.addWindows([window]);
}));


function moveWindowToTargetSpace(window, nextWindow, allSpaces, spaceIndex) {
  var targetSpace = allSpaces[spaceIndex];
  var currentSpace = Space.activeSpace();

  currentSpace.removeWindows([window]);
  targetSpace.addWindows([window]);
  if (currentSpace.screen().hash() != targetSpace.screen().hash()) {
	  moveToScreen(window, targetSpace.screen());
  }
  if (nextWindow) {
	  nextWindow.focus();
	  restore_mouse_position_for_window(nextWindow);
  };
};

// move window to park space
keys.push(Phoenix.bind('delete', mash, function() {
	var isFollow = false;
	var window = Window.focusedWindow();
	if (!window) return;
	var nextWindow = isFollow ? window : getNextWindowsOnSameScreen(window);
	var allSpaces = Space.spaces();
	var allSpaces = Space.spaces();
    var screenCount = Screen.screens().length;
	var parkSpaceIndex = PARK_SPACE_APP_INDEX_MAP[window.app().name()] || PARK_SPACE_INDEX_MAP[screenCount];
	if (parkSpaceIndex >= allSpaces.length) return;
	moveWindowToTargetSpace(window, nextWindow, allSpaces, parkSpaceIndex);
}));

// move window to work space
keys.push(Phoenix.bind('return', mash, function() {
	var isFollow = true;
	var window = Window.focusedWindow();
	if (!window) return;
	var nextWindow = isFollow ? window : getNextWindowsOnSameScreen(window);
	var allSpaces = Space.spaces();
    var screenCount = Screen.screens().length;
	if (WORK_SPACE_INDEX_MAP[screenCount] >= allSpaces.length) return;
	moveWindowToTargetSpace(window, nextWindow, allSpaces, WORK_SPACE_INDEX_MAP[screenCount]);
}));

// move other window in this space to park space
keys.push(Phoenix.bind('return', mashCtrl, function() {
	var isFollow = false;
	var window = Window.focusedWindow();
	if (!window) return;
	var nextWindow = window;
	var allSpaces = Space.spaces();
    var otherWindowsInSameSpace = _.filter(window.spaces()[0].windows(), function(x) {return x.hash() != window.hash(); });
    var screenCount = Screen.screens().length;
	var parkSpaceIndex = PARK_SPACE_APP_INDEX_MAP[window.app().name()] || PARK_SPACE_INDEX_MAP[screenCount];
	if (parkSpaceIndex >= allSpaces.length) return;
    _.each(otherWindowsInSameSpace, function(parkedWindow) {
      moveWindowToTargetSpace(parkedWindow, nextWindow, allSpaces, parkSpaceIndex);
    })
}));


// Test
keys.push(Phoenix.bind('0', mash, function() {
  //var cw = Window.focusedWindow();
  //_.map(App.runningApps(), function(app) { Modal.show(app.title(), 5)});
  //_.map([Window.focusedWindow()], function(window) { Modal.show(window.title())});  // current one
  //_.map(Window.windows(), function(window) { Modal.show(window.title(), 5)});  // all, include hide
  //_.map(Window.visibleWindows(), function(window) { Modal.show(window.title())});  // all, no hide
  //_.map(Window.visibleWindowsInOrder(), function(window) { Modal.show(window.title())});
  //_.map(Window.focusedWindow().otherWindowsOnAllScreens(), function(window) { Modal.show(window.title())});  // no space
  //_.map(Window.focusedWindow().windowsOnOtherScreen(), alert_title);
  //_.map(cw.sortByMostRecent(cw.windowsOnOtherScreen()), alert_title);
  //_.map(cw.windowsOnOtherScreen(), alert_title);
  //Modal.show(Window.focusedWindow().screen());

  //_.chain(Window.windows()).difference(Window.visibleWindows()).map(function(window) { Modal.show(window.title())});  // all, include hide
  //Modal.show(_.chain(Window.windows()).difference(Window.visibleWindows()).value().length);
  //Modal.show(_.chain(Window.windows()).value().length);
  //hide_inactiveWindow(Window.focusedWindow().otherWindowsOnAllScreens());
  //var modal = new Modal();
  //modal.message = 'F!';
  //modal.duration = 2;
  //modal.show();
  //var window = Window.focusedWindow();
  //var pos = mousePositions[window.hash()];
  //var curPos = Mouse.location();
  //Phoenix.log(String.format('x: {0}, y: {1}, c: {2}, {3}', pos.x, pos.y, curPos.x, curPos.y));

  var visibleAppMostRecentFirst = _.map(Window.visibleWindowsInOrder(), function(w) { return w.hash(); });
  var visibleAppMostRecentFirstWithWeight = _.object(visibleAppMostRecentFirst,
                                                     _.range(visibleAppMostRecentFirst.length));
  alert(visibleAppMostRecentFirst);
  //alert(visibleAppMostRecentFirstWithWeight['Google Chrome']);
  //alert(visibleAppMostRecentFirstWithWeight['MacDown']);
}));

// vim: set ft=javascript sw=2:
