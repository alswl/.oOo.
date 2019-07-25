export {alert, stringify};

function alert(message: string) {
  var modal = new Modal();
  modal.text = message;
  modal.duration = 2;
  modal.show();
}

function stringify(value: any) {
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
