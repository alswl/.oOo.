

import * as _ from "lodash";
import {set_mouse_position_for_window_center, save_mouse_position_for_window, restore_mouse_position_for_now, restore_mouse_position_for_window} from './mouse'
import { sortByMostRecent } from "./window";


export function moveToScreen(window: Window, screen: Screen) {
  if (!window) return;
  if (!screen) return;

  var frame = window.frame();
  var oldScreenRect = window.screen().visibleFrame();
  var newScreenRect = screen.visibleFrame();
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

export function windowsOnOtherScreen(): Window[] {
  let windowOptional = Window.focused();
  if (windowOptional === undefined) {
    return [];
  }

  let window = windowOptional as Window;
  var otherWindowsOnSameScreen = window.others({ screen: window.screen() }); // slow
  var otherWindowTitlesOnSameScreen = _.map(otherWindowsOnSameScreen, function (w) { return w.title(); });
  var return_value = _.chain(window.others())
    .filter(function (window) { return !_.includes(otherWindowTitlesOnSameScreen, window.title()); })
    .value();
  return return_value;
};


export function focusAnotherScreen(window: Window, targetScreen: Screen) {
  if (!window) return;
  const currentScreen = window.screen();
  if (window.screen() === targetScreen) return;
  //if (targetScreen.flippedFrame().x < currentScreen.flippedFrame().x) {
  //return;
  //}
  save_mouse_position_for_window(window);
  var targetScreenWindows = sortByMostRecent(targetScreen.windows());
  if (targetScreenWindows.length == 0) {
    return;
  }
  var targetWindow = targetScreenWindows[0]
  targetWindow.focus(); // bug, two window in two space, focus will focus in same space first
  restore_mouse_position_for_window(targetWindow);
  //App.get('Finder').focus(); // Hack for Screen unfocus
}