// pages/api/gemini.js
// Proxy Google Gemini API

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const GEMINI_KEY = process.env.GEMINI_API_KEY;
  if (!GEMINI_KEY) {
    return res.status(500).json({ error: 'Gemini API key not configured' });
  }

  const { system, history = [], message } = req.body;
  if (!message) {
    return res.status(400).json({ error: 'message required' });
  }

  try {
    // Gemini 2.0 Flash — ฟรี + เร็ว
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_KEY}`;

    // สร้าง contents array รวม history + message ปัจจุบัน
    const contents = [
      ...history,
      { role: 'user', parts: [{ text: message }] }
    ];

    const body = {
      system_instruction: system ? { parts: [{ text: system }] } : undefined,
      contents,
      generationConfig: {
        maxOutputTokens: 400,
        temperature: 0.8,
      },
    };

    const upstream = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!upstream.ok) {
      const err = await upstream.json().catch(() => ({}));
      return res.status(upstream.status).json({
        error: err?.error?.message || `Gemini error ${upstream.status}`,
      });
    }

    const data = await upstream.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    res.json({ text });

  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
