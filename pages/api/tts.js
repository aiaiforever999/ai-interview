// pages/api/tts.js
// Proxy ElevenLabs TTS — ป้องกัน API key ไม่ให้อยู่ใน browser

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { text, voice_id, model_id = 'eleven_multilingual_v2', voice_settings } = req.body;

  if (!text || !voice_id) {
    return res.status(400).json({ error: 'text and voice_id required' });
  }

  const EL_KEY = process.env.ELEVENLABS_API_KEY;
  if (!EL_KEY) {
    return res.status(500).json({ error: 'ElevenLabs API key not configured' });
  }

  try {
    const upstream = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voice_id}/stream`,
      {
        method: 'POST',
        headers: {
          'xi-api-key': EL_KEY,
          'Content-Type': 'application/json',
          'Accept': 'audio/mpeg',
        },
        body: JSON.stringify({
          text,
          model_id,
          voice_settings: voice_settings || {
            stability: 0.5,
            similarity_boost: 0.75,
            style: 0.3,
            use_speaker_boost: true,
          },
        }),
      }
    );

    if (!upstream.ok) {
      const err = await upstream.json().catch(() => ({}));
      return res.status(upstream.status).json({
        error: err?.detail?.message || `ElevenLabs error ${upstream.status}`,
      });
    }

    // Stream audio กลับไปยัง browser
    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Cache-Control', 'no-cache');
    const arrayBuffer = await upstream.arrayBuffer();
    res.send(Buffer.from(arrayBuffer));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
