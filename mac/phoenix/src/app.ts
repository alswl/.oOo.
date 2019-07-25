import { saveMousePositionForWindow, restoreMousePositionForWindow } from './mouse';

import * as _ from "lodash";

/**
 * App Functions
 */
//switch app, and remember mouse position
export function callApp(appName: string) {
    var windowOptional = Window.focused();
    if (windowOptional) {
        saveMousePositionForWindow(windowOptional as Window);
    }
    var appOptional: App | undefined = App.launch(appName);
    if (appOptional === undefined) {
        return;
    }

    let app = appOptional as App;
    Timer.after(0.300, function () {
        app.focus();
        var newWindow = _.first(app.windows());
        if (newWindow && windowOptional !== newWindow) {
            restoreMousePositionForWindow(newWindow);
        }
    });
}
