// pages/api/simli-session.js
// สร้าง Simli WebRTC session token สำหรับ browser

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const SIMLI_KEY = process.env.SIMLI_API_KEY;
  if (!SIMLI_KEY) {
    return res.status(500).json({ error: 'Simli API key not configured' });
  }

  const { face_id = 'tmp9i8bbq7c' } = req.body; // default face

  try {
    // ขอ session token จาก Simli
    const upstream = await fetch('https://api.simli.ai/startWebRTCSession', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        apiKey: SIMLI_KEY,
        faceId: face_id,
        handleSilence: true,
        maxSessionLength: 3600,   // 1 ชั่วโมง
        maxIdleTime: 300,          // idle 5 นาที
      }),
    });

    if (!upstream.ok) {
      const err = await upstream.json().catch(() => ({}));
      return res.status(upstream.status).json({
        error: err?.message || `Simli error ${upstream.status}`,
      });
    }

    const data = await upstream.json();
    // ส่ง session info กลับไปยัง browser (ไม่มี API key)
    res.json({
      session_token: data.session_token || data.sessionToken,
      ice_servers: data.iceServers || data.ice_servers || [],
      face_id,
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
