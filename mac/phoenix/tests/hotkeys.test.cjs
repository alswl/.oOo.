require('./register-typescript.cjs');

const test = require('node:test');
const assert = require('node:assert/strict');

test('registered hotkey combinations are unique', () => {
  const combinations = [];
  global.Key = {
    on: (key, modifiers) => {
      combinations.push(`${[...modifiers].sort().join('+')}::${key}`);
      return combinations.length;
    },
  };

  const { registerHotkeys } = require('../src/hotkeys/index.ts');
  registerHotkeys();

  const duplicates = combinations.filter(
    (combination, index) => combinations.indexOf(combination) !== index
  );
  assert.deepEqual(duplicates, []);
});
