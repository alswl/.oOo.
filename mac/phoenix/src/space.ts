import * as _ from 'lodash';
import { restoreMousePositionForWindow } from './mouse';
import { getNextWindowsOnSameScreen, moveToScreen, sortedWindowsOnSameScreen } from './screen';
import { displayAllVisiableWindowModal, log } from './util';

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
