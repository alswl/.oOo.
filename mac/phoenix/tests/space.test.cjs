require('./register-typescript.cjs');

const test = require('node:test');
const assert = require('node:assert/strict');

test('parking-space movement still runs when there is no next window to focus', () => {
  const movedWindows = [];
  const screen = { hash: () => 1 };
  const window = { screen: () => screen };
  const targetSpace = {
    screens: () => [screen],
    moveWindows: (windows) => movedWindows.push(...windows),
  };

  const { moveWindowToTargetSpace } = require('../src/features/space.ts');
  moveWindowToTargetSpace(window, undefined, targetSpace);

  assert.deepEqual(movedWindows, [window]);
});
