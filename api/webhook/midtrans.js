export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const targetUrl = 'http://ruzk.isdarprem.net:50123/webhook/midtrans';

  try {
    // Forward seluruh header dan body secara utuh
    const response = await fetch(targetUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-midtrans-signature': req.headers['x-midtrans-signature'] || '',
      },
      body: JSON.stringify(req.body), // req.body sudah berupa object dari Vercel
    });

    const data = await response.text();
    res.status(response.status).send(data);
  } catch (error) {
    console.error('Proxy error:', error);
    res.status(500).json({ error: 'Failed to forward webhook' });
  }
}
