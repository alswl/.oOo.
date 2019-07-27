import * as _ from "lodash";
import { A_BIG_PIXEL } from "./config";
import { restoreMousePositionForWindow, saveMousePositionForWindow } from './mouse';
import { log } from "./util";
import { sortByMostRecent } from "./window";

export function moveToScreen(window: Window, screen: Screen) {
  const app = window.app();
  const currentSpaces = window.spaces();
  const windowFrame = window.frame();
  const currentScreenFrame = window.screen().flippedVisibleFrame();
  const targetScreenFrame = screen.flippedVisibleFrame();
  const widthRatio = targetScreenFrame.width / currentScreenFrame.width;
  const heightRatio = targetScreenFrame.height / currentScreenFrame.height;
  log(`widthRatio ${widthRatio}, heightRatio ${heightRatio}`)
  log(`windowFrame, ${windowFrame.x}, ${windowFrame.y}`);
  log(`currentScreenFrame, ${currentScreenFrame.x}, ${currentScreenFrame.y}`);
  log(`targetScreenFrame, ${targetScreenFrame.x}, ${targetScreenFrame.y}`);

  log(`x: ${(windowFrame.x - currentScreenFrame.x) * widthRatio + targetScreenFrame.x}`);
  log(`y: ${(windowFrame.y - currentScreenFrame.y) * heightRatio + targetScreenFrame.y}`);

  window.setFrame({
    x: (windowFrame.x - currentScreenFrame.x) * widthRatio + targetScreenFrame.x,
    y: (windowFrame.y - currentScreenFrame.y) * heightRatio + targetScreenFrame.y,
    width: windowFrame.width * widthRatio,
    height: windowFrame.height * heightRatio,
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

export function focusAnotherScreen(window: Window, targetScreen: Screen) {
  const currentScreen = window.screen();
  if (window.screen().hash() === targetScreen.hash()) {
    log("focusAnotherScreen, target equales current");
    return;
  }
  // if (targetScreen.flippedFrame().x < currentScreen.flippedFrame().x) {
  // return;
  // }

  saveMousePositionForWindow(window);
  const targetScreenWindows = sortByMostRecent(targetScreen.windows());
  if (targetScreenWindows.length === 0) {
    log("focusAnotherScreen, target no window");
    return;
  }
  const targetWindow = targetScreenWindows[0]
  targetWindow.focus(); // bug, two window in two space, focus will focus in same space first
  restoreMousePositionForWindow(targetWindow);
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

export function switchScrren(current: Window, targetScreenFn: (screen: Screen) => Screen,
                             validationFn: (allScreens: Screen[], currentScreen: Screen, targetScreen: Screen) => boolean) {
  const allScreens = Screen.all();
  const currentScreen = current.screen();
  if (currentScreen === undefined) {
    return; // TODO use mouse to find current screen
  }
  const targetScreen = targetScreenFn(currentScreen);
  if (!validationFn(allScreens, currentScreen, targetScreen)) { return; }
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
