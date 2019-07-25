import * as _ from "lodash";
import { A_BIG_PIXEL } from "./config";
import { restoreMousePositionForWindow, saveMousePositionForWindow } from './mouse';
import { getCurrentWindow, sortByMostRecent } from "./window";

export function moveToScreen(window: Window, screen: Screen) {
  if (!window) { return; }
  if (!screen) { return; }

  const frame = window.frame();
  const oldScreenRect = window.screen().visibleFrame();
  const newScreenRect = screen.visibleFrame();
  const xRatio = newScreenRect.width / oldScreenRect.width;
  const yRatio = newScreenRect.height / oldScreenRect.height;

  const mid_pos_x = frame.x + Math.round(0.5 * frame.width);
  const mid_pos_y = frame.y + Math.round(0.5 * frame.height);

  window.setFrame({
    x: (mid_pos_x - oldScreenRect.x) * xRatio + newScreenRect.x - 0.5 * frame.width,
    y: (mid_pos_y - oldScreenRect.y) * yRatio + newScreenRect.y - 0.5 * frame.height,
    width: frame.width,
    height: frame.height,
  });
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
  if (!window) { return; }
  const currentScreen = window.screen();
  if (window.screen() === targetScreen) { return; }
  // if (targetScreen.flippedFrame().x < currentScreen.flippedFrame().x) {
  // return;
  // }
  saveMousePositionForWindow(window);
  const targetScreenWindows = sortByMostRecent(targetScreen.windows());
  if (targetScreenWindows.length === 0) {
    return;
  }
  const targetWindow = targetScreenWindows[0]
  targetWindow.focus(); // bug, two window in two space, focus will focus in same space first
  restoreMousePositionForWindow(targetWindow);
  // App.get('Finder').focus(); // Hack for Screen unfocus
}

// TODO use a state save status
export function getAnotherWindowsOnSameScreen(window: Window, offset: number, isCycle: boolean): Window | null {
  let windows = window.others({ visible: true, screen: window.screen() });
  windows.push(window);
  const screen = window.screen();
  windows = _.chain(windows).sortBy((x) => {
      return [(A_BIG_PIXEL + x.frame().y - screen.flippedFrame().y) +
          (A_BIG_PIXEL + x.frame().x - screen.flippedFrame().y),
      x.app().processIdentifier(), x.title()].join('');
  }).value();
  const index: number = isCycle ?
      (_.indexOf(windows, window) + offset + windows.length) % windows.length
      :
      _.indexOf(windows, window) + offset;
  // alert(windows.length);
  // alert(_.map(windows, (x) => {return x.title();}).join(','));
  // alert(_.map(windows, (x) => {return x.app().name();}).join(','));
  if (index >= windows.length || index < 0) {
      return null;
  }
  return windows[index];
}

export function getPreviousWindowsOnSameScreen(window: Window): Window | null {
  return getAnotherWindowsOnSameScreen(window, -1, false)
};

export function getNextWindowsOnSameScreen(window: Window): Window | null {
  return getAnotherWindowsOnSameScreen(window, 1, false)
};

export function switchScrren(current: Window, targetScreenFn: (screen: Screen) => Screen) {
  const window = current;
  const allScreens = Screen.all();
  const currentScreen = window.screen();
  if (currentScreen === undefined) {
    return; // TODO use mouse to find current screen
  }
  const targetScreen = targetScreenFn(currentScreen);
  if (_.indexOf(_.map(allScreens, (x) => x.hash()), targetScreen.hash())
    >= _.indexOf(_.map(allScreens, (x) => x.hash()), currentScreen.hash())) {
    return;
  }
  focusAnotherScreen(window, targetScreen);
}

export function moveCurrentWindowToScreen(targetScreenFn: (window: Window) => Screen) {
  const window = getCurrentWindow();
  const targetScreen = targetScreenFn(window);
  if (window.screen() === targetScreen) { return; }
  if (targetScreen.flippedFrame().x < 0) {
    return;
  }
  moveToScreen(window, targetScreen);
  restoreMousePositionForWindow(window);
  // App.get('Finder').focus(); // Hack for Screen unfocus
  window.focus();
}
