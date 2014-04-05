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
  //api.alert(Window.focusedWindow().otherWindowsOnSameScreen());
  Window.focusedWindow().focusWindowDown();
});
api.bind('k', mash, function() {
  Window.focusedWindow().focusWindowUp();
});

// Mission Control
// use Mac Keyboard setting
// mash + i
// mash + o
