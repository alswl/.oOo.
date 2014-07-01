/**
 * Global Settings
 */
var mash = ["alt"];
var mashShift = ["alt", "shift"];
var mousePositions = {};


/**
 * Upgrade Phoenix Window 
 */

Window.prototype.moveToScreen = function(screen) {
  if (!screen) {
    return;
  }

  var frame = this.frame();
  var oldScreenRect = this.screen().frameWithoutDockOrMenu();
  var newScreenRect = screen.frameWithoutDockOrMenu();
  var xRatio = newScreenRect.width / oldScreenRect.width;
  var yRatio = newScreenRect.height / oldScreenRect.height;

  this.setFrame({
    x: (Math.round(frame.x - oldScreenRect.x) * xRatio) + newScreenRect.x,
    y: (Math.round(frame.y - oldScreenRect.y) * yRatio) + newScreenRect.y,
    width: Math.round(frame.width * xRatio),
    height: Math.round(frame.height * yRatio)
  });
};


Window.prototype.windowsOnOtherScreen = function() {
  var otherWindowTitlesOnSameScreen = _.map( Window.focusedWindow().otherWindowsOnSameScreen(), function(w) { return w.title(); });
  return _.chain(Window.focusedWindow().otherWindowsOnAllScreens())
    .filter(function(window) { return ! _.contains(otherWindowTitlesOnSameScreen, window.title()); })
    .value();
};

Window.prototype.sortByMostRecent = function(windows) {
  var visibleWindowsMostRecentFirst = _.map(Window.visibleWindowsMostRecentFirst(), function(w) { return w.title()});
  var weights = _.range(visibleWindowsMostRecentFirst.length, 0, -1);
  var visibleWindowsMostRecentFirstWithWeight = _.zip(visibleWindowsMostRecentFirst, weights);

  return _.chain(windows)
    .sortBy(function(window) { return visibleWindowsMostRecentFirstWithWeight[window.title()] })
    .value();
};


Window.prototype.focusNextWindowsOnSameScreen = function() {
  var currentWindow = Window.focusedWindow();
  var windows = currentWindow.otherWindowsOnSameScreen();
  windows.push(currentWindow);
  windows = _.chain(windows).sortBy(function(window) { return window.app().pid}).value();
  windows[(_.indexOf(windows, currentWindow) + 1) % windows.length].focusWindow();
};


Window.prototype.focusNextScreen = function() {
  var windows = this.sortByMostRecent(this.windowsOnOtherScreen());
  if (windows.length > 0) {
    windows[0].focusWindow();
  }
};


Window.prototype.focusPreviousWindowsOnSameScreen = function() {
  var currentWindow = Window.focusedWindow();
  var windows = currentWindow.otherWindowsOnSameScreen()
  windows.push(currentWindow);
  windows = _.chain(windows).sortBy(function(window) { return window.app().pid}).value();
  windows[(_.indexOf(windows, currentWindow) - 1 + windows.length) % windows.length].focusWindow();
};


/**
 * My Settings
 */

function save_mouse_position_for_now() {
  if (Window.focusedWindow() === undefined) {
    return;
  }
  mousePositions[Window.focusedWindow().title()] = MousePosition.capture();
}

function restore_mouse_position_for_now() {
  if (Window.focusedWindow() === undefined) {
    return;
  }
  if (mousePositions[Window.focusedWindow().title()]  !== undefined) {
    MousePosition.restore(mousePositions[Window.focusedWindow().title()]);
  }
}

function switchApp(appName) {
  //switch app, and remember mouse position
  save_mouse_position_for_now()
  api.launch(appName);
  restore_mouse_position_for_now()
}

// Launch App
api.bind('`', mash, function() {
  switchApp('iTerm');
});
api.bind('1', mash, function() { switchApp('Firefox'); });
api.bind('2', mash, function() { switchApp('Google Chrome'); });
api.bind('3', mash, function() { switchApp('QQ'); });
api.bind('a', mash, function() {
  switchApp('MacVim');
});
api.bind('s', mash, function() { switchApp('IntelliJ IDEA 13'); });
api.bind(',', mash, function() { switchApp('Sparrow'); });
api.bind('.', mash, function() { switchApp('Evernote'); });
api.bind('/', mash, function() { switchApp('Finder'); });

// Multi screen
api.bind('l', mash, function() {
  save_mouse_position_for_now()
  Window.focusedWindow().focusNextScreen();
  restore_mouse_position_for_now()
});
api.bind('h', mash, function() {
  save_mouse_position_for_now()
  Window.focusedWindow().focusNextScreen();
  restore_mouse_position_for_now()
});
api.bind('l', mashShift, function() {
  Window.focusedWindow().moveToScreen(Window.focusedWindow().screen().nextScreen());
});
api.bind('h', mashShift, function() {
  Window.focusedWindow().moveToScreen(Window.focusedWindow().screen().previousScreen());
});

// Window
api.bind('m', mash, function() {
  Window.focusedWindow().maximize();
});

api.bind('j', mash, function() {
  var window = Window.focusedWindow();
  if (window === undefined) {
    Window.visibleWindowsMostRecentFirst()[0].focusWindow();
    return;
  }
  window.focusNextWindowsOnSameScreen();
});
api.bind('k', mash, function() {
  var window = Window.focusedWindow();
  if (window === undefined) {
    Window.visibleWindowsMostRecentFirst()[0].focusWindow();
    return;
  }
  window.focusPreviousWindowsOnSameScreen();
});

var alert_title = function(window) { api.alert(window.title())};

api.bind('space', mash, function() {
  var window = Window.focusedWindow();
  if (window === undefined) {
    return;
  }
  MousePosition.restore({
    x: window.topLeft().x + window.frame().width / 2,
    y: window.topLeft().y + window.frame().height / 2
  });
});


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
  _.map(cw.sortByMostRecent(cw.windowsOnOtherScreen()), alert_title);


  //_.chain(Window.allWindows()).difference(Window.visibleWindows()).map(function(window) { api.alert(window.title())});  // all, include hide
  //api.alert(_.chain(Window.allWindows()).difference(Window.visibleWindows()).value().length);
  //api.alert(_.chain(Window.allWindows()).value().length);
});

// Mission Control
// use Mac Keyboard setting
// mash + i
// mash + o
