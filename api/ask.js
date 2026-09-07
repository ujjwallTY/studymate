// Serverless function: keeps the Gemini API key on the server, never in the browser.
// Uses Google's Gemini API, which has a genuine free tier (no credit card required).
// Works out of the box on Vercel (any file in /api becomes an endpoint at /api/<filename>).

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { system, message } = req.body || {};

  if (!message || typeof message !== 'string') {
    return res.status(400).json({ error: 'Missing "message" in request body' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'Server is missing GEMINI_API_KEY. Set it in your hosting provider\'s environment variables.' });
  }

  // gemini-2.5-flash is on Google's free tier as of 2026. If you hit rate limits,
  // gemini-2.5-flash-lite has a more generous free-tier quota.
  const MODEL = 'gemini-2.5-flash';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${apiKey}`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: message }] }],
        systemInstruction: system ? { parts: [{ text: system }] } : undefined
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        error: (data && data.error && data.error.message) || 'Gemini API error'
      });
    }

    const text =
      data.candidates &&
      data.candidates[0] &&
      data.candidates[0].content &&
      data.candidates[0].content.parts &&
      data.candidates[0].content.parts[0] &&
      data.candidates[0].content.parts[0].text;

    return res.status(200).json({ text: text || '' });
  } catch (err) {
    return res.status(500).json({ error: 'Server error contacting the AI service' });
  }
}
