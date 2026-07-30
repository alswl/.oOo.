import { restoreMousePositionForWindow, saveMousePositionForWindow } from '../lib/mouse';
import { getCurrentWindow } from '../runtime/current-window';

/**
 * App Functions
 */
// switch app, and remember mouse position
export function callApp(appName: string, orAppName?: string): void {
  const previousWindow = getCurrentWindow();
  if (previousWindow !== undefined) {
    saveMousePositionForWindow(previousWindow);
  }
  let app = App.launch(appName);
  if (app === undefined && orAppName) {
    app = App.launch(orAppName);
  }
  if (app === undefined) {
    return;
  }

  app.focus();
  focusAppWindowWhenReady(app, previousWindow?.hash(), 10);
}

function focusAppWindowWhenReady(
  app: App,
  previousWindowHash: number | undefined,
  attemptsLeft: number
): void {
  const mainWindow = app.mainWindow();
  if (mainWindow !== undefined) {
    if (mainWindow.hash() !== previousWindowHash) {
      mainWindow.focus();
      restoreMousePositionForWindow(mainWindow);
    }
    return;
  }
  if (attemptsLeft === 0 || app.isTerminated()) {
    return;
  }
  Timer.after(0.1, () => focusAppWindowWhenReady(app, previousWindowHash, attemptsLeft - 1));
}
