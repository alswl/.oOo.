import { MAC_SCREEN_IN_THE_RIGHT, MASH_CTRL } from '../config';
import { focusNextScreen, focusPreviousScreen, moveWindowToScreen } from '../features/screen';
import { getCurrentWindow } from '../runtime/current-window';

export function registerScreenHotkeys(): void {
  Key.on('l', MASH_CTRL, () => {
    MAC_SCREEN_IN_THE_RIGHT ? focusNextScreen() : focusPreviousScreen();
  });

  Key.on('h', MASH_CTRL, () => {
    MAC_SCREEN_IN_THE_RIGHT ? focusPreviousScreen() : focusNextScreen();
  });

  Key.on('o', MASH_CTRL, () => {
    const window = getCurrentWindow();
    if (window === undefined) {
      return;
    }
    moveWindowToScreen(
      window,
      MAC_SCREEN_IN_THE_RIGHT
        ? (currentWindow: Window) => currentWindow.screen().next()
        : (currentWindow: Window) => currentWindow.screen().previous()
    );
  });

  Key.on('i', MASH_CTRL, () => {
    const window = getCurrentWindow();
    if (window === undefined) {
      return;
    }
    moveWindowToScreen(
      window,
      MAC_SCREEN_IN_THE_RIGHT
        ? (currentWindow: Window) => currentWindow.screen().previous()
        : (currentWindow: Window) => currentWindow.screen().next()
    );
  });
}
