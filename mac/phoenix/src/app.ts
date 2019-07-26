import * as _ from "lodash";
import { restoreMousePositionForWindow } from './mouse';
import { getCurrentWindow } from "./window";

/**
 * App Functions
 */
// switch app, and remember mouse position
export function callApp(appName: string) {
    const window = getCurrentWindow();
    const appOptional: App | undefined = App.launch(appName);
    if (appOptional === undefined) {
        return;
    }

    const app = appOptional;
    Timer.after(0.300, () => {
        app.focus();
        const newWindow = _.first(app.windows());
        if (newWindow && window !== newWindow) {
            restoreMousePositionForWindow(newWindow);
        }
    });
}
