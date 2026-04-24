export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const KEY = process.env.SIMLI_API_KEY;
  if (!KEY) return res.status(500).json({ error: 'SIMLI_API_KEY not set' });
  const { face_id = 'tmp9i8bbq7c' } = req.body;
  try {
    const r = await fetch('https://api.simli.ai/startWebRTCSession', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ apiKey: KEY, faceId: face_id, handleSilence: true, maxSessionLength: 3600, maxIdleTime: 300 }),
    });
    if (!r.ok) { const e = await r.json().catch(() => ({})); return res.status(r.status).json({ error: e?.message || 'Simli error' }); }
    const d = await r.json();
    res.json({ session_token: d.session_token || d.sessionToken, ice_servers: d.iceServers || d.ice_servers || [] });
  } catch (e) { res.status(500).json({ error: e.message }); }
}
