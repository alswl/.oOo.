import * as _ from 'lodash';
import { restoreMousePositionForWindow } from './mouse';
import { getNextWindowsOnSameScreen, moveToScreen } from './screen';
import { getCurrentWindow } from './window';

export function moveWindowToTargetSpace(window: Window, nextWindow: Window | null, allSpaces: Space[], spaceIndex: number) {
  const targetSpace = allSpaces[spaceIndex];
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

export function moveWindowToSpace(targetSpaceFn: (space: Space) => Space | null) {
  const window = getCurrentWindow();
  if (window.isFullScreen() || window.isMinimized()) { return; }
  const currentOptional: Space | undefined = Space.active();
  if (currentOptional === undefined) {
    return;
  }
  const current = currentOptional;
  const allSpaces: Space[] = Space.all();
  const previousOptinal = targetSpaceFn(current);
  if (previousOptinal === null) {
    return;
  }
  const previous = previousOptinal;
  if (previous.isFullScreen()) { return; }
  if (previous.screens().length === 0) { return; }
  if (previous.screens()[0].hash() !== current.screens()[0].hash()) {
    return;
  }
  if (_.indexOf(_.map(allSpaces, (x) => x.hash()), previous.hash())
    >= _.indexOf(_.map(allSpaces, (x) => x.hash()), current.hash())) {
    return;
  }
  current.removeWindows([window]);
  previous.addWindows([window]);
  const prevWindow = getNextWindowsOnSameScreen(window);
  if (prevWindow) {
    prevWindow.focus();
  }
}
