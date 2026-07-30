import { MASH_CTRL, MASH_CTRL_SHIFT } from '../config';
import {
  moveWindowToParkSpace,
  moveWindowToSecondWorkSpace,
  moveWindowToSpace,
  moveWindowToWorkSpace,
  parkOtherWindowsInSpace,
} from '../features/space';
import { getCurrentWindow } from '../runtime/current-window';

export function registerSpaceHotkeys(): void {
  Key.on('i', MASH_CTRL_SHIFT, () =>
    moveWindowToSpace(getCurrentWindow(), (space: Space) => space.previous(), -1)
  );
  Key.on('o', MASH_CTRL_SHIFT, () =>
    moveWindowToSpace(getCurrentWindow(), (space: Space) => space.next(), 1)
  );
  Key.on('delete', MASH_CTRL, moveWindowToParkSpace);
  Key.on('return', MASH_CTRL, moveWindowToWorkSpace);
  Key.on('return', MASH_CTRL_SHIFT, moveWindowToSecondWorkSpace);
  Key.on('delete', MASH_CTRL_SHIFT, parkOtherWindowsInSpace);
}
