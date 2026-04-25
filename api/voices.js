module.exports = async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  const KEY = process.env.ELEVENLABS_API_KEY;
  if (!KEY) return res.status(500).json({ error: 'ELEVENLABS_API_KEY not set' });
  try {
    const r = await fetch('https://api.elevenlabs.io/v1/voices', { headers: { 'xi-api-key': KEY } });
    if (!r.ok) return res.status(r.status).json({ error: 'ElevenLabs error' });
    const d = await r.json();
    res.setHeader('Cache-Control', 's-maxage=300');
    res.json({ voices: (d.voices || []).map(v => ({ voice_id: v.voice_id, name: v.name, labels: v.labels })) });
  } catch (e) { res.status(500).json({ error: e.message }); }
}
