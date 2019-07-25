export { sortByMostRecent, getResizeFrame, getSmallerFrame, getLargerFrame, getCurrentWindow }

import * as _ from "lodash";

function sortByMostRecent(windows: Window): Window[] {
    //var start = new Date().getTime();
    var visibleAppMostRecentFirst = _.map(
        Window.recent(), function (w) { return w.hash(); }
    );
    //Phoenix.log('Time s0: ' + (new Date().getTime() - start));
    var visibleAppMostRecentFirstWithWeight = _.zipObject(
        visibleAppMostRecentFirst, _.range(visibleAppMostRecentFirst.length)
    );
    return _.sortBy(windows, function (window) { return visibleAppMostRecentFirstWithWeight[window.hash()]; });
};


function getResizeFrame(frame: Rectangle, ratio: number): {} {
    var mid_pos_x = frame.x + 0.5 * frame.width;
    var mid_pos_y = frame.y + 0.5 * frame.height;
    return {
        x: Math.round(frame.x + frame.width / 2 * (1 - ratio)),
        y: Math.round(frame.y + frame.height / 2 * (1 - ratio)),
        width: Math.round(frame.width * ratio),
        height: Math.round(frame.height * ratio)
    }
}

function getSmallerFrame(frame: Rectangle): {} {
    return getResizeFrame(frame, 0.9);
}

function getLargerFrame(frame: Rectangle): {} {
    return getResizeFrame(frame, 1.1);
}

function getCurrentWindow(): Window | undefined {
    var window = Window.focused();
    if (window === undefined) {
        window = App.focused().mainWindow();
    }
    if (window === undefined) {
        return;
    }
    return window;
}

