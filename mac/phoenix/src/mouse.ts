import * as config from './config';
import {heartbeatWindow} from './window';

export function saveMousePositionForWindow(window: Window) {
    if (!window) {
        return;
    }
    heartbeatWindow(window);
    const pos = Mouse.location()
    // pos.y = 800 - pos.y; // fix phoenix 2.x bug
    config.MOUSE_POSITIONS[window.hash()] = pos;
}

export function setMousePositionForWindowCenter(window: Window | undefined) {
    if (window === undefined) {
        return;
    }
    Mouse.move({
        x: window.topLeft().x + window.frame().width / 2,
        y: window.topLeft().y + window.frame().height / 2,
    });
    heartbeatWindow(window);
}

export function restoreMousePositionForWindow(window: Window | undefined) {
    if (window === undefined) {
        return;
    }
    if (!config.MOUSE_POSITIONS[window.hash()]) {
        setMousePositionForWindowCenter(window);
        return;
    }
    const pos = config.MOUSE_POSITIONS[window.hash()];
    const rect = window.frame();
    if (pos.x < rect.x || pos.x > (rect.x + rect.width) || pos.y < rect.y || pos.y > (rect.y + rect.height)) {
        setMousePositionForWindowCenter(window);
        return;
    }
    // Phoenix.log(String.format('x: {0}, y: {1}', pos.x, pos.y));
    Mouse.move(pos);
    heartbeatWindow(window);
}

export function restoreMousePositionForNow() {
    const window = Window.focused();
    if (window === undefined) {
        return;
    }
    restoreMousePositionForWindow(window);
}
