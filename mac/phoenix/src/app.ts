import * as _ from "lodash";
import { restoreMousePositionForWindow, saveMousePositionForWindow } from './mouse';

/**
 * App Functions
 */
// switch app, and remember mouse position
export function callApp(appName: string) {
    const windowOptional = Window.focused();
    if (windowOptional) {
        saveMousePositionForWindow(windowOptional);
    }
    const appOptional: App | undefined = App.launch(appName);
    if (appOptional === undefined) {
        return;
    }

    const app = appOptional;
    Timer.after(0.300, function() {
        app.focus();
        const newWindow = _.first(app.windows());
        if (newWindow && windowOptional !== newWindow) {
            restoreMousePositionForWindow(newWindow);
        }
    });
}
