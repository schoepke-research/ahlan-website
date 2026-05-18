export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name, email, message } = req.body ?? {};

  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Missing fields' });
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
        // Update 'from' to 'hello@ahlancoffee.com' once domain is verified in Resend
        from: 'Ahlan Coffee <onboarding@resend.dev>',
        to: ['hello@ahlancoffee.com'],
        reply_to: email,
        subject: `New enquiry from ${name}`,
        text: `Name: ${name}\nEmail: ${email}\n\n${message}`
      })
    });

    if (!response.ok) {
      const err = await response.text();
      console.error('Resend error:', err);
      return res.status(502).json({ error: 'Failed to send' });
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('Contact handler error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
}
