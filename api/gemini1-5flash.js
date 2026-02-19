export default async function handler(req, res) {
  const API_KEY = process.env.GEMINI_KEY; 

  if (req.method !== 'POST') {
    return res.status(405).json({ error: "Ch chp nhn lnh POST" });
  }

  try {
    // Nhn prompt t user
    const { prompt } = req.body;
    if (!prompt) return res.status(400).json({ error: "Thiu ni dung lnh" });

    /**
     * C D LIU T APP (Da trn file logic.js bn cung cp)
     * Ly d liu t key 'app_data_v4' v 'mName_v3' m logic.js ang s dng
     */
    // Lu : on ny m phng logic c d liu gi ln t Frontend
    const { appData, mName } = req.body; 

    // Thit lp vai tr Tr l Ti chnh
    const systemInstruction = {
      role: "system",
      parts: [{
        text: `Bn l Tr l Ti chnh chuyn nghip ca ng dng qun l chi tiu ny.
               Tn k hin ti: ${mName || "Cha t tn"}.
               D liu v v ngn sch hin ti: ${JSON.stringify(appData || "Cha c d liu")}.
               
               NHIM V:
               1. Ch tr li cc cu hi v ti chnh, phn b ngn sch, t vn chi tiu da trn d liu 'appData'.
               2. Nu ngi dng hi cc vn  khng lin quan (thi tit, gii tr, chnh tr...), hy t chi lch s: "Ti l tr l ti chnh ca bn, ti ch c th h tr cc vn  lin quan n v v chi tiu thi nh!"
               3. Phn tch d liu: Nu v no ang m (spent > alloc), hy a ra cnh bo nh nhng.`
      }]
    };

    // GI NGUYN LOGIC KT NI V MODEL CA BN
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        system_instruction: systemInstruction,
        contents: [{ parts: [{ text: prompt }] }] 
      })
    });

    const data = await response.json();

    if (data.error) {
      return res.status(200).json({ 
        text: ` LI GOOGLE AI: [${data.error.code}] - ${data.error.message}` 
      });
    }

    if (data.candidates && data.candidates[0]) {
      return res.status(200).json({ text: data.candidates[0].content.parts[0].text });
    } 

    return res.status(200).json({ text: "H thng phn hi rng." });

  } catch (error) {
    return res.status(200).json({ text: " LI SERVER: " + error.message });
  }
}
