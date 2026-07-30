import { MASH_CTRL } from '../config';
import { setMousePositionForWindowCenter } from '../lib/mouse';
import { getCurrentWindow } from '../runtime/current-window';

export function registerMouseHotkeys(): void {
  Key.on('space', MASH_CTRL, () => setMousePositionForWindowCenter(getCurrentWindow()));
}
