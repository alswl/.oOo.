import * as _ from "lodash";
import { restoreMousePositionForWindow, saveMousePositionForWindow } from './mouse';
import { getCurrentWindow } from "./window";

/**
 * App Functions
 */
// switch app, and remember mouse position
export function callApp(appName: string) {
    const window = getCurrentWindow();
    saveMousePositionForWindow(window);
    const app: App | undefined = App.launch(appName);
    if (app === undefined) {
        return;
    }
    if (window.hash() === app.mainWindow().hash()) { return; }

    Timer.after(0.300, () => {
        app.focus();
        restoreMousePositionForWindow(app.mainWindow());
    });
}
