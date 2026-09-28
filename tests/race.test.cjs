const test = require('node:test');
const assert = require('node:assert/strict');
const {presets, defaults, estimate} = require('../race.js');

test('every preset: writing JSON is slowest, reading out skips decode, Jev is fastest by default', () => {
  for (const key of Object.keys(presets)) {
    const r = estimate(key);
    assert.ok(r.writeMs > r.readoutMs, key);
    assert.ok(r.readoutMs > r.jevMs, key);
  }
});
test('read-out time does not depend on decode speed or reasoning tokens', () => {
  const a = estimate('criteria', defaults), b = estimate('criteria', {...defaults, decodeTps: 10, reasoningTokens: 4000});
  assert.equal(a.readoutMs, b.readoutMs);
  assert.ok(b.writeMs > a.writeMs);
});
test('Jev latency follows the published slope: about 87 ms for 1 question, about 610 ms for 1,500', () => {
  const one = defaults.jevBaseMs, many = defaults.jevBaseMs + defaults.jevPerQuestionMs * 1499;
  assert.equal(one, 87);
  assert.ok(Math.abs(many - 610) < 5);
});
test('a single long-option Choice narrows the gap compared with many questions', () => {
  const action = estimate('action'), rerank = estimate('rerank');
  assert.ok(action.writeMs / action.jevMs < rerank.writeMs / rerank.jevMs);
});
