import * as _ from "lodash";
import { A_BIG_PIXEL, RESIZE_WITH_RATIO } from "./config";
import { restoreMousePositionForWindow, saveMousePositionForWindow } from './mouse';
import { log } from "./util";
import { getCurrentWindow, sortByMostRecent } from "./window";


// let SCREEN_LATEST_WINDOW: { [screen: string]: Window } = {};
let SCREEN_LATEST_WINDOW = new Map<number, Window>();

export function moveToScreen(window: Window, screen: Screen) {

  const app = window.app();
  const currentSpaces = window.spaces();
  const windowFrame = window.frame();
  const currentScreenFrame = window.screen().flippedVisibleFrame();
  const targetScreenFrame = screen.flippedVisibleFrame();

  let widthRatio = 1;
  let heightRatio = 1;
  if (RESIZE_WITH_RATIO) {
    widthRatio = targetScreenFrame.width / currentScreenFrame.width;
    heightRatio = targetScreenFrame.height / currentScreenFrame.height;
  }

  const x = (windowFrame.x - currentScreenFrame.x) * widthRatio + targetScreenFrame.x;
  const y = (windowFrame.y - currentScreenFrame.y) * heightRatio + targetScreenFrame.y;
  const width = windowFrame.width * widthRatio;
  const height = windowFrame.height * heightRatio;
  log(`widthRatio ${widthRatio}, heightRatio ${heightRatio}`)
  log(`windowFrame, ${windowFrame.x}, ${windowFrame.y}`);
  log(`currentScreenFrame, ${currentScreenFrame.x}, ${currentScreenFrame.y}`);
  log(`targetScreenFrame, ${targetScreenFrame.x}, ${targetScreenFrame.y}`);
  log(`x: ${x}`);
  log(`y: ${y}`);

  window.setFrame({
    x,
    y,
    width,
    height,
  });
  const targetSpace = screen.currentSpace();
  if (targetSpace === undefined) {
    log('moveToScreen, no screen.currentSpace()');
    return;
  }

  // force focus window in space
  // targetSpace.addWindows([window]);
  // currentSpaces.forEach((x) => { x.removeWindows([window]) });
  // window.raise();
  // app.activate();
  app.hide();
  app.show();
};

export function windowsOnOtherScreen(): Window[] {
  const windowOptional = Window.focused();
  if (windowOptional === undefined) {
    return [];
  }

  const window = windowOptional;
  const otherWindowsOnSameScreen = window.others({ screen: window.screen() }); // slow
  const otherWindowTitlesOnSameScreen = _.map(otherWindowsOnSameScreen, (w) => w.title());
  const return_value = _.chain(window.others())
    .filter((x: Window) => !_.includes(otherWindowTitlesOnSameScreen, x.title()))
    .value();
  return return_value;
};

function getScreenLatestWindow(screen: Screen): Window | null {
  const start = new Date().getTime();
  const nextScreenWindows = screen.windows({ visible: true }); // slow XXX
  // const nextScreenWindows = targetScreen.windows(); // slow XXX
  Phoenix.log('Time 2: ' + (new Date().getTime() - start));
  const targetScreenWindows = sortByMostRecent(nextScreenWindows); // ok
  if (targetScreenWindows.length === 0) {
    log("focusAnotherScreen, target no window");
    Mouse.move({
      x: screen.frame().x + screen.frame().width / 2,
      y: screen.frame().y + screen.frame().height / 2,
    })
    return null;
  }
  Phoenix.log('Time 2.1: ' + (new Date().getTime() - start));
  const targetWindow = targetScreenWindows[0];
  Phoenix.log('Time 2.2: ' + (new Date().getTime() - start));
  return targetWindow;
}

export function focusAnotherScreen(window: Window, targetScreen: Screen) {
  const start = new Date().getTime();
  const currentScreen = window.screen();
  // TODO using cache
  // if (SCREEN_LATEST_WINDOW.has(currentScreen.hash())) {
  //   return SCREEN_LATEST_WINDOW.get(currentScreen.hash());
  // }

  Phoenix.log('Time 1: ' + (new Date().getTime() - start));

  saveMousePositionForWindow(window);
  const targetWindow = getScreenLatestWindow(targetScreen);
  if (targetWindow === null) {
    return;
  }

  Phoenix.log('Time 1.1: ' + (new Date().getTime() - start));
  targetWindow.focus(); // bug, two window in two space, focus will focus in same space first
  restoreMousePositionForWindow(targetWindow); // ok
  // App.get('Finder').focus(); // Hack for Screen unfocus
}

export function sortedWindowsOnSameScreen(window: Window): Window[] {
  let windows = window.others({ visible: true, screen: window.screen() });
  windows.push(window);
  const screen = window.screen();
  windows = _.chain(windows).sortBy((x) => {
    return [(A_BIG_PIXEL + x.frame().y - screen.flippedFrame().y) +
      (A_BIG_PIXEL + x.frame().x - screen.flippedFrame().y),
    x.app().processIdentifier(), x.title()].join('');
  }).value();
  log(`sortedWindowsOnSameScreen: ${windows.map((x) => '"' + x.title() + '"').join(", ")}`);
  return windows;
}

// TODO use a state save status
export function otherWindowOnSameScreen(windows: Window[], window: Window, offset: number, isCycle: boolean): Window | null {
  const index: number = isCycle ?
    (_.indexOf(windows, window) + offset + windows.length) % windows.length
    :
    _.indexOf(windows, window) + offset;
  if (index >= windows.length || index < 0) {
    log("otherWindowOnSameScreen, no window");
    return null;
  }
  return windows[index];
}

export function getPreviousWindowsOnSameScreen(window: Window, windows: Window[]): Window | null {
  return otherWindowOnSameScreen(windows, window, -1, false)
};

export function getNextWindowsOnSameScreen(window: Window, windows: Window[]): Window | null {
  return otherWindowOnSameScreen(windows, window, 1, false)
};

export function switchScreen(current: Window, targetScreenFn: (screen: Screen) => Screen,
  validationFn: (allScreens: Screen[], currentScreen: Screen, targetScreen: Screen) => boolean) {
  const allScreens = Screen.all();
  const currentScreen = current.screen();
  if (currentScreen === undefined) {
    log("switchScrren, no current Screen");
    return; // TODO use mouse to find current screen
  }
  const targetScreen = targetScreenFn(currentScreen);
  if (!validationFn(allScreens, currentScreen, targetScreen)) {
    log(`switchScrren, validate fn failed, currentScreen: ${currentScreen.identifier()}, targetScreen: ${targetScreen.identifier()}`);
    return;
  }
  focusAnotherScreen(current, targetScreen);
}

export function moveWindowToScreen(window: Window, targetScreenFn: (window: Window) => Screen) {
  const targetScreen = targetScreenFn(window);
  if (window.screen().hash() === targetScreen.hash()) {
    log("moveWindowToScreen, smae screen");
    return;
  }
  // if (targetScreen.flippedFrame().x < 0) {
  //   return;
  // }

  moveToScreen(window, targetScreen);
  restoreMousePositionForWindow(window);
  // App.get('Finder').focus(); // Hack for Screen unfocus
  window.focus();
}

export function focusNextScreen() {
  switchScreen(
    getCurrentWindow(),
    (screen: Screen) => screen.next(),
    (allScreens: Screen[], currentScreen: Screen, targetScreen: Screen) => {
      return true;
      // return _.indexOf(_.map(allScreens, (x) => x.hash()), targetScreen.hash()) < _.indexOf(_.map(allScreens, (x) => x.hash()), currentScreen.hash());
    });
  // const current = getCurrentWindow();
  // const currentScreen = current.screen();
  // currentScreen.next()
}

export function focusPreviousScreen() {
  switchScreen(
    getCurrentWindow(),
    (screen: Screen) => screen.previous(),
    (allScreens: Screen[], currentScreen: Screen, targetScreen: Screen) => {
      return true;
      // return _.indexOf(_.map(allScreens, (x) => x.hash()), targetScreen.hash()) > _.indexOf(_.map(allScreens, (x) => x.hash()), currentScreen.hash());
    });
}
