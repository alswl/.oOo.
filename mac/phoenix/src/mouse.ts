import * as _ from "lodash";
import { heartbeatWindow, } from './window';
import * as config from './config';


export function saveMousePositionForWindow(window: Window) {
    if (!window) return;
    heartbeatWindow(window);
    var pos = Mouse.location()
    //pos.y = 800 - pos.y; // fix phoenix 2.x bug
    config.MOUSE_POSITIONS[window.hash()] = pos;
}

export function setMousePositionForWindowCenter(window: Window) {
    Mouse.move({
        x: window.topLeft().x + window.frame().width / 2,
        y: window.topLeft().y + window.frame().height / 2
    });
    heartbeatWindow(window);
}

export function restoreMousePositionForWindow(window: Window) {
    if (!config.MOUSE_POSITIONS[window.hash()]) {
        setMousePositionForWindowCenter(window);
        return;
    }
    var pos = config.MOUSE_POSITIONS[window.hash()];
    var rect = window.frame();
    if (pos.x < rect.x || pos.x > (rect.x + rect.width) || pos.y < rect.y || pos.y > (rect.y + rect.height)) {
        setMousePositionForWindowCenter(window);
        return;
    }
    //Phoenix.log(String.format('x: {0}, y: {1}', pos.x, pos.y));
    Mouse.move(pos);
    heartbeatWindow(window);
}

export function restoreMousePositionForNow() {
    let window = Window.focused();
    if (window === undefined) {
        return;
    }
    restoreMousePositionForWindow(window as Window);
}