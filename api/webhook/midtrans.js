// api/webhook/midtrans.js
export default async function handler(req, res) {
  // Hanya terima method POST
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    // 🔥 GANTI URL INI dengan VPS kamu
    const VPS_WEBHOOK_URL = 'http://ruzk.isdarprem.net:50123/api/webhook/midtrans';

    const response = await fetch(VPS_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Kirim header asli dari Midtrans jika perlu
        ...req.headers,
      },
      body: JSON.stringify(req.body),
    });

    const data = await response.json();

    return res.status(response.status).json(data);
  } catch (error) {
    console.error('Proxy error:', error.message);
    return res.status(500).json({ success: false, message: 'Proxy error: ' + error.message });
  }
}
