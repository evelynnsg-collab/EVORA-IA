// EVORA: Gemini requests originate on the server; never store your API key in HTML.
module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') return res.status(405).json({error: 'Método não permitido'});
  const key = process.env.GEMINI_API_KEY;
  if (!key) return res.status(503).json({error: 'GEMINI_API_KEY ainda não foi configurada na Vercel'});
  try {
    const raw = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const list = raw?.messages;
    if (!Array.isArray(list) || list.length > 40) return res.status(400).json({error: 'Histórico inválido'});
    const recent = list.slice(-24);
    const contents = recent.filter(m => m && (m.role === 'user' || m.role === 'assistant') && typeof m.text === 'string' && m.text.trim())
      .map(m => ({role: m.role === 'assistant' ? 'model' : 'user', parts: [{text: m.text.slice(0, 4000)}]}));
    if (!contents.length || contents.reduce((n,m) => n + m.parts[0].text.length, 0) > 18000) {
      return res.status(400).json({error: 'Mensagem muito longa ou vazia'});
    }
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 25000);
    let response;
    try {
      const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
      if (!/^[a-zA-Z0-9_.-]+$/.test(model)) throw new Error('Modelo inválido');
      response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
        method:'POST', signal:controller.signal,
        headers:{'Content-Type':'application/json','x-goog-api-key':key},
        body:JSON.stringify({
          systemInstruction:{parts:[{text:'Você é EVORA, uma assistente virtual inteligente, educada, natural e direta. Converse em português brasileiro de maneira informal, respeitosa e clara. Nunca diga ter executado ações que não realizou. Diga quando não tiver acesso a funções.'}]},
          contents, generationConfig:{temperature:0.75,maxOutputTokens:1000}
        })
      });
    } finally { clearTimeout(timer); }
    if (!response.ok) return res.status(502).json({error:`Não foi possível acessar a IA (código ${response.status}).`});
    const data = await response.json();
    const reply = data.candidates?.[0]?.content?.parts?.map(p => p.text || '').join('\n').trim();
    return res.status(200).json({reply: reply || 'Não consegui gerar uma resposta agora.'});
  } catch (e) {
    return res.status(502).json({error: e?.name === 'AbortError' ? 'A resposta demorou demais; tente novamente.' : 'Falha temporária ao consultar a IA.'});
  }
};
