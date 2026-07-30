import * as config from '../config';
import { restoreMousePositionForWindow } from '../lib/mouse';
import { getNextWindowsOnSameScreen, moveToScreen, sortedWindowsOnSameScreen } from './screen';
import { displayAllVisiableWindowModal, log } from '../lib/util';
import { getCurrentWindow } from '../runtime/current-window';

function getSpaceByIndex(spaces: Space[], index: number | undefined): Space | undefined {
  if (index === undefined || index < 0 || index >= spaces.length) {
    return undefined;
  }
  return spaces[index];
}

function getDisplayLayoutValue(
  values: { [screenCount: number]: number },
  screenCount: number
): number | undefined {
  return values[screenCount] ?? values[2] ?? values[1];
}

// TODO refact
export function moveWindowToTargetSpace(
  window: Window | undefined,
  nextWindow: Window | undefined,
  targetSpace: Space
) {
  if (window === undefined) {
    return;
  }
  const targetScreen = targetSpace.screens()[0];
  if (targetScreen === undefined) {
    return;
  }
  if (window.screen().hash() !== targetScreen.hash()) {
    moveToScreen(window, targetScreen);
  }
  targetSpace.moveWindows([window]);
  if (nextWindow) {
    nextWindow.focus();
    restoreMousePositionForWindow(nextWindow);
  }
}

export function moveWindowToSpace(
  window: Window | undefined,
  targetSpaceFn: (space: Space) => Space | null,
  direction: number
) {
  if (window === undefined) {
    return;
  }
  if (window.isFullScreen() || window.isMinimized()) {
    return;
  }
  const currentOptional: Space | undefined = Space.active();
  if (currentOptional === undefined) {
    log('moveWindowToSpace no currentSpace');
    return;
  }
  log('a');
  const current = currentOptional;
  const allSpaces: Space[] = Space.all();
  const targetSpaceOptinal = targetSpaceFn(current);
  if (targetSpaceOptinal === null) {
    log('moveWindowToSpace no targetSpaceOptinal');
    return;
  }
  const target = targetSpaceOptinal;
  if (target.isFullScreen()) {
    return;
  }
  if (target.screens().length === 0) {
    return;
  }
  if (target.screens()[0].hash() !== current.screens()[0].hash()) {
    log('moveWindowToSpace, target equlas current');
    return;
  }
  const spaceHashes = allSpaces.map((space) => space.hash());
  const targetIndex = spaceHashes.indexOf(target.hash());
  const currentIndex = spaceHashes.indexOf(current.hash());
  if (
    (direction > 0 && targetIndex <= currentIndex) ||
    (direction < 0 && targetIndex >= currentIndex)
  ) {
    log('moveWindowToSpace, space execeed');
    return;
  }
  const nextWindow = getNextWindowsOnSameScreen(window, sortedWindowsOnSameScreen(window));
  target.moveWindows([window]);
  if (nextWindow !== undefined) {
    nextWindow.focus();
    restoreMousePositionForWindow(nextWindow);
  }
  displayAllVisiableWindowModal(current.windows(), nextWindow ?? null, null);
}

/**
 * Space-move handlers (former inline Key.on bodies in phoenix.ts).
 * Behavior preserved 1:1, including the currently disabled move in the park handler.
 */

// Move focused window to the park space (former delete + MASH_CTRL).
export function moveWindowToParkSpace() {
  const isFollow = false;
  const window = getCurrentWindow();
  if (window === undefined) {
    return;
  }
  const nextWindowOptional = isFollow
    ? window
    : getNextWindowsOnSameScreen(window, sortedWindowsOnSameScreen(window));
  const allSpaces = Space.all();
  const screenCount = Screen.all().length;
  const parkSpaceIndex =
    config.PARK_SPACE_APP_INDEX_MAP[window.app().name()] ??
    getDisplayLayoutValue(config.PARK_SPACE_INDEX_MAP, screenCount);
  const parkSpace = getSpaceByIndex(allSpaces, parkSpaceIndex);
  if (parkSpace === undefined) {
    return;
  }
  log(`${window}, ${nextWindowOptional}, ${parkSpace}`);

  moveWindowToTargetSpace(window, nextWindowOptional, parkSpace);
}

// Move focused window to the work space (former return + MASH_CTRL).
export function moveWindowToWorkSpace() {
  const isFollow = true;
  const window = getCurrentWindow();
  const nextWindowOptional = isFollow
    ? window
    : getNextWindowsOnSameScreen(window, sortedWindowsOnSameScreen(window));
  const allSpaces = Space.all();
  const screenCount = Screen.all().length;
  const workSpace = getSpaceByIndex(
    allSpaces,
    getDisplayLayoutValue(config.WORK_SPACE_INDEX_MAP, screenCount)
  );
  if (workSpace === undefined) {
    return;
  }
  moveWindowToTargetSpace(window, nextWindowOptional, workSpace);
}

// Move all windows of the focused app to the second work space (former return + MASH_CTRL_SHIFT).
export function moveWindowToSecondWorkSpace() {
  const isFollow = true;
  const window = getCurrentWindow();
  if (window === undefined) {
    return;
  }
  const nextWindow = isFollow
    ? window
    : getNextWindowsOnSameScreen(window, sortedWindowsOnSameScreen(window));
  const allSpaces = Space.all();
  const screenCount = Screen.all().length;
  const secondWorkSpace = getSpaceByIndex(
    allSpaces,
    getDisplayLayoutValue(config.SECOND_WORK_SPACE_INDEX_MAP, screenCount)
  );
  if (secondWorkSpace === undefined) {
    return;
  }
  window
    .app()
    .windows()
    .forEach((x) => {
      moveWindowToTargetSpace(x, nextWindow, secondWorkSpace);
    });
}

// Move other apps' windows in this space to their park spaces (former delete + MASH_CTRL_SHIFT).
export function parkOtherWindowsInSpace() {
  const window = getCurrentWindow();
  if (window === undefined) {
    return;
  }
  const nextWindow = window;
  const allSpaces = Space.all();
  const currentSpace = window.spaces()[0];
  if (currentSpace === undefined) {
    return;
  }
  const otherWindowsInSameSpace = currentSpace
    .windows()
    .filter((candidate) => candidate.hash() !== window.hash());
  const screenCount = Screen.all().length;
  otherWindowsInSameSpace.forEach((parkedWindow) => {
    if (window.app().hash() === parkedWindow.app().hash()) {
      return;
    }
    const parkSpaceIndex =
      config.PARK_SPACE_APP_INDEX_MAP[parkedWindow.app().name()] ??
      getDisplayLayoutValue(config.PARK_SPACE_INDEX_MAP, screenCount);
    const parkSpace = getSpaceByIndex(allSpaces, parkSpaceIndex);
    if (parkSpace === undefined) {
      return;
    }
    moveWindowToTargetSpace(parkedWindow, nextWindow, parkSpace);
  });
}
