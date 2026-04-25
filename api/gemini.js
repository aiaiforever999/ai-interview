module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const KEY = process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY;
  if (!KEY) return res.status(500).json({ error: 'GOOGLE_API_KEY not set' });
  const { system, history = [], message } = req.body;
  if (!message) return res.status(400).json({ error: 'message required' });

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${KEY}`;
  const body = {
    system_instruction: system ? { parts: [{ text: system }] } : undefined,
    contents: [...history, { role: 'user', parts: [{ text: message }] }],
    generationConfig: { maxOutputTokens: 400, temperature: 0.85 },
  };

  // Retry up to 3 times if 429 rate limit
  const wait = ms => new Promise(r => setTimeout(r, ms));
  let lastError = '';

  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      if (attempt > 0) await wait(attempt * 5000); // 5s, 10s
      const r = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      if (r.status === 429) {
        lastError = 'Rate limit';
        continue; // retry
      }
      if (!r.ok) {
        const e = await r.json().catch(() => ({}));
        return res.status(r.status).json({ error: e?.error?.message || 'Gemini error' });
      }
      const d = await r.json();
      return res.json({ text: d.candidates?.[0]?.content?.parts?.[0]?.text || '' });
    } catch (e) {
      lastError = e.message;
    }
  }

  return res.status(429).json({ error: 'Rate limit — ลองใหม่อีกครั้งครับ' });
}
