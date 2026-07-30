import { restoreMousePositionForWindow, saveMousePositionForWindow } from '../lib/mouse';
import { getCurrentWindow } from '../runtime/current-window';

/**
 * App Functions
 */
// switch app, and remember mouse position
export function callApp(appName: string, orAppName?: string): void {
  const window = getCurrentWindow();
  if (window !== undefined) {
    saveMousePositionForWindow(window);
  }
  let app: App | undefined = App.launch(appName);
  // backup app
  if (app === undefined && orAppName) {
    app = App.launch(orAppName);
  }
  if (app === undefined) {
    return;
  }
  const mainWindow = app.mainWindow();
  if (mainWindow === undefined) {
    return;
  }
  if (window !== undefined && window.hash() === mainWindow.hash()) {
    return;
  }

  Timer.after(0.3, () => {
    (app as App).focus();
    restoreMousePositionForWindow((app as App).mainWindow());
  });
}
