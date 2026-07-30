import { MASH_CTRL, MASH_CTRL_SHIFT, MASH_SHIFT, WINDOW_ADJUST } from '../config';
import {
  getNextWindowsOnSameScreen,
  getPreviousWindowsOnSameScreen,
  sortedWindowsOnSameScreen,
} from '../features/screen';
import {
  adjustFrame,
  centralizeWindow,
  enlargeWindow,
  focusWindowInSameScreen,
  growWidthLeft,
  growWidthRight,
  marginBottom,
  marginLeft,
  marginRight,
  marginTop,
  maximizeHeight,
  maximizeWidth,
  shrinkWindow,
  snapHalf,
  toggleMaximize,
} from '../features/window';
import { getCurrentWindow } from '../runtime/current-window';

export function registerWindowHotkeys(): void {
  Key.on('m', MASH_CTRL_SHIFT, toggleMaximize);
  Key.on('-', MASH_CTRL, shrinkWindow);
  Key.on('=', MASH_CTRL, enlargeWindow);
  Key.on('m', MASH_CTRL, centralizeWindow);
  Key.on('\\', MASH_CTRL_SHIFT, maximizeHeight);
  Key.on('-', MASH_CTRL_SHIFT, maximizeWidth);
  Key.on(',', MASH_CTRL_SHIFT, growWidthLeft);
  Key.on('.', MASH_CTRL_SHIFT, growWidthRight);

  WINDOW_ADJUST.forEach((binding) => {
    Key.on(binding.key, binding.mod, () =>
      adjustFrame(binding.dx, binding.dy, binding.dw, binding.dh)
    );
  });

  Key.on('k', MASH_CTRL_SHIFT, () => snapHalf('top'));
  Key.on('j', MASH_CTRL_SHIFT, () => snapHalf('bottom'));
  Key.on('h', MASH_CTRL_SHIFT, () => snapHalf('left'));
  Key.on('l', MASH_CTRL_SHIFT, () => snapHalf('right'));

  // Keep these registrations after the screen hotkeys to preserve Phoenix's
  // existing duplicate h/l binding order.
  Key.on('h', MASH_CTRL, marginLeft);
  Key.on('l', MASH_CTRL, marginRight);
  Key.on('k', MASH_CTRL, marginTop);
  Key.on('j', MASH_CTRL, marginBottom);

  Key.on('k', MASH_SHIFT, () =>
    focusWindowInSameScreen(
      getCurrentWindow(),
      sortedWindowsOnSameScreen,
      getPreviousWindowsOnSameScreen
    )
  );
  Key.on('j', MASH_SHIFT, () =>
    focusWindowInSameScreen(
      getCurrentWindow(),
      sortedWindowsOnSameScreen,
      getNextWindowsOnSameScreen
    )
  );
}
