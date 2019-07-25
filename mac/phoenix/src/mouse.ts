import * as _ from "lodash";
import {    heartbeat_window,} from './window';
import * as config from './config';


export function save_mouse_position_for_window(window: Window) {
    if (!window) return;
    heartbeat_window(window);
    var pos = Mouse.location()
    //pos.y = 800 - pos.y; // fix phoenix 2.x bug
    config.mousePositions[window.hash()] = pos;
}

export function set_mouse_position_for_window_center(window: Window) {
    Mouse.move({
        x: window.topLeft().x + window.frame().width / 2,
        y: window.topLeft().y + window.frame().height / 2
    });
    heartbeat_window(window);
}

export function restore_mouse_position_for_window(window: Window) {
    if (!config.mousePositions[window.hash()]) {
        set_mouse_position_for_window_center(window);
        return;
    }
    var pos = config.mousePositions[window.hash()];
    var rect = window.frame();
    if (pos.x < rect.x || pos.x > (rect.x + rect.width) || pos.y < rect.y || pos.y > (rect.y + rect.height)) {
        set_mouse_position_for_window_center(window);
        return;
    }
    //Phoenix.log(String.format('x: {0}, y: {1}', pos.x, pos.y));
    Mouse.move(pos);
    heartbeat_window(window);
}

export function restore_mouse_position_for_now() {
    let window = Window.focused();
    if (window === undefined) {
        return;
    }
    restore_mouse_position_for_window(window as Window);
}