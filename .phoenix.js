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


Window.prototype.focusNextWindowsOnSameScreen = function() {
  var currentWindow = Window.focusedWindow();
  var windows = currentWindow.otherWindowsOnSameScreen();
  windows.push(currentWindow);
  windows = _.chain(windows).sortBy(function(window) { return window.app().pid}).value();
  windows[(_.indexOf(windows, currentWindow) + 1) % windows.length].focusWindow();
};


Window.prototype.focusNextScreen = function() {
  var windows = _.union(Window.visibleWindowsMostRecentFirst(), _.difference(this.otherWindowsOnAllScreens(), this.otherWindowsOnSameScreen()));
  if (windows.length > 2) {
    windows[1].focusWindow();
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

function switchApp(appName) {
  //switch app, and remember mouse position
  mousePositions[Window.focusedWindow().title()] = MousePosition.capture();
  api.launch(appName);
  if (mousePositions[Window.focusedWindow().title()]  !== undefined) {
    MousePosition.restore(mousePositions[Window.focusedWindow().title()]);
  }
}

// Launch App
api.bind('`', mash, function() {
  switchApp('iTerm');
});
api.bind('1', mash, function() { switchApp('Firefox'); });
api.bind('2', mash, function() { switchApp('Google Chrome'); });
api.bind('3', mash, function() { switchApp('QQ'); });
api.bind('a', mash, function() {
  //if (_.contains(
    //_.map(Window.allWindows(), function(window) { return window.title(); }),
    //'MacVim'
  //)) {
    //api.launch('MacVim');
  //} else {
    //api.launch('IntelliJ IDEA 13');
  //}
  switchApp('MacVim');
});
api.bind('s', mash, function() { switchApp('IntelliJ IDEA 13'); });
api.bind('d', mash, function() { switchApp('Sparrow'); });

// Multi screen
api.bind('l', mash, function() {
  Window.focusedWindow().focusNextScreen();
});
api.bind('h', mash, function() {
  Window.focusedWindow().focusNextScreen();
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


api.bind('0', mash, function() {
  //_.map([Window.focusedWindow()], function(window) { api.alert(window.title())});  // current one
  //_.map(Window.allWindows(), function(window) { api.alert(window.title(), 5)});  // all, include hide
  //_.map(Window.visibleWindows(), function(window) { api.alert(window.title())});  // all, no hide
  //_.map(Window.visibleWindowsMostRecentFirst(), function(window) { api.alert(window.title())});
  //_.map(Window.focusedWindow().otherWindowsOnSameScreen(), function(window) { api.alert(window.title())});  // no space
  //_.map(Window.focusedWindow().otherWindowsOnAllScreens(), function(window) { api.alert(window.title())});  // no space
  //_.chain(Window.allWindows()).difference(Window.visibleWindows()).map(function(window) { api.alert(window.title())});  // all, include hide
  //api.alert(_.chain(Window.allWindows()).difference(Window.visibleWindows()).value().length);
  //api.alert(_.chain(Window.allWindows()).value().length);
});

// Mission Control
// use Mac Keyboard setting
// mash + i
// mash + o
