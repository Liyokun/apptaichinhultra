export default async function handler(req, res) {
  // 1. Lấy "chìa khóa" GROQ_01_KEY bạn đã cất trên Vercel
  const API_KEY = process.env.GROQ_01_KEY; 
  
  // 2. Nhận câu lệnh từ giao diện gửi sang
  const { prompt } = JSON.parse(req.body);

  try {
    // 3. Gọi trạm Groq với tốc độ bàn thờ
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json' 
      },
      body: JSON.stringify({
        messages: [
          { 
            role: "system", 
            content: "Bạn là trợ lý tài chính AURA, trả lời ngắn gọn, lạnh lùng, chuyên nghiệp." 
          },
          {
            role: "user",
            content: prompt
          }
        ],
        model: "llama-3.3-70b-versatile", // Model xịn và cân bằng nhất của Groq hiện tại
        temperature: 0.5 
      })
    });

    const data = await response.json();
    
    // 4. Gửi kết quả về cho giao diện AURA
    // Groq trả về cấu trúc: data.choices[0].message.content
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: "Lỗi kết nối Groq Core" });
  }
}

