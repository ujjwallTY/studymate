// Serverless function: keeps the Anthropic API key on the server, never in the browser.
// Works out of the box on Vercel (any file in /api becomes an endpoint at /api/<filename>).

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { system, message } = req.body || {};

  if (!message || typeof message !== 'string') {
    return res.status(400).json({ error: 'Missing "message" in request body' });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'Server is missing ANTHROPIC_API_KEY. Set it in your hosting provider\'s environment variables.' });
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        // Swap this for a cheaper/faster model (e.g. a Haiku-class model) if you
        // want to reduce cost per request once you have real traffic.
        model: 'claude-sonnet-5',
        max_tokens: 1000,
        system: system || '',
        messages: [{ role: 'user', content: message }]
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        error: (data && data.error && data.error.message) || 'Anthropic API error'
      });
    }

    const textBlock = (data.content || []).find((b) => b.type === 'text');
    return res.status(200).json({ text: textBlock ? textBlock.text : '' });
  } catch (err) {
    return res.status(500).json({ error: 'Server error contacting the AI service' });
  }
}
