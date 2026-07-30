require('./register-typescript.cjs');

const test = require('node:test');
const assert = require('node:assert/strict');

test('app launch retries until a cold-started main window exists', () => {
  const mouseMoves = [];
  let mainWindowReads = 0;
  let appFocuses = 0;
  let windowFocuses = 0;
  const targetWindow = {
    hash: () => 42,
    focus: () => {
      windowFocuses += 1;
    },
    frame: () => ({ x: 10, y: 20, width: 400, height: 200 }),
    app: () => ({ processIdentifier: () => 100 }),
  };
  const app = {
    focus: () => {
      appFocuses += 1;
    },
    isTerminated: () => false,
    mainWindow: () => {
      mainWindowReads += 1;
      return mainWindowReads < 3 ? undefined : targetWindow;
    },
  };

  global.Window = { focused: () => undefined };
  global.App = {
    focused: () => ({ mainWindow: () => undefined }),
    launch: () => app,
  };
  global.Mouse = {
    move: (point) => mouseMoves.push(point),
  };
  global.Timer = {
    after: (_delay, callback) => callback(),
  };

  const { callApp } = require('../src/features/app.ts');
  callApp('Cold App');

  assert.equal(appFocuses, 1);
  assert.equal(mainWindowReads, 3);
  assert.equal(windowFocuses, 1);
  assert.deepEqual(mouseMoves, [{ x: 210, y: 120 }]);
});
