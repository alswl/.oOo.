/**
 * Global Settings
 */
var mash = ["alt"];
var mashShift = ["alt", "shift"];


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
  var windows = currentWindow.otherWindowsOnSameScreen()
  windows.push(currentWindow);
  windows = _.chain(windows).sortBy(function(window) { return window.app().pid}).value();
  windows[(_.indexOf(windows, currentWindow) + 1) % windows.length].focusWindow();
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

// Launch App
api.bind('`', mash, function() { api.launch('iTerm'); });
api.bind('1', mash, function() { api.launch('Firefox'); });
api.bind('2', mash, function() { api.launch('Google Chrome'); });
api.bind('3', mash, function() { api.launch('QQ'); });
api.bind('a', mash, function() { api.launch('MacVim'); });
api.bind('s', mash, function() { api.launch('IntelliJ IDEA 13'); });

// Multi screen
api.bind('l', mashShift, function() {
  Window.focusedWindow().moveToScreen(win.screen().nextScreen());
});
api.bind('h', mashShift, function() {
  Window.focusedWindow().moveToScreen(win.screen().previousScreen());
});

// Window
api.bind('m', mash, function() {
  Window.focusedWindow().maximize();
});

api.bind('j', mash, function() {
  Window.focusedWindow().focusNextWindowsOnSameScreen();
});
api.bind('k', mash, function() {
  Window.focusedWindow().focusPreviousWindowsOnSameScreen();
});

// Mission Control
// use Mac Keyboard setting
// mash + i
// mash + o
