// pages/api/voices.js
// ดึงรายการ voices จาก ElevenLabs

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const EL_KEY = process.env.ELEVENLABS_API_KEY;
  if (!EL_KEY) {
    return res.status(500).json({ error: 'ElevenLabs API key not configured' });
  }

  try {
    const upstream = await fetch('https://api.elevenlabs.io/v1/voices', {
      headers: { 'xi-api-key': EL_KEY },
    });

    if (!upstream.ok) {
      return res.status(upstream.status).json({ error: 'ElevenLabs error' });
    }

    const data = await upstream.json();
    // ส่งแค่ข้อมูลที่จำเป็น ไม่ expose ข้อมูลอื่น
    const voices = (data.voices || []).map(v => ({
      voice_id: v.voice_id,
      name: v.name,
      labels: v.labels,
      category: v.category,
    }));

    res.setHeader('Cache-Control', 's-maxage=300'); // cache 5 นาที
    res.json({ voices });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
