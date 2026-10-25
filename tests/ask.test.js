import { test } from 'node:test';
import assert from 'node:assert/strict';
import { cleanQuestion, buildPrompt, askGemini } from '../lib/ask.js';

const okResponse = (text) => ({ ok: true, status: 200, json: async () => ({ candidates: [{ content: { parts: [{ text }] } }] }) });
const args = { question: 'What should I eat for dinner?', context: { menu: { dinner: ['Chapati'] } }, apiKey: 'test-key', model: 'test-model' };

test('cleanQuestion trims and collapses whitespace', () => {
  assert.equal(cleanQuestion('  high   protein\n dinner? '), 'high protein dinner?');
});

test('cleanQuestion rejects empty, non-text and overlong input', () => {
  assert.throws(() => cleanQuestion('   '), { status: 400 });
  assert.throws(() => cleanQuestion(42), { status: 400 });
  assert.throws(() => cleanQuestion('a'.repeat(301)), { status: 400 });
});

test('buildPrompt puts the menu in the system text and the question in the user text', () => {
  const { systemText, userText } = buildPrompt('any eggs?', { menu: { lunch: ['Egg curry'] } });
  assert.match(systemText, /Egg curry/);
  assert.equal(userText, 'any eggs?');
});

test('buildPrompt caps very large context', () => {
  const { systemText } = buildPrompt('hi', { junk: 'x'.repeat(10000) });
  assert.ok(systemText.length < 4500);
});

test('askGemini sends the key in a header and returns the text', async () => {
  let seen;
  const fetchFn = async (url, opts) => { seen = { url, opts }; return okResponse('Have 2 chapatis and dal.'); };
  const answer = await askGemini({ ...args, fetchFn });
  assert.equal(answer, 'Have 2 chapatis and dal.');
  assert.match(seen.url, /test-model:generateContent$/);
  assert.equal(seen.opts.headers['x-goog-api-key'], 'test-key');
  assert.ok(!seen.url.includes('test-key'));
});

test('askGemini fails clearly without an API key', async () => {
  await assert.rejects(askGemini({ ...args, apiKey: undefined, fetchFn: async () => okResponse('x') }), { status: 503 });
});

test('askGemini maps rate limits and upstream errors', async () => {
  await assert.rejects(askGemini({ ...args, fetchFn: async () => ({ ok: false, status: 429 }) }), { status: 429 });
  await assert.rejects(askGemini({ ...args, fetchFn: async () => ({ ok: false, status: 500 }) }), { status: 502 });
});

test('askGemini handles a response with no text', async () => {
  const fetchFn = async () => ({ ok: true, status: 200, json: async () => ({ candidates: [] }) });
  await assert.rejects(askGemini({ ...args, fetchFn }), { status: 502 });
});

test('askGemini tells the user when the answer was cut off', async () => {
  const fetchFn = async () => ({ ok: true, status: 200, json: async () => ({ candidates: [{ finishReason: 'MAX_TOKENS', content: { parts: [{ text: 'Half an ans' }] } }] }) });
  const answer = await askGemini({ ...args, fetchFn });
  assert.match(answer, /^Half an ans/);
  assert.match(answer, /cut short/);
});
