const rateLimit = new Map();

function isRateLimited(ip) {
  const now = Date.now();
  const windowMs = 60 * 1000; // 1 minute
  const max = 3;

  const entry = rateLimit.get(ip) || { count: 0, start: now };
  if (now - entry.start > windowMs) {
    rateLimit.set(ip, { count: 1, start: now });
    return false;
  }
  if (entry.count >= max) return true;
  rateLimit.set(ip, { count: entry.count + 1, start: entry.start });
  return false;
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Honeypot check — bots fill this, humans don't
  if (req.body?.website) {
    return res.status(200).json({ ok: true });
  }

  const ip = req.headers['x-forwarded-for']?.split(',')[0] || 'unknown';
  if (isRateLimited(ip)) {
    return res.status(429).json({ error: 'Too many requests' });
  }

  const { email } = req.body ?? {};
  if (!email || !email.includes('@')) {
    return res.status(400).json({ error: 'Invalid email' });
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'Server misconfiguration' });
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'Ahlan Coffee <hello@ahlancoffee.com>',
        to: ['hello@ahlancoffee.com'],
        subject: 'New newsletter subscriber',
        text: `New subscriber: ${email}`
      })
    });

    if (!response.ok) {
      const err = await response.text();
      console.error('Resend error:', err);
      return res.status(502).json({ error: 'Failed to send' });
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('Newsletter handler error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
};
