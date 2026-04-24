# AI HR Interview — Vercel Deployment

ระบบสัมภาษณ์งาน AI พร้อม Talking Head + ElevenLabs TTS + Claude AI

## Deploy บน Vercel (5 ขั้นตอน)

### 1. สมัคร GitHub (ถ้ายังไม่มี)
ไปที่ github.com → Sign up ฟรี

### 2. อัปโหลดโปรเจกต์นี้ขึ้น GitHub
```bash
# ใน terminal ที่ folder ai-interview/
git init
git add .
git commit -m "first commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/ai-interview.git
git push -u origin main
```

### 3. Deploy บน Vercel
1. ไปที่ vercel.com → Sign up ด้วย GitHub
2. กด "New Project" → เลือก repo `ai-interview`
3. กด "Deploy" (ไม่ต้องเปลี่ยน settings อะไร)

### 4. ใส่ Environment Variables บน Vercel
1. ไปที่ Project Settings → Environment Variables
2. เพิ่ม 2 ตัวนี้:

| Name | Value |
|------|-------|
| `ELEVENLABS_API_KEY` | API Key จาก elevenlabs.io |
| `ANTHROPIC_API_KEY` | API Key จาก console.anthropic.com |

3. กด Save → กด Redeploy

### 5. เปิดใช้งาน
Vercel จะให้ URL เช่น `https://ai-interview-xxx.vercel.app`
เปิดใน Chrome ได้เลย — กล้องและไมค์ทำงานได้ทันทีเพราะเป็น HTTPS

## โครงสร้างไฟล์
```
ai-interview/
├── pages/
│   ├── index.js          ← redirect ไป /app.html
│   └── api/
│       ├── tts.js        ← proxy ElevenLabs TTS
│       ├── voices.js     ← proxy ElevenLabs voice list
│       └── claude.js     ← proxy Anthropic Claude
├── public/
│   └── app.html          ← ตัวแอปหลัก
├── package.json
└── .env.local.example    ← template env vars
```

## การใช้งาน Voice ID
ใน app.html ยังมีช่อง Voice ID ให้กรอกอยู่ครับ
Voice ID คือรหัสเสียงจาก ElevenLabs ที่คุณ clone หรือเลือกใช้
หา ID ได้ที่ elevenlabs.io → Voices → คลิก voice → copy ID
