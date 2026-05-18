export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
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
    // Notify hello@ahlancoffee.com of the new subscriber
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        // Update 'from' to 'hello@ahlancoffee.com' once domain is verified in Resend
        from: 'Ahlan Coffee <onboarding@resend.dev>',
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
}
