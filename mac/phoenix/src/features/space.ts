import * as _ from 'lodash';
import * as config from '../config';
import { restoreMousePositionForWindow } from '../lib/mouse';
import { getNextWindowsOnSameScreen, moveToScreen, sortedWindowsOnSameScreen } from './screen';
import { displayAllVisiableWindowModal, log } from '../lib/util';
import { getCurrentWindow } from './window';

// NOTE: mirrors the original phoenix.ts aliasing — config exports no PARK_SPACE_INDEX_MAP,
// so the previous code aliased it to PARK_SPACE_APP_INDEX_MAP. Preserved as-is (latent bug).
const PARK_SPACE_INDEX_MAP = config.PARK_SPACE_APP_INDEX_MAP;
const PARK_SPACE_APP_INDEX_MAP = config.PARK_SPACE_APP_INDEX_MAP;

// TODO refact
export function moveWindowToTargetSpace(
  window: Window | undefined,
  nextWindow: Window | undefined,
  targetSpace: Space
) {
  if (window === undefined) {
    return;
  }
  if (nextWindow === undefined) {
    return;
  }
  const currentSpaceOptional = Space.active();
  if (currentSpaceOptional === undefined) {
    return;
  }
  const currentSpace = currentSpaceOptional;
  // _.map(targetSpace.windows(), (w) => { alert(w.title()); } );
  if (currentSpace.screens()[0].hash() !== targetSpace.screens()[0].hash()) {
    moveToScreen(window, targetSpace.screens()[0]);
  }
  currentSpace.removeWindows([window]);
  targetSpace.addWindows([window]);
  if (nextWindow) {
    // App.get('Finder').focus(); // Hack for Screen unfocus
    // nextWindow.raise();
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
  const targetIndex = _.indexOf(
    _.map(allSpaces, (x) => x.hash()),
    target.hash()
  );
  const currentIndex = _.indexOf(
    _.map(allSpaces, (x) => x.hash()),
    current.hash()
  );
  if (
    (direction > 0 && targetIndex <= currentIndex) ||
    (direction < 0 && targetIndex >= currentIndex)
  ) {
    log('moveWindowToSpace, space execeed');
    return;
  }
  current.removeWindows([window]);
  target.addWindows([window]);
  const prevWindowOptional = getNextWindowsOnSameScreen(window, sortedWindowsOnSameScreen(window));
  if (prevWindowOptional === undefined) {
    return;
  }

  if (prevWindowOptional != null) {
    prevWindowOptional.focus();
  }
  displayAllVisiableWindowModal(current.windows(), prevWindowOptional, null);
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
    PARK_SPACE_APP_INDEX_MAP[window.app().name()] || PARK_SPACE_INDEX_MAP[screenCount];
  if (parkSpaceIndex >= allSpaces.length) {
    return;
  }
  log(`${window}, ${nextWindowOptional}, ${allSpaces[parkSpaceIndex]}`);

  // moveWindowToTargetSpace(window, nextWindowOptional, allSpaces[parkSpaceIndex]);
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
  if (config.WORK_SPACE_INDEX_MAP[screenCount] >= allSpaces.length) {
    return;
  }
  moveWindowToTargetSpace(
    window,
    nextWindowOptional,
    allSpaces[config.WORK_SPACE_INDEX_MAP[screenCount]]
  );
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
  if (config.SECOND_WORK_SPACE_INDEX_MAP[screenCount] >= allSpaces.length) {
    return;
  }
  _.each(window.app().windows(), (x: Window) => {
    moveWindowToTargetSpace(
      x,
      nextWindow,
      allSpaces[config.SECOND_WORK_SPACE_INDEX_MAP[screenCount]]
    );
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
  const otherWindowsInSameSpace = _.filter(
    window.spaces()[0].windows(),
    (x) => x.hash() !== window.hash()
  );
  const screenCount = Screen.all().length;
  _.each(otherWindowsInSameSpace, (parkedWindow) => {
    if (window.app().hash() === parkedWindow.app().hash()) {
      return;
    }
    const parkSpaceIndex =
      PARK_SPACE_APP_INDEX_MAP[parkedWindow.app().name()] || PARK_SPACE_INDEX_MAP[screenCount];
    if (parkSpaceIndex >= allSpaces.length) {
      return;
    }
    moveWindowToTargetSpace(parkedWindow, nextWindow, allSpaces[parkSpaceIndex]);
  });
}
