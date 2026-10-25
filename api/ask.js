import { askGemini, cleanQuestion } from '../lib/ask.js';

function send(res, status, body) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(body));
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return send(res, 405, { error: 'Use POST' });
  }
  try {
    const question = cleanQuestion(req.body?.question);
    const answer = await askGemini({
      question,
      context: req.body?.context,
      apiKey: process.env.GEMINI_API_KEY,
      model: process.env.GEMINI_MODEL || 'gemini-3.5-flash',
    });
    send(res, 200, { answer });
  } catch (err) {
    send(res, err.status || 500, { error: err.status ? err.message : 'Something went wrong' });
  }
}
