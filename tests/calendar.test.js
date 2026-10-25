import { test } from 'node:test';
import assert from 'node:assert/strict';
import { daysInMonth } from '../public/src/calendar.js';

test('daysInMonth returns every date of the month', () => {
  const days = daysInMonth('2026-10');
  assert.equal(days.length, 31);
  assert.equal(days[0], '2026-10-01');
  assert.equal(days[30], '2026-10-31');
});

test('daysInMonth handles February in leap and normal years', () => {
  assert.equal(daysInMonth('2026-02').length, 28);
  assert.equal(daysInMonth('2028-02').length, 29);
});

test('daysInMonth rejects bad input', () => {
  for (const bad of ['', 'abc', '2026-13', '2026-00', undefined]) {
    assert.throws(() => daysInMonth(bad));
  }
});
