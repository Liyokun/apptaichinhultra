export default async function handler(req, res) {
  // 1. Lấy khóa bảo mật
  const API_KEY = process.env.GROQ_01_KEY; 
  
  // 2. Nhận dữ liệu từ giao diện (Bao gồm Prompt câu hỏi + Context dữ liệu ví)
  const { prompt } = JSON.parse(req.body);

  try {
    // 3. Gọi Groq với cấu hình "System Role" chặt chẽ
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
            content: `Bạn là AURA - Trợ lý tài chính ảo của ứng dụng quản lý chi tiêu cá nhân.
            
            QUY TẮC TUYỆT ĐỐI:
            1. Bạn có quyền truy cập vào dữ liệu ví (được cung cấp trong prompt). Hãy dùng nó để trả lời chính xác số dư, chi tiêu.
            2. CHỈ trả lời các câu hỏi liên quan đến: Tài chính, Tiền bạc, Ngân sách, Lịch sử giao dịch, Cách tiết kiệm, hoặc về bản thân ứng dụng AURA.
            3. NẾU người dùng hỏi về chủ đề khác (thời tiết, tình yêu, chính trị, viết code, kể chuyện...), hãy từ chối lạnh lùng: "Nội dung không hợp lệ. AURA chỉ hỗ trợ dữ liệu tài chính."
            4. Phong cách trả lời: Ngắn gọn, súc tích, mang hơi hướng Sci-Fi/Cyberpunk.` 
          },
          {
            role: "user",
            content: prompt
          }
        ],
        model: "llama-3.3-70b-versatile",
        temperature: 0.5,
        max_tokens: 500
      })
    });

    const data = await response.json();
    
    // 4. Trả kết quả về cho ProfileUltra2
    res.status(200).json(data);

  } catch (error) {
    res.status(500).json({ error: "Lỗi kết nối Groq Core: " + error.message });
  }
}
