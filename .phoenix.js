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
 * Screen
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
    //x: frame.x - oldScreenRect.x + newScreenRect.x - mid_pos_x,
    //y: mid_pos_y,
    width: frame.width,
    height: frame.height
    //width: Math.round(frame.width * xRatio),
    //height: Math.round(frame.height * yRatio)
  });
};

function windowsOnOtherScreen() {
  var otherWindowTitlesOnSameScreen = _.map( Window.focusedWindow().otherWindowsOnSameScreen(), function(w) { return w.title(); });
  return _.chain(Window.focusedWindow().otherWindowsOnAllScreens())
    .filter(function(window) { return ! _.contains(otherWindowTitlesOnSameScreen, window.title()); })
    .value();
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
  var window = Window.focusedWindow();
  if (!window) return;
  if (window.screen() === window.screen().nextScreen()) return;
  if (window.screen().nextScreen().frameIncludingDockAndMenu().x > window.screen().frameIncludingDockAndMenu().x) {
    return;
  }
  save_mouse_position_for_window(window);
  var nextScreenWindows = sortByMostRecent(windowsOnOtherScreen());
  if (nextScreenWindows.length > 0) {
    nextScreenWindows[0].focusWindow();
    restore_mouse_position_for_window(nextScreenWindows[0]);
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
