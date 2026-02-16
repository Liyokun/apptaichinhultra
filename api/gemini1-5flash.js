export default async function handler(req, res) {
  // Lấy "chìa khóa" từ két sắt Vercel đã cài đặt
  const API_KEY = process.env.GEMINI_KEY; 
  
  // Nhận câu lệnh từ trang lenh01 gửi sang
  const { prompt } = JSON.parse(req.body);

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    });

    const data = await response.json();
    
    // Gửi kết quả sạch về cho giao diện Terminal
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: "Lỗi kết nối AI Core" });
  }
}
