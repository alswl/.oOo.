import * as _ from "lodash";
import { restoreMousePositionForWindow, saveMousePositionForWindow } from './mouse';
import { sortByMostRecent } from "./window";

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
