/**
 * Global Settings
 */

var mash = ["alt"];
var mashShift = ["alt", "shift"];
var mousePositions = {};


/**
 * Utils
 */

var alert_title = function(window) { api.alert(window.title())};

function sortByMostRecent(windows) {  // TODO: check
  var visibleAppMostRecentFirst = _.map(Window.visibleWindowsMostRecentFirst(),
                                        function(w) { return w.app().title(); });
  var visibleAppMostRecentFirstWithWeight = _.object(visibleAppMostRecentFirst,
                                                     _.range(visibleAppMostRecentFirst.length));
  return _.sortBy(windows, function(window) { return visibleAppMostRecentFirstWithWeight[window.app().title()]; });
};


/**
 * Screen
 */

function moveToScreen(window, screen) {  // TODO: check
  if (!window) return;
  if (!screen) return;

  var frame = window.frame();
  var oldScreenRect = window.screen().frameWithoutDockOrMenu();
  var newScreenRect = screen.frameWithoutDockOrMenu();
  var xRatio = newScreenRect.width / oldScreenRect.width;
  var yRatio = newScreenRect.height / oldScreenRect.height;

  window.setFrame({
    x: (Math.round(frame.x - oldScreenRect.x) * xRatio) + newScreenRect.x,
    y: (Math.round(frame.y - oldScreenRect.y) * yRatio) + newScreenRect.y,
    width: Math.round(frame.width * xRatio),
    height: Math.round(frame.height * yRatio)
  });
};


/**
 * Window
 */

function getAnotherWindowsOnSameScreen(window, offset) {
  var windows = window.otherWindowsOnSameScreen();
  windows.push(window);
  windows = _.chain(windows).sortBy(function(window) {
    return window.topLeft().y;
  }).sortBy(function(window) {
    return window.app().pid;
  }).sortBy(function(window) {
    return window.title();
  }).value();
  return windows[(_.indexOf(windows, window) + offset + windows.length) % windows.length];
}

function getNextWindowsOnSameScreen(window) {
  return getAnotherWindowsOnSameScreen(window, 1)
};

function getPreviousWindowsOnSameScreen(window) {
  return getAnotherWindowsOnSameScreen(window, -1)
};

function setWindowCentral(window) {
  window.setTopLeft({
    x: (window.screen().frameIncludingDockAndMenu().width - window.size().width) / 2 + window.screen().frameIncludingDockAndMenu().x,
    y: (window.screen().frameIncludingDockAndMenu().height - window.size().height) / 2 + window.screen().frameIncludingDockAndMenu().y
  });
};


/**
 * Mouse
 */

function save_mouse_position_for_window(window) {
  if (!window) return;
  mousePositions[window.title()] = MousePosition.capture();
}

function save_mouse_position_for_now() {  // TODO delete
  if (!Window.focusedWindow()) return;
  mousePositions[Window.focusedWindow().title()] = MousePosition.capture();
}

function set_mouse_position_for_window_center(window) {
  MousePosition.restore({
    x: window.topLeft().x + window.frame().width / 2,
    y: window.topLeft().y + window.frame().height / 2
  });
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
}

function restore_mouse_position_for_now() {
  if (Window.focusedWindow() === undefined) {
    return;
  }
  restore_mouse_position_for_window(Window.focusedWindow());
}


/**
 * App
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
 * Upgrade Phoenix Window 
 */


Window.prototype.windowsOnOtherScreen = function() {
  var otherWindowTitlesOnSameScreen = _.map( Window.focusedWindow().otherWindowsOnSameScreen(), function(w) { return w.title(); });
  return _.chain(Window.focusedWindow().otherWindowsOnAllScreens())
    .filter(function(window) { return ! _.contains(otherWindowTitlesOnSameScreen, window.title()); })
    .value();
};


Window.prototype.focusNextScreen = function() {
  var windows = sortByMostRecent(this.windowsOnOtherScreen());
  if (windows.length > 0) {
    windows[0].focusWindow();
    return windows[0];
  }
};


/**
 * My Settings
 */

// Launch App
api.bind('`', mash, function() { switchApp('iTerm'); });
api.bind('1', mash, function() { switchApp('Firefox'); });
api.bind('2', mash, function() { switchApp('Google Chrome'); });
api.bind('3', mash, function() { switchApp('QQ'); });
api.bind('a', mash, function() { switchApp('MacVim'); });
api.bind('s', mash, function() { switchApp('IntelliJ IDEA 13'); });
api.bind(',', mash, function() { switchApp('Sparrow'); });
api.bind('.', mash, function() { switchApp('Evernote'); });
api.bind('/', mash, function() { switchApp('Finder'); });

// Next screen
api.bind('l', mash, function() {
  var window = Window.focusedWindow();
  if (!window) return;
  if (window.screen() === window.screen().nextScreen()) return;
  if (window.screen().nextScreen().frameIncludingDockAndMenu().x < 0) {
    return;
  }
  save_mouse_position_for_now();
  var targetWindow = window.focusNextScreen();
  if (targetWindow !== undefined) {
    restore_mouse_position_for_window(targetWindow);
  }
});

// Previous Screen
api.bind('h', mash, function() {
  var window = Window.focusedWindow();
  if (!window) return;
  if (window.screen() === window.screen().nextScreen()) return;
  if (window.screen().nextScreen().frameIncludingDockAndMenu().x == 0) {
    return;
  }
  save_mouse_position_for_now();
  var targetWindow = window.focusNextScreen();
  if (targetWindow !== undefined) {
    restore_mouse_position_for_window(targetWindow);
  }
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

// Window Maximize
api.bind('m', mash, function() {
  var window = Window.focusedWindow();
  if (!window) return;
  window.maximize();
});

// Window Central
api.bind('m', mashShift, function() {
  var window = Window.focusedWindow();
  if (!window) return;
  setWindowCentral(window);
});

// Next Window in One Screen
api.bind('j', mash, function() {
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
api.bind('k', mash, function() {
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

// Central Mouse
api.bind('space', mash, function() {
  var window = Window.focusedWindow();
  if (!window) return;
  set_mouse_position_for_window_center(window);
});


// Test
api.bind('0', mash, function() {
  var cw = Window.focusedWindow();
  //_.map(App.runningApps(), function(app) { api.alert(app.title(), 5)});
  //_.map([Window.focusedWindow()], function(window) { api.alert(window.title())});  // current one
  //_.map(Window.allWindows(), function(window) { api.alert(window.title(), 5)});  // all, include hide
  //_.map(Window.visibleWindows(), function(window) { api.alert(window.title())});  // all, no hide
  //_.map(Window.visibleWindowsMostRecentFirst(), function(window) { api.alert(window.title())});
  //_.map(Window.focusedWindow().otherWindowsOnSameScreen(), alert_title);
  //_.map(Window.focusedWindow().otherWindowsOnAllScreens(), function(window) { api.alert(window.title())});  // no space
  //_.map(Window.focusedWindow().windowsOnOtherScreen(), alert_title);
  //_.map(cw.sortByMostRecent(cw.windowsOnOtherScreen()), alert_title);
  //_.map(cw.windowsOnOtherScreen(), alert_title);
  //api.alert(Window.focusedWindow().screen());


  //_.chain(Window.allWindows()).difference(Window.visibleWindows()).map(function(window) { api.alert(window.title())});  // all, include hide
  //api.alert(_.chain(Window.allWindows()).difference(Window.visibleWindows()).value().length);
  //api.alert(_.chain(Window.allWindows()).value().length);
});

// Mission Control
// use Mac Keyboard setting
// mash + i
// mash + o
