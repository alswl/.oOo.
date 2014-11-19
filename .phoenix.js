/**
 * Global Settings
 */

var mash = ["alt"];
var mashShift = ["alt", "shift"];
var mashCtrl = ["alt", "ctrl"];
var CMD_BTN = ["cmd"];
var mousePositions = {};
var HIDE_INACTIVE_WINDOW_TIME = 10;  // minitus
var ACTIVE_WINDOWS_TIMES = {};


/**
 * Utils Functions
 */

var alert_title = function(window) { api.alert(window.title())};

function sortByMostRecent(windows) {
  var visibleAppMostRecentFirst = _.map(Window.visibleWindowsMostRecentFirst(),
                                        function(w) { return w.app().title(); });
  var visibleAppMostRecentFirstWithWeight = _.object(visibleAppMostRecentFirst,
                                                     _.range(visibleAppMostRecentFirst.length));
  return _.sortBy(windows, function(window) { return visibleAppMostRecentFirstWithWeight[window.app().title()]; });
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
  var oldScreenRect = window.screen().frameWithoutDockOrMenu();
  var newScreenRect = screen.frameWithoutDockOrMenu();
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
  var otherWindowTitlesOnSameScreen = _.map( Window.focusedWindow().otherWindowsOnSameScreen(), function(w) { return w.title(); });
  return _.chain(Window.focusedWindow().otherWindowsOnAllScreens())
    .filter(function(window) { return ! _.contains(otherWindowTitlesOnSameScreen, window.title()); })
    .value();
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
  var windows = window.otherWindowsOnSameScreen();
  windows.push(window);
  windows = _.chain(windows).sortBy(function(window) {
    return window.frame().y;
  }).sortBy(function(window) {
    return window.frame().x;
  }).sortBy(function(window) {
    return window.app().pid;
  }).sortBy(function(window) {
    return window.title();
  }).value();
  return windows[(_.indexOf(windows, window) + offset + windows.length) % windows.length];
}

function getNextWindowsOnSameScreen(window) {
  return getAnotherWindowsOnSameScreen(window, -1)
};

function getPreviousWindowsOnSameScreen(window) {
  return getAnotherWindowsOnSameScreen(window, 1)
};

function setWindowCentral(window) {
  window.setTopLeft({
    x: (window.screen().frameWithoutDockOrMenu().width - window.size().width) / 2 + window.screen().frameWithoutDockOrMenu().x,
    y: (window.screen().frameWithoutDockOrMenu().height - window.size().height) / 2 + window.screen().frameWithoutDockOrMenu().y
  });
  heartbeat_window(window);
};


/**
 * Mouse Functions
 */

function save_mouse_position_for_window(window) {
  if (!window) return;
  heartbeat_window(window);
  mousePositions[window.title()] = MousePosition.capture();
}

function set_mouse_position_for_window_center(window) {
  MousePosition.restore({
    x: window.topLeft().x + window.frame().width / 2,
    y: window.topLeft().y + window.frame().height / 2
  });
  heartbeat_window(window);
}

function restore_mouse_position_for_window(window) {
  if (!mousePositions[window.title()]) {
    set_mouse_position_for_window_center(window);
    return;
  }
  var pos = mousePositions[window.title()];
  var rect = window.frame();
  if (pos.x < rect.x || pos.x > (rect.x + rect.width) || pos.y < rect.y || pos. y > (rect.y + rect.height)) {
    set_mouse_position_for_window_center(window);
    return;
  }
  MousePosition.restore(pos);
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

//switch app, and remember mouse position
function switchApp(appName) {
  var window = Window.focusedWindow();
  if (window) {
    save_mouse_position_for_window(window);
  }
  api.launch(appName);
  var newWindow = Window.focusedWindow();
  if (newWindow && window !== newWindow) {
    restore_mouse_position_for_window(newWindow);
  }
}


/**
 * My Configuartion App
 */

// Launch App
api.bind('`', mash, function() { switchApp('iTerm'); });
api.bind('1', mash, function() { switchApp('Google Chrome'); });
api.bind('2', mash, function() { switchApp('Safari'); });
api.bind('3', mash, function() { switchApp('QQ'); });
api.bind('e', mash, function() { switchApp('Preview'); });
api.bind('a', mash, function() { switchApp('MacVim'); });
api.bind('s', mash, function() { switchApp('IntelliJ IDEA 13'); });
api.bind('z', mash, function() { switchApp('Mou'); });
api.bind(',', mash, function() { switchApp('Airmail'); });
api.bind('9', mash, function() { switchApp('Music.163'); });
//api.bind(',', mash, function() { switchApp('Sparrow'); });
//api.bind(',', mash, function() { switchApp('Inky'); });
api.bind('.', mash, function() { switchApp('Evernote'); });
api.bind('/', mash, function() { switchApp('Finder'); });


/**
 * My Configuartion Screen
 */

// Next screen, now only support 2 display // TODO
api.bind('l', mash, function() {
  var window = Window.focusedWindow();
  if (!window) return;
  if (window.screen() === window.screen().nextScreen()) return;
  if (window.screen().nextScreen().frameIncludingDockAndMenu().x < window.screen().frameIncludingDockAndMenu().x) {
    return;
  }
  save_mouse_position_for_window(window);
  var nextScreenWindows = sortByMostRecent(windowsOnOtherScreen());
  if (nextScreenWindows.length > 0) {
    nextScreenWindows[0].focusWindow();
    restore_mouse_position_for_window(nextScreenWindows[0]);
  }
});

// Previous Screen, now only support 2 display // TODO
api.bind('h', mash, function() {
  var now = new Date();
  //now.format('yy-M-dd h:mm:tt')
  //api.alert('h1: '+ (new Date()).format('yy-M-dd h:mm:tt'));
  var window = Window.focusedWindow();
  if (!window) return;
  if (window.screen() === window.screen().nextScreen()) return;
  if (window.screen().nextScreen().frameIncludingDockAndMenu().x > window.screen().frameIncludingDockAndMenu().x) {
    return;
  }
  //api.alert('h2: '+ (new Date()).format('yy-M-dd h:mm:tt'));
  save_mouse_position_for_window(window);
  var nextScreenWindows = sortByMostRecent(windowsOnOtherScreen());
  if (nextScreenWindows.length > 0) {
    nextScreenWindows[0].focusWindow();
    restore_mouse_position_for_window(nextScreenWindows[0]);
  }
  //api.alert('h3: '+ (new Date()).format('yy-M-dd h:mm:tt'));
});

// Move Current Window to Next Screen
api.bind('l', mashShift, function() {
  var window = Window.focusedWindow();
  if (!window) return;
  if (window.screen() === window.screen().nextScreen()) return;
  if (window.screen().nextScreen().frameIncludingDockAndMenu().x < 0) {
    return;
  }
  moveToScreen(window, window.screen().nextScreen());
});

// Move Current Window to Previous Screen
api.bind('h', mashShift, function() {
  var window = Window.focusedWindow();
  if (!window) return;
  if (window.screen() === window.screen().nextScreen()) return;
  if (window.screen().nextScreen().frameIncludingDockAndMenu().x == 0) {
    return;
  }
  moveToScreen(window, window.screen().previousScreen());
});


/**
 * My Configuartion Window
 */

// Window Hide Inactive
api.bind('delete', mash, function() {
  var window = Window.focusedWindow();
  if (!window) return;
  heartbeat_window(window);
  hide_inactiveWindow(window.otherWindowsOnAllScreens());
});

//api.bind('h', CMD_BTN, function() {
  //var window = Window.focusedWindow();
  //if (!window) return;
  //window.app().hide();
  //var window = Window.focusedWindow();
  //api.alert(window.title());  // TODO need delay
  //if (!window) return;
  //restore_mouse_position_for_window(window);
//});

// Window Maximize
api.bind('m', mashShift, function() {
  var window = Window.focusedWindow();
  if (!window) return;
  window.maximize();
  setWindowCentral(window);
  //heartbeat_window(window);
});

// Window Smaller
api.bind('-', mash, function() {
  var window = Window.focusedWindow();
  if (!window) return;
  var oldFrame = window.frame();
  var frame = getSmallerFrame(oldFrame);
  window.setFrame(frame);
  if (window.frame().width == oldFrame.width || window.frame().height == oldFrame.height) {
    window.setFrame(oldFrame);
  }
  //heartbeat_window(window);
});

// Window Larger
api.bind('=', mash, function() {
  var window = Window.focusedWindow();
  if (!window) return;
  var frame = getLargerFrame(window.frame());
  if (frame.width > window.screen().frameWithoutDockOrMenu().width ||
      frame.height > window.screen().frameWithoutDockOrMenu().height) {
    window.maximize();
  } else {
    window.setFrame(frame);
  }
  //heartbeat_window(window);
});

// Window Central
api.bind('m', mash, function() {
  var window = Window.focusedWindow();
  if (!window) return;
  setWindowCentral(window);
});

// Window Vertical
api.bind('\\', mash, function() {
  var window = Window.focusedWindow();
  if (!window) return;
  window.setFrame({
    x: window.frame().x,
    y: window.screen().frameWithoutDockOrMenu().y,
    width: window.frame().width,
    height: window.screen().frameWithoutDockOrMenu().height
  });
  heartbeat_window(window);
});

// Window >
api.bind('l', mashCtrl, function() {
  var window = Window.focusedWindow();
  if (!window) return;
  window.setFrame({
    x: window.frame().x + 100,
    y: window.frame().y,
    width: window.frame().width,
    height: window.frame().height
  });
  heartbeat_window(window);
});

// Window <
api.bind('h', mashCtrl, function() {
  var window = Window.focusedWindow();
  if (!window) return;
  window.setFrame({
    x: window.frame().x - 100,
    y: window.frame().y,
    width: window.frame().width,
    height: window.frame().height
  });
  heartbeat_window(window);
});

// Window ^
api.bind('k', mashCtrl, function() {
  var window = Window.focusedWindow();
  if (!window) return;
  window.setFrame({
    x: window.frame().x,
    y: window.frame().y - 100,
    width: window.frame().width,
    height: window.frame().height
  });
  heartbeat_window(window);
});

// Window v
api.bind('j', mashCtrl, function() {
  var window = Window.focusedWindow();
  if (!window) return;
  window.setFrame({
    x: window.frame().x,
    y: window.frame().y + 100,
    width: window.frame().width,
    height: window.frame().height
  });
  heartbeat_window(window);
});

// Next Window in One Screen
api.bind('k', mash, function() {
  var window = Window.focusedWindow();
  if (!window) {
    if (Window.visibleWindowsMostRecentFirst().length == 0) return;
    Window.visibleWindowsMostRecentFirst()[0].focusWindow();
    return;
  }
  save_mouse_position_for_window(window);
  var targetWindow = getNextWindowsOnSameScreen(window);
  targetWindow.focusWindow();
  restore_mouse_position_for_window(targetWindow);
});

// Previous Window in One Screen
api.bind('j', mash, function() {
  var window = Window.focusedWindow();
  if (!window) {
    if (Window.visibleWindowsMostRecentFirst().length == 0) return;
    Window.visibleWindowsMostRecentFirst()[0].focusWindow();
    return;
  }
  save_mouse_position_for_window(window);
  var targetWindow = getPreviousWindowsOnSameScreen(window);
  targetWindow.focusWindow();
  restore_mouse_position_for_window(targetWindow);
});


/**
 * My Configuartion Mouse
 */

// Central Mouse
api.bind('space', mash, function() {
  var window = Window.focusedWindow();
  if (!window) return;
  set_mouse_position_for_window_center(window);
});


/**
 * Mission Control
 */

// use Mac Keyboard setting
// mash + i
// mash + o




// Test
api.bind('0', mash, function() {
  //var cw = Window.focusedWindow();
  //_.map(App.runningApps(), function(app) { api.alert(app.title(), 5)});
  //_.map([Window.focusedWindow()], function(window) { api.alert(window.title())});  // current one
  //_.map(Window.allWindows(), function(window) { api.alert(window.title(), 5)});  // all, include hide
  //_.map(Window.visibleWindows(), function(window) { api.alert(window.title())});  // all, no hide
  //_.map(Window.visibleWindowsMostRecentFirst(), function(window) { api.alert(window.title())});
  //_.map(Window.focusedWindow().otherWindowsOnAllScreens(), function(window) { api.alert(window.title())});  // no space
  //_.map(Window.focusedWindow().windowsOnOtherScreen(), alert_title);
  //_.map(cw.sortByMostRecent(cw.windowsOnOtherScreen()), alert_title);
  //_.map(cw.windowsOnOtherScreen(), alert_title);
  //api.alert(Window.focusedWindow().screen());


  //_.chain(Window.allWindows()).difference(Window.visibleWindows()).map(function(window) { api.alert(window.title())});  // all, include hide
  //api.alert(_.chain(Window.allWindows()).difference(Window.visibleWindows()).value().length);
  //api.alert(_.chain(Window.allWindows()).value().length);
  //hide_inactiveWindow(Window.focusedWindow().otherWindowsOnAllScreens());
  api.alert('xx');
});

