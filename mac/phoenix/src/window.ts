import * as _ from "lodash";
import * as config from './config';

const mash = config.mash
const mashShift = config.mashShift
const mashCtrl = config.mashCtrl
const mousePositions = config.MOUSE_POSITIONS
const HIDE_INACTIVE_WINDOW_TIME = config.HIDE_INACTIVE_WINDOW_TIME
const ACTIVE_WINDOWS_TIMES = config.ACTIVE_WINDOWS_TIMES
const WORK_SPACE_INDEX_MAP: { [name: number]: number } = config.WORK_SPACE_INDEX_MAP
const SECOND_WORK_SPACE_INDEX_MAP: { [name: number]: number } = config.SECOND_WORK_SPACE_INDEX_MAP
const PARK_SPACE_INDEX_MAP: { [name: number]: number } = config.PARK_SPACE_APP_INDEX_MAP
const PARK_SPACE_APP_INDEX_MAP: { [name: string]: number } = config.PARK_SPACE_APP_INDEX_MAP
const A_BIG_PIXEL = config.A_BIG_PIXEL

export function sortByMostRecent(windows: Window[]): Window[] {
    // var start = new Date().getTime();
    const visibleAppMostRecentFirst = _.map(
        Window.recent(), function (w) { return w.hash(); },
    );
    // Phoenix.log('Time s0: ' + (new Date().getTime() - start));
    const visibleAppMostRecentFirstWithWeight = _.zipObject(
        visibleAppMostRecentFirst, _.range(visibleAppMostRecentFirst.length),
    );
    return _.sortBy(windows, function (window) { return visibleAppMostRecentFirstWithWeight[window.hash()]; });
};

export function getResizeFrame(frame: Rectangle, ratio: number): Rectangle {
    const mid_pos_x = frame.x + 0.5 * frame.width;
    const mid_pos_y = frame.y + 0.5 * frame.height;
    return {
        x: Math.round(frame.x + frame.width / 2 * (1 - ratio)),
        y: Math.round(frame.y + frame.height / 2 * (1 - ratio)),
        width: Math.round(frame.width * ratio),
        height: Math.round(frame.height * ratio),
    }
}

export function getSmallerFrame(frame: Rectangle): Rectangle {
    return getResizeFrame(frame, 0.9);
}

export function getLargerFrame(frame: Rectangle): Rectangle {
    return getResizeFrame(frame, 1.1);
}

export function getCurrentWindow(): Window {
    const windowOptional = Window.focused();
    if (windowOptional !== undefined) {
        return windowOptional;
    }
    return App.focused().mainWindow();
}

export function hideInactiveWindow(windows: Window[]) {
    const now = new Date().getTime() / 1000;
    _.chain(windows).filter(function (window) {
        if (!ACTIVE_WINDOWS_TIMES[window.app().processIdentifier()]) {
            ACTIVE_WINDOWS_TIMES[window.app().processIdentifier()] = now;
            return false;
        } return true;
    }).filter(function (window) {
        return now - ACTIVE_WINDOWS_TIMES[window.app().processIdentifier()] > HIDE_INACTIVE_WINDOW_TIME * 60;
        // return now - ACTIVE_WINDOWS_TIMES[window.app().pid]> 5;
    }).map(function (window) { window.app().hide() });
}

export function heartbeatWindow(window: Window) {
    ACTIVE_WINDOWS_TIMES[window.app().processIdentifier()] = new Date().getTime() / 1000;
    // hide_inactiveWindow(window.otherWindowsOnSameScreen());
}

// TODO use a state save status
export function getAnotherWindowsOnSameScreen(window: Window, offset: number, isCycle: boolean): Window | null {
    let windows = window.others({ visible: true, screen: window.screen() });
    windows.push(window);
    const screen = window.screen();
    windows = _.chain(windows).sortBy(function (window) {
        return [(A_BIG_PIXEL + window.frame().y - screen.flippedFrame().y) +
            (A_BIG_PIXEL + window.frame().x - screen.flippedFrame().y),
        window.app().processIdentifier(), window.title()].join('');
    }).value();
    const index: number = isCycle ?
        (_.indexOf(windows, window) + offset + windows.length) % windows.length
        :
        _.indexOf(windows, window) + offset;
    // alert(windows.length);
    // alert(_.map(windows, function(x) {return x.title();}).join(','));
    // alert(_.map(windows, function(x) {return x.app().name();}).join(','));
    if (index >= windows.length || index < 0) {
        return null;
    }
    return windows[index];
}

export function getPreviousWindowsOnSameScreen(window: Window): Window | null {
    return getAnotherWindowsOnSameScreen(window, -1, false)
};

export function getNextWindowsOnSameScreen(window: Window): Window | null {
    return getAnotherWindowsOnSameScreen(window, 1, false)
};

export function setWindowCentral(window: Window) {
    window.setTopLeft({
        x: (window.screen().flippedFrame().width - window.size().width) / 2 + window.screen().flippedFrame().x,
        y: (window.screen().flippedFrame().height - window.size().height) / 2 + window.screen().flippedFrame().y,
    });
    heartbeatWindow(window);
};
