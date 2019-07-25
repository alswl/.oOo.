export {moveToScreen, windowsOnOtherScreen}

import * as _ from "lodash";

function moveToScreen(window: Window, screen: Screen) {
    if (!window) return;
    if (!screen) return;
  
    var frame = window.frame();
    var oldScreenRect = window.screen().visibleFrameInRectangle();
    var newScreenRect = screen.visibleFrameInRectangle();
    var xRatio = newScreenRect.width / oldScreenRect.width;
    var yRatio = newScreenRect.height / oldScreenRect.height;
  
    var mid_pos_x = frame.x + Math.round(0.5 * frame.width);
    var mid_pos_y = frame.y + Math.round(0.5 * frame.height);
  
    window.setFrame({
      x: (mid_pos_x - oldScreenRect.x) * xRatio + newScreenRect.x - 0.5 * frame.width,
      y: (mid_pos_y - oldScreenRect.y) * yRatio + newScreenRect.y - 0.5 * frame.height,
      width: frame.width,
      height: frame.height
    });
  };
  
  function windowsOnOtherScreen() {
    var otherWindowsOnSameScreen = Window.focused().others({ screen: Window.focused().screen() }); // slow
    var otherWindowTitlesOnSameScreen = _.map(otherWindowsOnSameScreen , function(w) { return w.title(); });
    var return_value = _.chain(Window.focused().others())
      .filter(function(window) { return ! _.includes(otherWindowTitlesOnSameScreen, window.title()); })
      .value();
    return return_value;
  };