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
var SECOND_WORK_SPACE_INDEX_MAP = {};  // is a dict, key is display count, val is work space
SECOND_WORK_SPACE_INDEX_MAP[1] = 0;  // one display case
SECOND_WORK_SPACE_INDEX_MAP[2] = 0;  // two display case
var PARK_SPACE_INDEX_MAP = {};
PARK_SPACE_INDEX_MAP[1] = 2;
PARK_SPACE_INDEX_MAP[2] = 2;
var PARK_SPACE_APP_INDEX_MAP = {};
PARK_SPACE_APP_INDEX_MAP['iTerm'] = 0;
PARK_SPACE_APP_INDEX_MAP['Safari'] = 1;
PARK_SPACE_APP_INDEX_MAP['QQ'] = 1;
PARK_SPACE_APP_INDEX_MAP['WeChat'] = 1;
PARK_SPACE_APP_INDEX_MAP['BearyChat'] = 1;
PARK_SPACE_APP_INDEX_MAP['Mail'] = 2;
PARK_SPACE_APP_INDEX_MAP['Airmail'] = 2;
var A_BIG_PIXEL = 10000;


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
      return typeof args[number] != 'undefined' ? args[number] : match;
    });
  };
}

var alert_title = function(window) { alert(window.title()); };

function sortByMostRecent(windows) {
  var visibleAppMostRecentFirst = _.map(
	Window.recent(), function(w) { return w.hash(); }
  );
  var visibleAppMostRecentFirstWithWeight = _.zipObject(
	visibleAppMostRecentFirst, _.range(visibleAppMostRecentFirst.length)
  );
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

function getCurrentWindow() {
  var window = Window.focused();
  if (window === undefined) {
	window = App.focused().mainWindow();
  }
  if (window === undefined) {
	return;
  }
  return window;
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
  var otherWindowsOnSameScreen = Window.focused().others({ screen: Window.focused().screen() });  // slow
  var otherWindowTitlesOnSameScreen = _.map(otherWindowsOnSameScreen , function(w) { return w.title(); });
  var return_value = _.chain(Window.focused().others())
    .filter(function(window) { return ! _.includes(otherWindowTitlesOnSameScreen, window.title()); })
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

function getAnotherWindowsOnSameScreen(window, offset, isCycle) {
  var windows = window.others({ visible: true, screen: window.screen() });
  windows.push(window);
  var screen = window.screen();
  windows = _.chain(windows).sortBy(function(window) {
    return [(A_BIG_PIXEL + window.frame().y - screen.flippedFrame().y) +
	  (A_BIG_PIXEL + window.frame().x - screen.flippedFrame().y),
	  window.app().pid, window.title()].join('');
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
	return;
  }
  return windows[index];
}

function getPreviousWindowsOnSameScreen(window) {
  return getAnotherWindowsOnSameScreen(window, -1, false)
};

function getNextWindowsOnSameScreen(window) {
  return getAnotherWindowsOnSameScreen(window, 1, false)
};

function setWindowCentral(window) {
  window.setTopLeft({
    x: (window.screen().flippedFrame().width - window.size().width) / 2 + window.screen().flippedFrame().x,
    y: (window.screen().flippedFrame().height - window.size().height) / 2 + window.screen().flippedFrame().y
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
  Mouse.move({
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
  Mouse.move(pos);
  heartbeat_window(window);
}

function restore_mouse_position_for_now() {
  if (Window.focused() === undefined) {
    return;
  }
  restore_mouse_position_for_window(Window.focused());
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
  var window = Window.focused();
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
    'daemon': false,
    'openAtLogin': true
});

/**
 * My Configuartion App
 */

// Launch App
keys.push(new Key('`', mash, function() { callApp('iTerm'); }));
keys.push(new Key('1', mash, function() { callApp('Google Chrome'); }));
//keys.push(new Key('1', mash, function() { callApp('Chromium'); }));
keys.push(new Key('2', mash, function() { callApp('Safari'); }));
//keys.push(new Key('2', mashShift, function() { callApp('Firefox'); }));
//var handler_mashShift_2 = new Key('2', mashShift, function() { callApp('Chromium'); });
keys.push(new Key('3', mash, function() { callApp('QQ'); }));
//keys.push(new Key('4', mash, function() { callApp('BearyChat'); }));
keys.push(new Key('7', mash, function() { callApp('CCTalk'); }));
keys.push(new Key('8', mash, function() { callApp('Wechat'); }));
keys.push(new Key('e', mash, function() { callApp('Preview'); }));
keys.push(new Key('a', mash, function() { callApp('MacVim'); }));
keys.push(new Key('s', mash, function() { callApp('IntelliJ IDEA'); }));
keys.push(new Key('d', mash, function() { callApp('Visual Studio Code'); }));
//keys.push(new Key('z', mash, function() { callApp('Macdown'); }));
//keys.push(new Key('z', mash, function() { callApp('Typora'); }));
//keys.push(new Key('z', mash, function() { callApp('Atom'); }));
keys.push(new Key('z', mash, function() { callApp('Sublime Text'); }));
keys.push(new Key(',', mash, function() { callApp('Airmail 3'); }));
//keys.push(new Key(',', mash, function() { callApp('Mail'); }));
keys.push(new Key('9', mash, function() { callApp('NeteaseMusic'); }));
keys.push(new Key('.', mash, function() { callApp('Evernote'); }));
//keys.push(new Key('.', mash, function() { callApp('Alternote'); }));
keys.push(new Key('/', mash, function() { callApp('Finder'); }));


/**
 * My Configuartion Screen
 */

function focusAnotherScreen(window, targetScreen) {
  if (!window) return;
  var currentScreen = window.screen();
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
  targetWindow.focus();  // bug, two window in two space, focus will focus in same space first
  restore_mouse_position_for_window(targetWindow);
  //App.get('Finder').focus(); // Hack for Screen unfocus
}

// Next screen
keys.push(new Key('l', mash, function() {
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
  if (_.indexOf(_.map(allScreens, function(x) { return x.hash(); }), targetScreen.hash())
	  >= _.indexOf(_.map(allScreens, function(x) { return x.hash(); }), currentScreen.hash())) {
		return;
	  }
	  focusAnotherScreen(window, targetScreen);
}));

// Previous Screen
keys.push(new Key('h', mash, function() {
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
  if (_.indexOf(_.map(allScreens, function(x) { return x.hash(); }), targetScreen.hash())
	  <= _.indexOf(_.map(allScreens, function(x) { return x.hash(); }), currentScreen.hash())) {
		return;
	  }
  focusAnotherScreen(window, targetScreen);
}));

// Move Current Window to Next Screen
keys.push(new Key('l', mashShift, function() {
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
}));

// Move Current Window to Previous Screen
keys.push(new Key('h', mashShift, function() {
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
}));


/**
 * My Configuartion Window
 */

// Window Hide Inactive
//keys.push(new Key('delete', mash, function() {
  //var window = Window.focused();
  //if (!window) return;
  //heartbeat_window(window);
  //hide_inactiveWindow(window.others());
//}));

// Window Maximize
keys.push(new Key('m', mashShift, function() {
  var window = getCurrentWindow();
  if (window === undefined) {
	return;
  }

  window.maximize();
  setWindowCentral(window);
  //heartbeat_window(window);
}));

// Window Smaller
keys.push(new Key('-', mash, function() {
  var window = getCurrentWindow();
  if (window === undefined) {
	return;
  }
  var oldFrame = window.frame();
  var frame = getSmallerFrame(oldFrame);
  window.setFrame(frame);
  if (window.frame().width == oldFrame.width || window.frame().height == oldFrame.height) {
    window.setFrame(oldFrame);
  }
  //heartbeat_window(window);
}));

// Window Larger
keys.push(new Key('=', mash, function() {
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
}));

// Window Central
keys.push(new Key('m', mash, function() {
  var window = getCurrentWindow();
  if (window === undefined) {
	return;
  }
  setWindowCentral(window);
}));

// Window Height
keys.push(new Key('\\', mash, function() {
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
}));

// Window Width
keys.push(new Key('\\', mashShift, function() {
  var window = getCurrentWindow();
  if (window === undefined) {
	return;
  }
  window.setFrame({
    x: window.screen().flippedFrame().x,
    y: window.frame().y,
    width: window.screen().flippedFrame().width,
    height: window.frame().height
  });
  heartbeat_window(window);
}));

// Window >
keys.push(new Key('l', mashCtrl, function() {
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
}));

// Window <
keys.push(new Key('h', mashCtrl, function() {
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
}));

// Window ^
keys.push(new Key('k', mashCtrl, function() {
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
}));

// Window v
keys.push(new Key('j', mashCtrl, function() {
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
}));

// Previous Window in One Screen
keys.push(new Key('k', mash, function() {
  var window = Window.focused();
  if (!window) {
    if (Window.recent().length == 0) return;
    Window.recent()[0].focus();
    return;
  }
  save_mouse_position_for_window(window);
  var targetWindow = getPreviousWindowsOnSameScreen(window);
  if (!targetWindow) {
	return;
  }
  targetWindow.focus();
  restore_mouse_position_for_window(targetWindow);
}));

// Next Window in One Screen
keys.push(new Key('j', mash, function() {
  var window = Window.focused();
  if (!window) {
    if (Window.recent().length == 0) return;
    Window.recent()[0].focus();
    return;
  }
  save_mouse_position_for_window(window);
  var targetWindow = getNextWindowsOnSameScreen(window);  // <- most time cost
  if (!targetWindow) {
	return;
  }
  targetWindow.focus();
  restore_mouse_position_for_window(targetWindow);
}));


/**
 * My Configuartion Mouse
 */

// Central Mouse
keys.push(new Key('space', mash, function() {
  var window = getCurrentWindow();
  if (window === undefined) {
	return;
  }
  set_mouse_position_for_window_center(window);
}));


/**
 * Mission Control
 */

// use Mac Keyboard setting
// mash + i
// mash + o

// move window to prev space
keys.push(new Key('i', mashShift, function() {
  var window = getCurrentWindow();
  if (window === undefined) {
	return;
  }
  if (window.isFullScreen() || window.isMinimized()) return;
  var current = Space.active();
  var allSpaces = Space.all();
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
  var prevWindow = getPreviousWindowsOnSameScreen(window);
  if (prevWindow) {
	prevWindow.focus();
  }
}));

// move window to next space
keys.push(new Key('o', mashShift, function() {
  var window = getCurrentWindow();
  if (window === undefined) {
	return;
  }
  if (window.isFullScreen() || window.isMinimized()) return;
  var current = Space.active();
  var allSpaces = Space.all();
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
  var nextWindow = getNextWindowsOnSameScreen(window);
  if (nextWindow) {
	nextWindow.focus();
  }
}));


function moveWindowToTargetSpace(window, nextWindow, allSpaces, spaceIndex) {
  var targetSpace = allSpaces[spaceIndex];
  var currentSpace = Space.active();

  if (currentSpace.screen().hash() != targetSpace.screen().hash()) {
    moveToScreen(window, targetSpace.screen());
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
keys.push(new Key('delete', mash, function() {
  var isFollow = false;
  var window = getCurrentWindow();
  if (window === undefined) {
	return;
  }
  var nextWindow = isFollow ? window : getNextWindowsOnSameScreen(window);
  var allSpaces = Space.all();
  var screenCount = Screen.all().length;
  var parkSpaceIndex = PARK_SPACE_APP_INDEX_MAP[window.app().name()] || PARK_SPACE_INDEX_MAP[screenCount];
  if (parkSpaceIndex >= allSpaces.length) return;
  _.each(window.app().windows(), function(window) {
	moveWindowToTargetSpace(window, nextWindow, allSpaces, parkSpaceIndex);
  });
}));

// move window to work space
keys.push(new Key('return', mash, function() {
  var isFollow = true;
  var window = getCurrentWindow();
  if (window === undefined) {
	return;
  }
  var nextWindow = isFollow ? window : getNextWindowsOnSameScreen(window);
  var allSpaces = Space.all();
  var screenCount = Screen.all().length;
  if (WORK_SPACE_INDEX_MAP[screenCount] >= allSpaces.length) return;
  _.each(window.app().windows(), function(window) {
	moveWindowToTargetSpace(window, nextWindow, allSpaces, WORK_SPACE_INDEX_MAP[screenCount]);
  });
}));

// move window to sencond work space
keys.push(new Key('return', mashShift, function() {
  var isFollow = true;
  var window = getCurrentWindow();
  if (window === undefined) {
	return;
  }
  var nextWindow = isFollow ? window : getNextWindowsOnSameScreen(window);
  var allSpaces = Space.all();
  var screenCount = Screen.all().length;
  if (SECOND_WORK_SPACE_INDEX_MAP[screenCount] >= allSpaces.length) return;
  _.each(window.app().windows(), function(window) {
    //alert(allSpaces[SECOND_WORK_SPACE_INDEX_MAP[screenCount]].hash());
	moveWindowToTargetSpace(window, nextWindow, allSpaces, SECOND_WORK_SPACE_INDEX_MAP[screenCount]);
  });
}));

// move other window in this space to park space
keys.push(new Key('delete', mashShift, function() {
  var isFollow = false;
  var window = getCurrentWindow();
  if (window === undefined) {
	return;
  }
  var nextWindow = window;
  var allSpaces = Space.all();
  var otherWindowsInSameSpace = _.filter(window.spaces()[0].windows(), function(x) {return x.hash() != window.hash(); });
  var screenCount = Screen.all().length;
  _.each(otherWindowsInSameSpace, function(parkedWindow) {
    if (window.app().hash() === parkedWindow.app().hash()) {
      return;
    }
	var parkSpaceIndex = PARK_SPACE_APP_INDEX_MAP[parkedWindow.app().name()] || PARK_SPACE_INDEX_MAP[screenCount];
	if (parkSpaceIndex >= allSpaces.length) return;
	moveWindowToTargetSpace(parkedWindow, nextWindow, allSpaces, parkSpaceIndex);
  })
}));


// Test
keys.push(new Key('0', mash, function() {
  var cw = Window.focused();
  //_.map(App.all(), function(app) { Modal.show(app.title(), 5)});
  //_.map([Window.focused()], function(window) { Modal.show(window.title())});  // current one
  //_.map(Window.all(), function(window) { Modal.show(window.title(), 5)});  // all, include hide
  //_.map(Window.all({visible: true}), function(window) { Modal.show(window.title())});  // all, no hide
  //_.map(Window.recent(), function(window) { Modal.show(window.title())});
  //_.map(Window.focused().others(), function(window) { Modal.show(window.title())});  // no space
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
  alert(
  cw.spaces()[0].hash()
  );
  //cw.focus();
  //cw.focus();
  
}));

// vim: set ft=javascript sw=2:
