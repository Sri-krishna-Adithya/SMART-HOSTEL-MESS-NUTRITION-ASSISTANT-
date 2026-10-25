import { test } from 'node:test';
import assert from 'node:assert/strict';
import { calcTargets, toGrams, scaleFood, sumEntries, suggestFoods } from '../src/nutrition.js';

const rice = { name: 'Rice', per100: { kcal: 130, protein: 2.7, carbs: 28, fat: 0.3 }, serving: 200 };
const egg = { name: 'Egg', per100: { kcal: 155, protein: 13, carbs: 1.1, fat: 11 }, serving: 50, price: 7 };
const foods = { rice, egg };
const person = { sex: 'male', age: 20, heightCm: 170, weightKg: 65, activity: 'moderate', goal: 'maintain' };

test('scaleFood scales per-100g values to the given grams', () => {
  const n = scaleFood(rice, 150);
  assert.equal(n.kcal, 195);
  assert.ok(Math.abs(n.protein - 4.05) < 1e-9);
});

test('toGrams converts servings and passes grams through', () => {
  assert.equal(toGrams(rice, 1.5, 'serving'), 300);
  assert.equal(toGrams(rice, 150, 'grams'), 150);
});

test('toGrams rejects zero, negative, empty and huge quantities', () => {
  for (const bad of [0, -5, '', 'abc', 5000]) {
    assert.throws(() => toGrams(rice, bad, 'grams'));
  }
});

test('calcTargets: gain goal needs more calories and protein than lose', () => {
  const lose = calcTargets({ ...person, goal: 'lose' });
  const gain = calcTargets({ ...person, goal: 'gain' });
  assert.ok(gain.calories > lose.calories);
  assert.ok(gain.protein > lose.protein);
});

test('calcTargets: macros roughly add up to the calorie target', () => {
  const t = calcTargets(person);
  const total = t.protein * 4 + t.carbs * 4 + t.fat * 9;
  assert.ok(Math.abs(total - t.calories) < 10);
});

test('calcTargets rejects out-of-range input', () => {
  assert.throws(() => calcTargets({ ...person, age: 5 }));
  assert.throws(() => calcTargets({ ...person, weightKg: 0 }));
  assert.throws(() => calcTargets({ ...person, goal: 'fly' }));
});

test('sumEntries adds entries and skips unknown foods', () => {
  const total = sumEntries([{ foodId: 'rice', grams: 100 }, { foodId: 'egg', grams: 100 }, { foodId: 'gone', grams: 100 }], foods);
  assert.equal(total.kcal, 285);
  assert.equal(total.protein, 15.7);
});

test('suggestFoods respects budget and calorie headroom', () => {
  const remaining = { kcal: 500, protein: 30 };
  const tight = suggestFoods({ candidates: ['egg', 'rice'], foods, remaining, budgetLeft: 0 });
  assert.ok(tight.every((s) => s.id !== 'egg'));
  const open = suggestFoods({ candidates: ['egg', 'rice'], foods, remaining, budgetLeft: 20 });
  assert.equal(open[0].id, 'egg');
});

test('suggestFoods returns nothing once targets are met', () => {
  assert.deepEqual(suggestFoods({ candidates: ['egg'], foods, remaining: { kcal: 0, protein: 10 } }), []);
  assert.deepEqual(suggestFoods({ candidates: ['egg'], foods, remaining: { kcal: 300, protein: -2 } }), []);
});
