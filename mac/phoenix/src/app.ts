import { save_mouse_position_for_window, restore_mouse_position_for_window } from './mouse';

import * as _ from "lodash";

/**
 * App Functions
 */
//switch app, and remember mouse position
export function callApp(appName: string) {
  var windowOptional = Window.focused();
  if (windowOptional) {
    save_mouse_position_for_window(windowOptional as Window);
  }
  var appOptional: App | undefined = App.launch(appName);
  if (appOptional === undefined) {
    return;
  }
  ;
  let app = appOptional as App;
  Timer.after(0.300, function () {
    app.focus();
    var newWindow = _.first(app.windows());
    if (newWindow && windowOptional !== newWindow) {
      restore_mouse_position_for_window(newWindow);
    }
  });
}
