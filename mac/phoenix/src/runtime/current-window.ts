/**
 * Resolve the window commands should act on.
 *
 * Phoenix occasionally has no focused window while an app still has a main
 * window, so keep that fallback in one place for all features.
 */
export function getCurrentWindow(): Window | undefined {
  const focusedWindow = Window.focused();
  if (focusedWindow !== undefined) {
    return focusedWindow;
  }
  return App.focused().mainWindow();
}
