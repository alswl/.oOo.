require('./register-typescript.cjs');

const test = require('node:test');
const assert = require('node:assert/strict');

test('window close events clear saved runtime state', () => {
  const handlers = new Map();
  global.Event = {
    on: (name, callback) => {
      handlers.set(name, callback);
      return handlers.size;
    },
  };

  const state = require('../src/runtime/window-state.ts');
  const window = {
    hash: () => 7,
    size: () => ({ width: 800, height: 600 }),
    topLeft: () => ({ x: 100, y: 200 }),
    app: () => ({ processIdentifier: () => 99 }),
  };

  state.saveMousePosition(window, { x: 150, y: 250 });
  state.saveRestoreFrame(window);
  state.registerWindowStateCleanup();
  handlers.get('windowDidClose')(window);

  assert.equal(state.getSavedMousePosition(window), undefined);
  assert.equal(state.getRestoreFrame(window), undefined);
});
