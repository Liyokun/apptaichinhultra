export default async function handler(req, res) {
  const API_KEY = process.env.GEMINI_KEY; 

  if (req.method !== 'POST') {
    return res.status(405).json({ error: "Chỉ chấp nhận lệnh POST" });
  }

  try {
    const { prompt } = req.body;
    if (!prompt) return res.status(400).json({ error: "Thiếu nội dung lệnh" });

    const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash-latest:generateContent?key=${API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
    });

    const data = await response.json();

    // KIỂM TRA LỖI TRỰC TIẾP TỪ GOOGLE
    if (data.error) {
      return res.status(200).json({ 
        text: `⚠️ LỖI GOOGLE AI: [${data.error.code}] - ${data.error.message}\n\nHướng dẫn: Kiểm tra lại GEMINI_KEY trong Settings Vercel.` 
      });
    }

    if (data.candidates && data.candidates[0]) {
      // Trả về Object chứa thuộc tính text để HTML dễ đọc
      return res.status(200).json({ text: data.candidates[0].content.parts[0].text });
    } 

    return res.status(200).json({ text: "Hệ thống phản hồi rỗng, hãy thử lại." });

  } catch (error) {
    return res.status(200).json({ text: "🚨 LỖI KẾT NỐI SERVER: " + error.message });
  }
}
