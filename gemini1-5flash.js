export default async function handler(req, res) {
  // 1. Lấy API KEY từ Environment Variables của Vercel
  const API_KEY = process.env.GEMINI_KEY; 

  // 2. Kiểm tra phương thức yêu cầu (Chỉ nhận POST)
  if (req.method !== 'POST') {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // 3. Lấy prompt từ body (Vercel tự động parse JSON nên không cần JSON.parse nữa)
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: "Missing prompt" });
    }

    // 4. Gọi đến Google Gemini API
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    });

    const data = await response.json();

    // 5. Kiểm tra và trả về dữ liệu SẠCH cho file HTML của bạn
    if (data.candidates && data.candidates[0] && data.candidates[0].content) {
      // Trả về đúng cấu trúc mà profileultra2.html đang chờ đợi
      res.status(200).json(data);
    } else {
      console.error("Gemini Error Detail:", data);
      res.status(500).json({ error: "AI không phản hồi đúng cấu trúc" });
    }

  } catch (error) {
    console.error("Fetch Error:", error);
    res.status(500).json({ error: "Lỗi kết nối AI Core: " + error.message });
  }
}
