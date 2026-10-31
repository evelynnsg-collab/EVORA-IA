// Public status only: never reveal API keys.
module.exports = function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'GET') return res.status(405).json({error: 'Método não permitido'});
  res.status(200).json({ai: Boolean(process.env.GEMINI_API_KEY)});
};
