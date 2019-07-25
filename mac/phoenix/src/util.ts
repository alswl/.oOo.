import * as _ from "lodash";

export function alert(message: string) {
  var modal = new Modal();
  modal.text = message;
  modal.duration = 2;
  modal.show();
}

export function alert_title(window: Window) { alert(window.title()); };

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


export function display_all_visiable_window_modal(windows: Window[], window: Window, rectangle: Rectangle) {
  const modal = Modal.build({
    appearance: 'dark',
    text: _.chain(windows)
      .map(x => window.hash() === x.hash() ? '[[' + x.app().name() + ']]' : ' ' + x.app().name() + ' ')
      .join('     ')
      .value(),
    duration: 1,
    // animationDuration: 0,
    weight: 18,
    origin: function (frame) {
      return {
        x: rectangle.x + (rectangle.width / 2) - (frame.width / 2),
        //y: rectangle.y + (rectangle.height / 2) - (frame.height / 2)
        y: rectangle.y + rectangle.height - (frame.height / 2)
      }
    }
  }).show();
};