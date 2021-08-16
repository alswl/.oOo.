import * as _ from "lodash";
import { restoreMousePositionForWindow, saveMousePositionForWindow } from './mouse';
import { getCurrentWindow } from "./window";

/**
 * App Functions
 */
// switch app, and remember mouse position
export function callApp(appName: string, orAppName?: string) {
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
    if (window !== undefined && app.mainWindow() !== undefined && window.hash() === app.mainWindow().hash()) {
        return;
    }

    Timer.after(0.300, () => {
        (app as App).focus();
        restoreMousePositionForWindow((app as App).mainWindow());
    });
}
