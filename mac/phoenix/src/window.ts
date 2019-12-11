import * as _ from "lodash";
import * as config from './config';
import { restoreMousePositionForWindow, saveMousePositionForWindow } from "./mouse";
import { displayAllVisiableWindowModal, log } from "./util";

export function sortByMostRecent(windows: Window[]): Window[] {
    // var start = new Date().getTime();
    const windowsRecent = Window.recent();
    const visibleAppMostRecentFirst = _.map(
        windowsRecent, (w) => w.hash(),
    );
    // Phoenix.log('Time s0: ' + (new Date().getTime() - start));
    const visibleAppMostRecentFirstWithWeight = _.zipObject(
        visibleAppMostRecentFirst, _.range(visibleAppMostRecentFirst.length),
    );
    return _.sortBy(windows, (window) => visibleAppMostRecentFirstWithWeight[window.hash()]);
};

export function getResizeFrame(frame: Rectangle, ratio: number): Rectangle {
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
    _.chain(windows).filter((window) => {
        if (!config.ACTIVE_WINDOWS_TIMES[window.app().processIdentifier()]) {
            config.ACTIVE_WINDOWS_TIMES[window.app().processIdentifier()] = now;
            return false;
        } else { return true };
    }).filter((window) => {
        return now - config.ACTIVE_WINDOWS_TIMES[window.app().processIdentifier()] > config.HIDE_INACTIVE_WINDOW_TIME * 60;
        // return now - ACTIVE_WINDOWS_TIMES[window.app().pid]> 5;
    }).map((window) => { window.app().hide() });
}

export function heartbeatWindow(window: Window) {
    config.ACTIVE_WINDOWS_TIMES[window.app().processIdentifier()] = new Date().getTime() / 1000;
    // hide_inactiveWindow(window.otherWindowsOnSameScreen());
}

export function setWindowCentral(window: Window) {
    window.setTopLeft({
        x: (window.screen().flippedFrame().width - window.size().width) / 2 + window.screen().flippedFrame().x,
        y: (window.screen().flippedFrame().height - window.size().height) / 2 + window.screen().flippedFrame().y,
    });
    heartbeatWindow(window);
};

export function autoRangeByRecent() {
    const screen = Screen.main()
    const frame = screen.flippedVisibleFrame();

    const windows: Window[] = sortByMostRecent(screen.windows({ visible: true }));
    _.map(windows, (window, index) => {
        window.setTopLeft({
            x: frame.x + index * 100,
            y: frame.y,
        });
        window.setSize({
            //   width: (window.topLeft().x + window.size().width) > (frame.x + frame.width) ?  frame.x + frame.width - window.topLeft().x: window.size().width,
            width: window.size().width,
            height: frame.height,
        });
    });
}

export function focusWindowInSameScreen(window: Window, windowsFn: (window: Window) => Window[],
                                        selectFn: (window: Window, windows: Window[]) => Window | null) {
    const screen = Screen.main();
    const rectangle = screen.flippedFrame();
    const windows = windowsFn(window);
    saveMousePositionForWindow(window);
    const targetWindow = selectFn(window, windows);
    // const targetWindow = getPreviousWindowsOnSameScreen(window);
    if (!targetWindow) {
        return;
    }
    log(`focusWindowInSameScreen.targetWindow: ${targetWindow.title()}`);
    targetWindow.focus();
    // TODO cannot focus Chrome on same screen, if two Chrome in two Screen.
    restoreMousePositionForWindow(targetWindow);
    displayAllVisiableWindowModal(windows, targetWindow, rectangle);
}

export function marginWindow(postionFn: (window: Window, frame: Rectangle) => any) {
    const frame = Screen.main().flippedVisibleFrame();
    const window = Window.focused();

    if (window === undefined) {
        return;
    }
    postionFn(window, frame);
}
