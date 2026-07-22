// api/webhook/midtrans.js
export default async function handler(req, res) {
  // Jika Midtrans melakukan tes URL (biasanya GET atau POST kosong)
  if (req.method === 'GET' || !req.body || Object.keys(req.body).length === 0) {
    return res.status(200).json({ success: true, message: 'Webhook endpoint is active and ready!' });
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ success: false, message: `Method ${req.method} not allowed` });
  }

  try {
    const VPS_WEBHOOK_URL = 'http://ruzk.isdarprem.net:50123/api/webhook/midtrans';

    const response = await fetch(VPS_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...req.headers,
      },
      body: JSON.stringify(req.body),
    });

    const responseText = await response.text();
    
    let data;
    try {
      data = JSON.parse(responseText);
    } catch (e) {
      data = { success: true, message: responseText || 'OK' };
    }

    return res.status(response.status).json(data);

  } catch (error) {
    console.error('Proxy error to VPS:', error.message);
    return res.status(500).json({ 
      success: false, 
      message: 'Proxy connection failed: ' + error.message 
    });
  }
}
