/**
 * Phoenix
 * doc: https://github.com/jasonm23/phoenix/wiki/JavaScript-API-documentation
 *
 * Global Settings
 */

var mash = ["alt"];
var mashShift = ["alt", "shift"];
var mashCtrl = ["alt", "ctrl"];
var CMD_BTN = ["cmd"];
var mousePositions = {};
var HIDE_INACTIVE_WINDOW_TIME = 10;  // minitus
var ACTIVE_WINDOWS_TIMES = {};
var DEFAULT_WIDTH = 1280;


/**
 * Utils Functions
 */

function alert(message) {
  var modal = new Modal();
  modal.message = message;
  modal.duration = 2;
  modal.show();
}

var alert_title = function(window) { Modal.show(window.title()); };

function sortByMostRecent(windows) {
  var visibleAppMostRecentFirst = _.map(Window.visibleWindowsInOrder(),
                                        function(w) { return w.app().name(); });
  var visibleAppMostRecentFirstWithWeight = _.object(visibleAppMostRecentFirst,
                                                     _.range(visibleAppMostRecentFirst.length));
  return _.sortBy(windows, function(window) { return visibleAppMostRecentFirstWithWeight[window.app().name()]; });
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
  var oldScreenRect = window.screen().frameInRectangle();
  var newScreenRect = screen.frameInRectangle();
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
  var start = new Date().getTime();
  var otherWindowsOnSameScreen = Window.focusedWindow().otherWindowsOnSameScreen();  // slow
  Phoenix.log('windowsOnOtherScreen 0.1: ' + (new Date().getTime() - start));
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
  var start = new Date().getTime();
  var windows = window.otherWindowsOnSameScreen(); // slow, makes `Saved spin report for Phoenix version 1.2 (1.2) to /Library/Logs/DiagnosticReports/Phoenix_2015-05-30-170354_majin.spin`
  Phoenix.log('getAnotherWindowsOnSameScreen 1: ' + (new Date().getTime() - start));
  windows.push(window);
  windows = _.chain(windows).sortBy(function(window) {
    return [window.frame().x, window.frame().y, window.app().pid, window.title()].join('_');
  }).value().reverse();
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
  mousePositions[window.title()] = Mouse.location();
}

function set_mouse_position_for_window_center(window) {
  Mouse.moveTo({
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
  var app = _.find(App.runningApps(), function(x) { return x.name() == appName});
  if (app === undefined) {
    app = App.launch(appName);
  }
  app.activate();
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
 * My Configuartion App
 */

// Launch App
Phoenix.bind('`', mash, function() { callApp('iTerm'); });
Phoenix.bind('1', mash, function() { callApp('Firefox'); });
Phoenix.bind('2', mash, function() { callApp('Google Chrome'); });
Phoenix.bind('3', mash, function() { callApp('QQ'); });
Phoenix.bind('e', mash, function() { callApp('Preview'); });
Phoenix.bind('a', mash, function() { callApp('MacVim'); });
Phoenix.bind('s', mash, function() { callApp('IntelliJ IDEA 14'); });
//Phoenix.bind('z', mash, function() { callApp('Mou'); });
Phoenix.bind('z', mash, function() { callApp('Macdown'); });
//Phoenix.bind('z', mash, function() { callApp('Typora'); });
//Phoenix.bind('z', mash, function() { callApp('Atom'); });
Phoenix.bind(',', mash, function() { callApp('Google Chrome'); });
Phoenix.bind('9', mash, function() { callApp('NeteaseMusic'); });
//Phoenix.bind(',', mash, function() { callApp('Sparrow'); });
//Phoenix.bind(',', mash, function() { callApp('Inky'); });
Phoenix.bind('.', mash, function() { callApp('Evernote'); });
Phoenix.bind('/', mash, function() { callApp('Finder'); });


/**
 * My Configuartion Screen
 */

// Next screen, now only support 2 display // TODO
Phoenix.bind('l', mash, function() {
  var window = Window.focusedWindow();
  if (!window) return;
  if (window.screen() === window.screen().next()) return;
  if (window.screen().next().frameInRectangle().x < window.screen().frameInRectangle().x) {
    return;
  }
  save_mouse_position_for_window(window);
  var nextScreenWindows = sortByMostRecent(windowsOnOtherScreen());
  if (nextScreenWindows.length > 0) {
    nextScreenWindows[0].focus();
    restore_mouse_position_for_window(nextScreenWindows[0]);
  }
});

// Previous Screen, now only support 2 display // TODO
Phoenix.bind('h', mash, function() {
  var window = Window.focusedWindow();
  if (!window) return;
  if (window.screen() === window.screen().next()) return;
  if (window.screen().next().frameInRectangle().x > window.screen().frameInRectangle().x) {
    return;
  }
  save_mouse_position_for_window(window);
  var nextScreenWindows = sortByMostRecent(windowsOnOtherScreen());  // find it!!! cost !!!
  if (nextScreenWindows.length > 0) {
    nextScreenWindows[0].focus();
    restore_mouse_position_for_window(nextScreenWindows[0]);
  }
});

// Move Current Window to Next Screen
Phoenix.bind('l', mashShift, function() {
  var window = Window.focusedWindow();
  if (!window) return;
  if (window.screen() === window.screen().next()) return;
  if (window.screen().next().frameInRectangle().x < 0) {
    return;
  }
  moveToScreen(window, window.screen().next());
});

// Move Current Window to Previous Screen
Phoenix.bind('h', mashShift, function() {
  var window = Window.focusedWindow();
  if (!window) return;
  if (window.screen() === window.screen().next()) return;
  if (window.screen().next().frameInRectangle().x == 0) {
    return;
  }
  moveToScreen(window, window.screen().previous());
});


/**
 * My Configuartion Window
 */

// Window Hide Inactive
Phoenix.bind('delete', mash, function() {
  var window = Window.focusedWindow();
  if (!window) return;
  heartbeat_window(window);
  hide_inactiveWindow(window.otherWindowsOnAllScreens());
});

//Phoenix.bind('h', CMD_BTN, function() {
  //var window = Window.focusedWindow();
  //if (!window) return;
  //window.app().hide();
  //var window = Window.focusedWindow();
  //Modal.show(window.title());  // TODO need delay
  //if (!window) return;
  //restore_mouse_position_for_window(window);
//});

// Window Maximize
Phoenix.bind('m', mashShift, function() {
  var window = Window.focusedWindow();
  if (!window) return;
  window.maximize();
  setWindowCentral(window);
  //heartbeat_window(window);
});

// Window Smaller
Phoenix.bind('-', mash, function() {
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
Phoenix.bind('=', mash, function() {
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
});

// Window Central
Phoenix.bind('m', mash, function() {
  var window = Window.focusedWindow();
  if (!window) return;
  setWindowCentral(window);
});

// Window Height
Phoenix.bind('\\', mash, function() {
  var window = Window.focusedWindow();
  if (!window) return;
  window.setFrame({
    x: window.frame().x,
    y: window.screen().frameInRectangle().y,
    width: window.frame().width,
    height: window.screen().frameInRectangle().height
  });
  heartbeat_window(window);
});

// Window Width
Phoenix.bind('\\', mashShift, function() {
  var window = Window.focusedWindow();
  if (!window) return;
  window.setFrame({
    x: window.frame().x,
    y: window.screen().frameInRectangle().y,
    width: DEFAULT_WIDTH,  // Mac width
    height: window.frame().height
  });
  heartbeat_window(window);
});

// Window >
Phoenix.bind('l', mashCtrl, function() {
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
Phoenix.bind('h', mashCtrl, function() {
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
Phoenix.bind('k', mashCtrl, function() {
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
Phoenix.bind('j', mashCtrl, function() {
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
Phoenix.bind('k', mash, function() {
  var window = Window.focusedWindow();
  if (!window) {
    if (Window.visibleWindowsInOrder().length == 0) return;
    Window.visibleWindowsInOrder()[0].focus();
    return;
  }
  save_mouse_position_for_window(window);
  var targetWindow = getNextWindowsOnSameScreen(window);
  targetWindow.focus();
  restore_mouse_position_for_window(targetWindow);
});

// Previous Window in One Screen
Phoenix.bind('j', mash, function() {
  var window = Window.focusedWindow();
  if (!window) {
    if (Window.visibleWindowsInOrder().length == 0) return;
    Window.visibleWindowsInOrder()[0].focus();
    return;
  }
  save_mouse_position_for_window(window);
  var targetWindow = getPreviousWindowsOnSameScreen(window);  // <- most time cost
  targetWindow.focus();
  restore_mouse_position_for_window(targetWindow);
});


/**
 * My Configuartion Mouse
 */

// Central Mouse
Phoenix.bind('space', mash, function() {
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
Phoenix.bind('0', mash, function() {
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
  var modal = new Modal();
  modal.message = 'F!';
  modal.duration = 2;
  modal.show();
});

