import { RESIZE_WITH_RATIO } from '../config';
import { restoreMousePositionForWindow, saveMousePositionForWindow } from '../lib/mouse';
import { log } from '../lib/util';
import { getCurrentWindow } from '../runtime/current-window';

// let SCREEN_LATEST_WINDOW: { [screen: string]: Window } = {};
// let SCREEN_LATEST_WINDOW = new Map<number, Window>();

export function moveToScreen(window: Window, screen: Screen) {
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
  log(`widthRatio ${widthRatio}, heightRatio ${heightRatio}`);
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
}

export function windowsOnOtherScreen(): Window[] {
  const windowOptional = Window.focused();
  if (windowOptional === undefined) {
    return [];
  }

  const window = windowOptional;
  const sameScreenWindowHashes = new Set(
    window.others({ screen: window.screen() }).map((candidate) => candidate.hash())
  );
  return window.others().filter((candidate) => !sameScreenWindowHashes.has(candidate.hash()));
}

function getScreenLatestWindow(screen: Screen): Window | null {
  const start = new Date().getTime();
  const targetScreenHash = screen.hash();
  const targetScreenWindows = Window.recent().filter(
    (window) => window.screen().hash() === targetScreenHash
  );
  log('Time 2: ' + (new Date().getTime() - start));
  if (targetScreenWindows.length === 0) {
    log('focusAnotherScreen, target no window');
    const frame = screen.frame();
    Mouse.move({
      x: frame.x + frame.width / 2,
      y: frame.y + frame.height / 2,
    });
    return null;
  }
  log('Time 2.1: ' + (new Date().getTime() - start));
  const targetWindow = targetScreenWindows[0];
  log('Time 2.2: ' + (new Date().getTime() - start));
  return targetWindow;
}

export function focusAnotherScreen(window: Window, targetScreen: Screen) {
  const start = new Date().getTime();
  // TODO using cache
  // if (SCREEN_LATEST_WINDOW.has(currentScreen.hash())) {
  //   return SCREEN_LATEST_WINDOW.get(currentScreen.hash());
  // }

  log('Time 1: ' + (new Date().getTime() - start));

  saveMousePositionForWindow(window);
  const targetWindow = getScreenLatestWindow(targetScreen);
  if (targetWindow === null) {
    return;
  }

  log('Time 1.1: ' + (new Date().getTime() - start));
  targetWindow.focus(); // bug, two window in two space, focus will focus in same space first
  restoreMousePositionForWindow(targetWindow); // ok
  // App.get('Finder').focus(); // Hack for Screen unfocus
}

export function sortedWindowsOnSameScreen(window: Window | undefined): Window[] {
  if (window === undefined) {
    return [];
  }
  const windows = window.others({ visible: true, screen: window.screen() });
  windows.push(window);
  const screenFrame = window.screen().flippedFrame();
  const sorted = windows
    .map((w) => {
      const frame = w.frame();
      const title = w.title();
      return {
        window: w,
        title,
        x: frame.x - screenFrame.x,
        y: frame.y - screenFrame.y,
        processIdentifier: w.app().processIdentifier(),
      };
    })
    .sort(compareWindowOrder);
  log(`sortedWindowsOnSameScreen: ${sorted.map((info) => '"' + info.title + '"').join(', ')}`);
  return sorted.map((info) => info.window);
}

export interface WindowOrder {
  x: number;
  y: number;
  processIdentifier: number;
  title: string;
}

export function compareWindowOrder(left: WindowOrder, right: WindowOrder): number {
  return (
    left.y - right.y ||
    left.x - right.x ||
    left.processIdentifier - right.processIdentifier ||
    left.title.localeCompare(right.title)
  );
}

// TODO use a state save status
export function otherWindowOnSameScreen(
  windows: Window[],
  window: Window | undefined,
  offset: number,
  isCycle: boolean
): Window | undefined {
  if (window === undefined) {
    return undefined;
  }
  const index: number = isCycle
    ? (windows.indexOf(window) + offset + windows.length) % windows.length
    : windows.indexOf(window) + offset;
  if (index >= windows.length || index < 0) {
    log('otherWindowOnSameScreen, no window');
    return;
  }
  return windows[index];
}

export function getPreviousWindowsOnSameScreen(
  window: Window | undefined,
  windows: Window[]
): Window | undefined {
  return otherWindowOnSameScreen(windows, window, -1, false);
}

export function getNextWindowsOnSameScreen(
  window: Window | undefined,
  windows: Window[]
): Window | undefined {
  if (window === undefined) {
    return;
  }
  return otherWindowOnSameScreen(windows, window, 1, false);
}

export function switchScreen(
  current: Window | undefined,
  targetScreenFn: (screen: Screen) => Screen
) {
  if (current === undefined) {
    return;
  }
  const currentScreen = current.screen();
  if (currentScreen === undefined) {
    log('switchScrren, no current Screen');
    return; // TODO use mouse to find current screen
  }
  const targetScreen = targetScreenFn(currentScreen);
  focusAnotherScreen(current, targetScreen);
}

export function moveWindowToScreen(
  window: Window | undefined,
  targetScreenFn: (window: Window) => Screen
) {
  if (window === undefined) {
    return;
  }
  const targetScreen = targetScreenFn(window);
  if (window.screen().hash() === targetScreen.hash()) {
    log('moveWindowToScreen, smae screen');
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
  switchScreen(getCurrentWindow(), (screen: Screen) => screen.next());
  // const current = getCurrentWindow();
  // const currentScreen = current.screen();
  // currentScreen.next()
}

export function focusPreviousScreen() {
  switchScreen(getCurrentWindow(), (screen: Screen) => screen.previous());
}
