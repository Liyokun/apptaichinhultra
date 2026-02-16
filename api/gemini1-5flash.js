export default async function handler(req, res) {
  const API_KEY = process.env.GEMINI_KEY; 

  if (req.method !== 'POST') {
    return res.status(405).json({ error: "Chỉ chấp nhận lệnh POST" });
  }

  try {
    const { prompt } = req.body;
    if (!prompt) return res.status(400).json({ error: "Thiếu nội dung lệnh" });

    // CẬP NHẬT: Dùng v1beta và model gemini-3-flash-preview
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
    });

    const data = await response.json();

    if (data.error) {
      return res.status(200).json({ 
        text: `⚠️ LỖI GOOGLE AI: [${data.error.code}] - ${data.error.message}` 
      });
    }

    if (data.candidates && data.candidates[0]) {
      return res.status(200).json({ text: data.candidates[0].content.parts[0].text });
    } 

    return res.status(200).json({ text: "Hệ thống phản hồi rỗng." });

  } catch (error) {
    return res.status(200).json({ text: "🚨 LỖI SERVER: " + error.message });
  }
}
