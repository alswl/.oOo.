import { moveToScreen } from './screen';
import { restoreMousePositionForWindow } from './mouse';

export function moveWindowToTargetSpace(window: Window, nextWindow: Window | null, allSpaces: Space[], spaceIndex: number) {
  var targetSpace = allSpaces[spaceIndex];
  var currentSpaceOptional = Space.active();
  if (currentSpaceOptional === undefined)
    return;
  let currentSpace = currentSpaceOptional as Space;
  //_.map(targetSpace.windows(), function(w) { alert(w.title()); } );
  if (currentSpace.screens()[0].hash() != targetSpace.screens()[0].hash()) {
    moveToScreen(window, targetSpace.screens()[0]);
  }
  currentSpace.removeWindows([window]);
  targetSpace.addWindows([window]);
  if (nextWindow) {
    //App.get('Finder').focus(); // Hack for Screen unfocus
    //nextWindow.raise();
    nextWindow.focus();
    restoreMousePositionForWindow(nextWindow);
  }
}
