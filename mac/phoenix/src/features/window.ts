import * as _ from 'lodash';
import * as config from '../config';
import { restoreMousePositionForWindow, saveMousePositionForWindow } from '../lib/mouse';
import { windowsOnOtherScreen } from './screen';
import { displayAllVisiableWindowModal, log } from '../lib/util';

export function sortByMostRecent(windows: Window[]): Window[] {
  // var start = new Date().getTime();
  const windowsRecent = Window.recent();
  const visibleAppMostRecentFirst = _.map(windowsRecent, (w) => w.hash());
  // Phoenix.log('Time s0: ' + (new Date().getTime() - start));
  const visibleAppMostRecentFirstWithWeight = _.zipObject(
    visibleAppMostRecentFirst,
    _.range(visibleAppMostRecentFirst.length)
  );
  return _.sortBy(windows, (window) => visibleAppMostRecentFirstWithWeight[window.hash()]);
}

export function calcResizeFrame(frame: Rectangle, ratio: number): Rectangle {
  return {
    x: Math.round(frame.x + (frame.width / 2) * (1 - ratio)),
    y: Math.round(frame.y + (frame.height / 2) * (1 - ratio)),
    width: Math.round(frame.width * ratio),
    height: Math.round(frame.height * ratio),
  };
}

export function calcSmallerFrame(frame: Rectangle): Rectangle {
  return calcResizeFrame(frame, 0.75);
}

export function calcSmallerFrameSticky(frame: Rectangle, screenFrame: Rectangle): Rectangle {
  const newFrame = calcSmallerFrame(frame);

  // sticky when not max
  if (!(frame.width === screenFrame.width && frame.height === screenFrame.height)) {
    // sticky to screen
    if (frame.width === screenFrame.width) {
      newFrame.width = screenFrame.width;
    }
    if (frame.height === screenFrame.height) {
      newFrame.height = screenFrame.height;
    }
    if (frame.x === screenFrame.x) {
      newFrame.x = screenFrame.x;
    }
    if (frame.y === screenFrame.y) {
      newFrame.y = screenFrame.y;
    }
    if (frame.x + frame.width === screenFrame.x + screenFrame.width) {
      newFrame.x = screenFrame.x + screenFrame.width - newFrame.width;
    }
    if (frame.y + frame.height === screenFrame.y + screenFrame.height) {
      newFrame.y = screenFrame.y + screenFrame.height - newFrame.height;
    }
  }
  return newFrame;
}

export function calcLargerFrame(frame: Rectangle): Rectangle {
  return calcResizeFrame(frame, 1.25);
}

export function getCurrentWindow(): Window | undefined {
  const windowOptional = Window.focused();
  if (windowOptional !== undefined) {
    return windowOptional;
  }
  // FIXME sometime mainWindow is undefined
  return App.focused().mainWindow();
}

export function hideInactiveWindow(windows: Window[]) {
  const now = new Date().getTime() / 1000;
  _.chain(windows)
    .filter((window) => {
      if (!config.ACTIVE_WINDOWS_TIMES[window.app().processIdentifier()]) {
        config.ACTIVE_WINDOWS_TIMES[window.app().processIdentifier()] = now;
        return false;
      } else {
        return true;
      }
    })
    .filter((window) => {
      return (
        now - config.ACTIVE_WINDOWS_TIMES[window.app().processIdentifier()] >
        config.HIDE_INACTIVE_WINDOW_TIME * 60
      );
      // return now - ACTIVE_WINDOWS_TIMES[window.app().pid]> 5;
    })
    .map((window) => {
      window.app().hide();
    });
}

export function heartbeatWindow(window: Window) {
  config.ACTIVE_WINDOWS_TIMES[window.app().processIdentifier()] = new Date().getTime() / 1000;
  // hide_inactiveWindow(window.otherWindowsOnSameScreen());
}

export function setWindowCentral(window: Window) {
  window.setTopLeft({
    x:
      (window.screen().flippedFrame().width - window.size().width) / 2 +
      window.screen().flippedFrame().x,
    y:
      (window.screen().flippedFrame().height - window.size().height) / 2 +
      window.screen().flippedFrame().y,
  });
  heartbeatWindow(window);
}

export function autoRangeByRecent() {
  const screen = Screen.main();
  const frame = screen.flippedVisibleFrame();

  const windows: Window[] = sortByMostRecent(screen.windows({ visible: true }));
  _.map(windows, (window, index) => {
    window.setTopLeft({
      x: frame.x + index * 100,
      y: frame.y,
    });
    window.setSize({
      //   width: (window.topLeft().x + window.size().width) > (frame.x + frame.width) ?  frame.x + frame.width - window.topLeft().x: window.size().width,
      width: window.size().width,
      height: frame.height,
    });
  });
}

export function focusWindowInSameScreen(
  window: Window | undefined,
  windowsFn: (window: Window) => Window[],
  selectFn: (window: Window | undefined, windows: Window[]) => Window | undefined
) {
  if (window === undefined) {
    return;
  }
  const screen = Screen.main();
  const rectangle = screen.flippedFrame();
  const windows = windowsFn(window);
  saveMousePositionForWindow(window);
  const targetWindow = selectFn(window, windows);
  // const targetWindow = getPreviousWindowsOnSameScreen(window);
  if (!targetWindow) {
    return;
  }
  log(`focusWindowInSameScreen.targetWindow: ${targetWindow.title()}`);
  targetWindow.focus();
  // TODO cannot focus Chrome on same screen, if two Chrome in two Screen.
  restoreMousePositionForWindow(targetWindow);
  displayAllVisiableWindowModal(windows, targetWindow, rectangle);
}

export function marginWindow(positionFn: (window: Window, frame: Rectangle) => any) {
  const frame = Screen.main().flippedVisibleFrame();
  const window = Window.focused();

  if (window === undefined) {
    return;
  }
  positionFn(window, frame);
}

export function isMax(windowSize: Size, screenSize: Size): boolean {
  return windowSize.width === screenSize.width && windowSize.height === screenSize.height;
}

/**
 * Window geometry handlers
 *
 * Extracted from the inline Key.on bodies so phoenix.ts is a thin binding list.
 * Behavior is preserved 1:1 with the previous inline handlers.
 */

const windowRestoreSizeMap: { [name: string]: Size } = {};
const windowRestorePositionMap: { [name: string]: Point } = {};

// Move and/or resize the focused window by the given deltas in one call.
// Covers the 8 former move/enlarge arrow handlers (dw/dh are 0 for pure moves).
export function adjustFrame(dx: number, dy: number, dw: number, dh: number) {
  const window = getCurrentWindow();
  if (window === undefined) {
    return;
  }
  const frame = window.frame();
  window.setFrame({
    x: frame.x + dx,
    y: frame.y + dy,
    width: frame.width + dw,
    height: frame.height + dh,
  });
}

export type HalfSide = 'top' | 'bottom' | 'left' | 'right';

// Snap the focused window to a half of the screen (former k/j/h/l + MASH_CTRL_SHIFT).
export function snapHalf(side: HalfSide) {
  const screen = Screen.main().flippedVisibleFrame();
  const window = Window.focused();
  if (window === undefined) {
    return;
  }
  const frame = window.frame();
  if (frame === undefined) {
    return;
  }
  switch (side) {
    case 'top':
      window.setSize({ width: frame.width, height: screen.height / 2 });
      window.setTopLeft({ x: frame.x, y: screen.y });
      break;
    case 'bottom':
      window.setSize({ width: frame.width, height: screen.height / 2 });
      window.setTopLeft({ x: frame.x, y: screen.y + screen.height / 2 });
      break;
    case 'left':
      window.setSize({ width: screen.width / 2, height: frame.height });
      window.setTopLeft({ x: screen.x, y: frame.y });
      break;
    case 'right':
      window.setSize({ width: screen.width / 2, height: frame.height });
      window.setTopLeft({ x: screen.x + screen.width / 2, y: frame.y });
      break;
  }
}

// Toggle maximize / restore previous size+position (former m + MASH_CTRL_SHIFT).
export function toggleMaximize() {
  const window = getCurrentWindow();
  if (window === undefined) {
    return;
  }
  const screenSize = window.screen().flippedVisibleFrame();
  if (isMax(window.size(), screenSize)) {
    if (windowRestoreSizeMap[window.hash()]) {
      window.setSize(windowRestoreSizeMap[window.hash()]);
    }
    if (windowRestorePositionMap[window.hash()]) {
      window.setTopLeft(windowRestorePositionMap[window.hash()]);
    }
  } else {
    windowRestoreSizeMap[window.hash()] = window.size();
    windowRestorePositionMap[window.hash()] = window.topLeft();
    window.maximize();
    setWindowCentral(window);
  }
}

// Shrink, sticking to the border when maximized (former - + MASH_CTRL).
export function shrinkWindow() {
  const window = getCurrentWindow();
  if (window === undefined) {
    return;
  }
  const frame: Rectangle = window.frame();
  const screenFrame = window.screen().flippedVisibleFrame();
  window.setFrame(calcSmallerFrameSticky(frame, screenFrame));
}

// Enlarge, clamped to the screen (former = + MASH_CTRL).
export function enlargeWindow() {
  const window = getCurrentWindow();
  if (window === undefined) {
    return;
  }
  const newFrame = calcLargerFrame(window.frame());
  const screenFrame = window.screen().flippedFrame();
  const maxWidth = screenFrame.width;
  const maxHeight = screenFrame.height;

  if (newFrame.width > maxWidth) {
    newFrame.width = maxWidth;
  }
  if (newFrame.height > maxHeight) {
    newFrame.height = maxHeight;
  }
  if (newFrame.x < screenFrame.x) {
    newFrame.x = screenFrame.x;
  }
  if (newFrame.x + newFrame.width > screenFrame.x + screenFrame.width) {
    newFrame.x = screenFrame.x + screenFrame.width - newFrame.width;
  }

  window.setFrame(newFrame);
}

// Center the focused window (former m + MASH_CTRL).
export function centralizeWindow() {
  const window = getCurrentWindow();
  if (window === undefined) {
    return;
  }
  setWindowCentral(window);
}

// Stretch to full screen height (former \ + MASH_CTRL_SHIFT).
export function maximizeHeight() {
  const window = getCurrentWindow();
  if (window === undefined) {
    return;
  }
  let y = window.screen().flippedFrame().y;
  let height = window.screen().flippedFrame().height;
  // patch for vivaldi
  if (window.app().name() === 'Vivaldi') {
    y = y + 20;
    height = height - 20;
  }
  window.setFrame({
    x: window.frame().x,
    y,
    width: window.frame().width,
    height,
  });
}

// Stretch to full screen width (former - + MASH_CTRL_SHIFT).
export function maximizeWidth() {
  const window = getCurrentWindow();
  if (window === undefined) {
    return;
  }
  window.setFrame({
    x: window.screen().flippedFrame().x,
    y: window.frame().y,
    width: window.screen().flippedFrame().width,
    height: window.frame().height,
  });
}

// Grow width to the left (former , + MASH_CTRL_SHIFT).
export function growWidthLeft() {
  const window = Window.focused();
  if (window === undefined) {
    return;
  }
  window.setSize({
    width: window.size().width + 200,
    height: window.size().height,
  });
  window.setTopLeft({
    x: window.topLeft().x - 200,
    y: window.topLeft().y,
  });
}

// Grow width to the right (former . + MASH_CTRL_SHIFT).
export function growWidthRight() {
  const window = Window.focused();
  if (window === undefined) {
    return;
  }
  window.setSize({
    width: window.size().width + 200,
    height: window.size().height,
  });
}

// Edge-snap handlers (former h/l/k/j + MASH_CTRL), built on marginWindow.
export function marginLeft() {
  marginWindow((window: Window, frame: Rectangle) => {
    window.setTopLeft({ x: frame.x, y: window.topLeft().y });
  });
}

export function marginRight() {
  marginWindow((window: Window, frame: Rectangle) => {
    window.setTopLeft({
      x: frame.x + (frame.width - window.size().width),
      y: window.topLeft().y,
    });
  });
}

export function marginTop() {
  marginWindow((window: Window, frame: Rectangle) => {
    window.setTopLeft({ x: window.topLeft().x, y: frame.y });
  });
}

export function marginBottom() {
  marginWindow((window: Window, frame: Rectangle) => {
    window.setTopLeft({
      x: window.topLeft().x,
      y: frame.y + (frame.height - window.size().height),
    });
  });
}
