// pages/api/did.js
// D-ID Talking Avatar proxy

// เพิ่ม timeout เป็น 60 วินาที
export const config = { maxDuration: 60 };

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const KEY = process.env.DID_API_KEY;
  if (!KEY) return res.status(500).json({ error: 'DID_API_KEY not set' });

  const { image_url, text, voice_id } = req.body;
  if (!image_url || !text) return res.status(400).json({ error: 'image_url and text required' });

  const auth = `Basic ${KEY}`;

  try {
    // Step 1: Create talk
    const createRes = await fetch('https://api.d-id.com/talks', {
      method: 'POST',
      headers: { 'Authorization': auth, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        source_url: image_url,
        script: {
          type: 'text',
          input: text,
          provider: { type: 'microsoft', voice_id: voice_id || 'th-TH-PremwadeeNeural' },
        },
        config: { fluent: true, pad_audio: 0.0 },
      }),
    });

    if (!createRes.ok) {
      const e = await createRes.json().catch(() => ({}));
      return res.status(createRes.status).json({ error: e?.description || 'D-ID create error' });
    }

    const { id } = await createRes.json();

    // Step 2: Poll until done (max 55s, every 1.5s)
    for (let i = 0; i < 36; i++) {
      await new Promise(r => setTimeout(r, 1500));
      const pollRes = await fetch(`https://api.d-id.com/talks/${id}`, {
        headers: { 'Authorization': auth },
      });
      const data = await pollRes.json();
      if (data.status === 'done') return res.json({ result_url: data.result_url });
      if (data.status === 'error') return res.status(500).json({ error: data.error?.description || 'D-ID error' });
    }

    return res.status(504).json({ error: 'D-ID timeout' });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
