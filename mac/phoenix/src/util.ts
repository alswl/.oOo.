import * as _ from "lodash";

declare var console: any;

export function log(...args: any[]): void {
    args = args.map(arg => stringify(arg));
    Phoenix.log(...args);
    // tslint:disable-next-line:no-console
    console.trace(...args);
}

export function alert(message: string) {
    const modal = new Modal();
    modal.text = message;
    modal.duration = 2;
    modal.show();
}

export function alert_title(window: Window) {
    alert(window.title());
};

export function stringify(value: any) {
    if (value instanceof Error) {
        let stack = '';
        if (value.stack) {
            const s = value.stack.trim().split('\n');
            s[0] += ` (:${value.line}:${value.column})`;
            const indented = s.map(line => '\t at ' + line).join('\n');
            stack = `\n${indented}`;
        }
        return `\n${value.toString()}${stack}`;
    }
    switch (typeof value) {
        case 'object':
            return '\n' + JSON.stringify(value, null, 2);
        case 'function':
            return value.toString();
        default:
            return value;
    }
}

export function assert(condition: boolean, message: string) {
    if (!condition) {
        throw message || 'Assertion failed';
    }
}

export function displayAllVisiableWindowModal(windows: Window[], windowOptional: Window | null, rectangleOptional: Rectangle | null) {
    const screenFrame = rectangleOptional || Screen.main().flippedFrame();
    Modal.build({
        appearance: 'dark',
        text: _.chain(windows)
            .map(x => windowOptional !== null && windowOptional.hash() === x.hash() ? '[[' + x.app().name() + ']]' : '  ' + x.app().name() + '  ')
            .join('    ')
            .value(),
        duration: 1,
        // animationDuration: 0,
        weight: 18,
        origin(frame) {
            return {
                x: screenFrame.x + (screenFrame.width / 2) - (frame.width / 2),
                y: ((-screenFrame.y) + (screenFrame.height / 2) + (frame.height / 2)),
                // y: screenFrame.y + screenFrame.height - (frame.height / 2),
            }
        },
    }).show();
};

export function showTitleModal(text: string, duration: number = 1, icon?: Phoenix.Icon) {
    const modal = new Modal();
    modal.text = text;
    modal.duration = duration;
    if (icon) {
        modal.icon = icon;
    }
    showAt(modal, Screen.main(), 2, 1 + 1 / 3);
}

function showAt(
    modal: Modal,
    screen: Screen,
    widthDiv: number,
    heightDiv: number,
) {
    const {height, width, x, y} = modal.frame();
    const sf = screen.visibleFrame();
    modal.origin = {
        x: sf.x + (sf.width / widthDiv - width / 2),
        y: sf.y + (sf.height / heightDiv - height / 2),
    };
    modal.show();
}
