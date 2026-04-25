module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const KEY = process.env.ELEVENLABS_API_KEY;
  if (!KEY) return res.status(500).json({ error: 'ELEVENLABS_API_KEY not set' });
  const { text, voice_id, model_id = 'eleven_multilingual_v2', voice_settings } = req.body;
  if (!text || !voice_id) return res.status(400).json({ error: 'text and voice_id required' });
  try {
    const r = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voice_id}/stream`, {
      method: 'POST',
      headers: { 'xi-api-key': KEY, 'Content-Type': 'application/json', 'Accept': 'audio/mpeg' },
      body: JSON.stringify({ text, model_id, voice_settings: voice_settings || { stability: 0.5, similarity_boost: 0.75, style: 0.3, use_speaker_boost: true } }),
    });
    if (!r.ok) { const e = await r.json().catch(() => ({})); return res.status(r.status).json({ error: e?.detail?.message || 'ElevenLabs error' }); }
    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Cache-Control', 'no-cache');
    res.send(Buffer.from(await r.arrayBuffer()));
  } catch (e) { res.status(500).json({ error: e.message }); }
}
