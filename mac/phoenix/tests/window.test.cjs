require('./register-typescript.cjs');

const test = require('node:test');
const assert = require('node:assert/strict');
const {
  calcLargerFrame,
  calcSmallerFrameSticky,
  clampFrameToScreen,
  toggleMaximize,
} = require('../src/features/window.ts');
const { compareWindowOrder } = require('../src/features/screen.ts');

test('window ordering is row-major and deterministic', () => {
  const windows = [
    { x: 100, y: 0, processIdentifier: 2, title: 'B' },
    { x: 0, y: 100, processIdentifier: 1, title: 'C' },
    { x: 0, y: 0, processIdentifier: 3, title: 'A' },
    { x: 0, y: 0, processIdentifier: 2, title: 'Z' },
  ];

  assert.deepEqual(windows.sort(compareWindowOrder), [
    { x: 0, y: 0, processIdentifier: 2, title: 'Z' },
    { x: 0, y: 0, processIdentifier: 3, title: 'A' },
    { x: 100, y: 0, processIdentifier: 2, title: 'B' },
    { x: 0, y: 100, processIdentifier: 1, title: 'C' },
  ]);
});

test('enlarged frames are clamped on all four screen edges', () => {
  const screen = { x: -1000, y: 20, width: 1000, height: 800 };
  const enlarged = calcLargerFrame({ x: -950, y: -100, width: 1200, height: 1000 });

  assert.deepEqual(clampFrameToScreen(enlarged, screen), screen);
});

test('shrinking a maximized window keeps it centered', () => {
  const screen = { x: 100, y: 40, width: 1200, height: 800 };

  assert.deepEqual(calcSmallerFrameSticky(screen, screen), {
    x: 250,
    y: 140,
    width: 900,
    height: 600,
  });
});

test('shrinking a window attached to an edge preserves that edge', () => {
  const screen = { x: 0, y: 0, width: 1200, height: 800 };
  const frame = { x: 0, y: 100, width: 800, height: 600 };

  assert.deepEqual(calcSmallerFrameSticky(frame, screen), {
    x: 0,
    y: 175,
    width: 600,
    height: 450,
  });
});

test('an externally maximized window falls back to a smaller visible frame', () => {
  const screenFrame = { x: 100, y: 40, width: 1200, height: 800 };
  let appliedFrame;
  const window = {
    hash: () => 91,
    frame: () => screenFrame,
    screen: () => ({ flippedVisibleFrame: () => screenFrame }),
    setFrame: (frame) => {
      appliedFrame = frame;
    },
  };
  global.Window = { focused: () => window };

  toggleMaximize();

  assert.deepEqual(appliedFrame, {
    x: 250,
    y: 140,
    width: 900,
    height: 600,
  });
});
