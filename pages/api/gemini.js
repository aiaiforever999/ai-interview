export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const KEY = process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY;
  if (!KEY) return res.status(500).json({ error: 'GEMINI_API_KEY not set' });
  const { system, history = [], message } = req.body;
  if (!message) return res.status(400).json({ error: 'message required' });
  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${KEY}`;
    const body = {
      system_instruction: system ? { parts: [{ text: system }] } : undefined,
      contents: [...history, { role: 'user', parts: [{ text: message }] }],
      generationConfig: { maxOutputTokens: 400, temperature: 0.85 },
    };
    const r = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    if (!r.ok) { const e = await r.json().catch(() => ({})); return res.status(r.status).json({ error: e?.error?.message || 'Gemini error' }); }
    const d = await r.json();
    res.json({ text: d.candidates?.[0]?.content?.parts?.[0]?.text || '' });
  } catch (e) { res.status(500).json({ error: e.message }); }
}
