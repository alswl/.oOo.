import { restoreMousePositionForWindow, saveMousePositionForWindow } from '../lib/mouse';
import { displayAllVisiableWindowModal, log } from '../lib/util';
import { getCurrentWindow } from '../runtime/current-window';
import {
  clearRestoreFrame,
  getRestoreFrame,
  heartbeatWindow,
  hideInactiveWindows,
  saveRestoreFrame,
} from '../runtime/window-state';

export function sortByMostRecent(windows: Window[]): Window[] {
  const recentRanks = new Map(Window.recent().map((window, index) => [window.hash(), index]));
  return [...windows].sort(
    (left, right) =>
      (recentRanks.get(left.hash()) ?? Number.MAX_SAFE_INTEGER) -
      (recentRanks.get(right.hash()) ?? Number.MAX_SAFE_INTEGER)
  );
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

export function clampFrameToScreen(frame: Rectangle, screenFrame: Rectangle): Rectangle {
  const width = Math.min(frame.width, screenFrame.width);
  const height = Math.min(frame.height, screenFrame.height);
  return {
    x: Math.min(Math.max(frame.x, screenFrame.x), screenFrame.x + screenFrame.width - width),
    y: Math.min(Math.max(frame.y, screenFrame.y), screenFrame.y + screenFrame.height - height),
    width,
    height,
  };
}

export const hideInactiveWindow = hideInactiveWindows;

export function setWindowCentral(window: Window) {
  const screenFrame = window.screen().flippedVisibleFrame();
  const windowFrame = window.frame();
  window.setTopLeft({
    x: screenFrame.x + (screenFrame.width - windowFrame.width) / 2,
    y: screenFrame.y + (screenFrame.height - windowFrame.height) / 2,
  });
  heartbeatWindow(window);
}

export function autoRangeByRecent() {
  const screen = Screen.main();
  const frame = screen.flippedVisibleFrame();

  const windows: Window[] = sortByMostRecent(screen.windows({ visible: true }));
  windows.forEach((window, index) => {
    const windowFrame = window.frame();
    window.setTopLeft({
      x: frame.x + index * 100,
      y: frame.y,
    });
    window.setSize({
      width: windowFrame.width,
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

export function marginWindow(positionFn: (window: Window, frame: Rectangle) => void) {
  const window = Window.focused();

  if (window === undefined) {
    return;
  }
  const frame = window.screen().flippedVisibleFrame();
  positionFn(window, frame);
}

export function isMax(windowSize: Size, screenSize: Size): boolean {
  return windowSize.width === screenSize.width && windowSize.height === screenSize.height;
}

/**
 * Window geometry handlers
 *
 * Hotkey registration lives in hotkeys/window.ts; this module owns the
 * corresponding window behavior.
 */

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
  const window = Window.focused();
  if (window === undefined) {
    return;
  }
  const screen = window.screen().flippedVisibleFrame();
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
  const screenFrame = window.screen().flippedVisibleFrame();
  const windowFrame = window.frame();
  if (
    isMax(windowFrame, screenFrame) &&
    windowFrame.x === screenFrame.x &&
    windowFrame.y === screenFrame.y
  ) {
    const restoreFrame = getRestoreFrame(window);
    if (restoreFrame) {
      if (
        window.setFrame({
          ...restoreFrame.position,
          ...restoreFrame.size,
        })
      ) {
        clearRestoreFrame(window);
      }
    } else {
      window.setFrame(calcSmallerFrame(screenFrame));
    }
  } else {
    saveRestoreFrame(window);
    if (!window.maximize()) {
      clearRestoreFrame(window);
    }
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
  const screenFrame = window.screen().flippedVisibleFrame();
  window.setFrame(clampFrameToScreen(newFrame, screenFrame));
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
  const frame = window.frame();
  const screenFrame = window.screen().flippedVisibleFrame();
  let y = screenFrame.y;
  let height = screenFrame.height;
  // patch for vivaldi
  if (window.app().name() === 'Vivaldi') {
    y = y + 20;
    height = height - 20;
  }
  window.setFrame({
    x: frame.x,
    y,
    width: frame.width,
    height,
  });
}

// Stretch to full screen width (former - + MASH_CTRL_SHIFT).
export function maximizeWidth() {
  const window = getCurrentWindow();
  if (window === undefined) {
    return;
  }
  const frame = window.frame();
  const screenFrame = window.screen().flippedVisibleFrame();
  window.setFrame({
    x: screenFrame.x,
    y: frame.y,
    width: screenFrame.width,
    height: frame.height,
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
