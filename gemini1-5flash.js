export default async function handler(req, res) {
  const API_KEY = process.env.GEMINI_KEY;

  if (req.method !== 'POST') {
    return res.status(405).json({ error: "Ch chp nhn lnh POST" });
  }

  try {
    const { prompt, appData, mName } = req.body;
    if (!prompt) return res.status(400).json({ error: "Thiu ni dung lnh" });

    // --- BC 1: KIM TRA T KHA  QUYT NH C GI DATA HAY KHNG ---
    const financialKeywords = ['v', 'tin', 'ti chnh', 'chi tiu', 'ngn sch', 'tng', 'cn li', 'bao nhiu', 'm', 'lch s'];
    const isFinancialQuery = financialKeywords.some(key => prompt.toLowerCase().includes(key));

    let contextData = "Ngi dng cha yu cu xem d liu ti chnh.";
    if (isFinancialQuery && appData) {
      // Ch khi hi v ti chnh mi gi d liu app vo
      contextData = `D liu v hin ti (mName: ${mName}): ${JSON.stringify(appData)}`;
    }

    const systemInstruction = {
      role: "system",
      parts: [{
        text: `Bn l Tr l Ti chnh ca ng dng. 
               Ng cnh d liu: ${contextData}.
               NHIM V: 
               1. Nu ng cnh d liu l 'Cha yu cu', hy tr li x giao bnh thng nhng vn gi phong cch ti chnh.
               2. Nu ng cnh c d liu app, hy phn tch  tr li chnh xc v tin bc.
               3. Tuyt i t chi cc cu hi khng lin quan n app hoc ti chnh.`
      }]
    };

    // --- BC 2: S DNG STREAM  TR V TNG CH ---
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:streamGenerateContent?key=${API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system_instruction: systemInstruction,
        contents: [{ parts: [{ text: prompt }] }]
      })
    });

    // Thit lp Header cho Stream
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      // Google tr v cc block JSON trong stream, ta cn lc ly text
      try {
        const jsonChunks = chunk.split('\n');
        for (const jsonChunk of jsonChunks) {
          if (jsonChunk.trim().startsWith('{') || jsonChunk.trim().startsWith(',')) {
            // Loi b du phy  u nu c (do nh dng stream ca Google)
            const cleanJson = jsonChunk.trim().replace(/^,/, '');
            const parsed = JSON.parse(cleanJson);
            const text = parsed.candidates?.[0]?.content?.parts?.[0]?.text || "";
            if (text) res.write(text); // Gi tng phn text v client
          }
        }
      } catch (e) {
        // B qua li parse nu chunk cha hon chnh
      }
    }

    res.end();

  } catch (error) {
    return res.status(500).json({ error: " LI SERVER: " + error.message });
  }
}
