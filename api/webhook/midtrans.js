// api/webhook/midtrans.js
export default async function handler(req, res) {
  // Hanya terima method POST dari Midtrans
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return.status(405).json({ success: false, message: `Method ${req.method} not allowed` });
  }

  try {
    // 🔥 URL VPS utama kamu (Pastikan port 50123 terbuka di firewall VPS & Express app sudah siap menerimanya)
    const VPS_WEBHOOK_URL = 'http://ruzk.isdarprem.net:50123/api/webhook/midtrans';

    // Teruskan payload dari Midtrans ke VPS
    const response = await fetch(VPS_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Meneruskan header penting dari Midtrans jika diperlukan oleh VPS
        ...req.headers,
        host: new URL(VPS_WEBHOOK_URL).host, // Sesuaikan host header agar tidak bentrok
      },
      body: JSON.stringify(req.body),
    });

    // Ambil respons balik dari VPS
    const responseText = await response.text();
    let data;
    try {
      data = JSON.parse(responseText);
    } catch (e) {
      data = { message: responseText };
    }

    // Kembalikan status code dan respons dari VPS ke Midtrans
    return res.status(response.status).json(data);

  } catch (error) {
    console.error('Vercel Proxy Webhook Error:', error.message);
    return res.status(500).json({ 
      success: false, 
      message: 'Vercel Proxy error: ' + error.message 
    });
  }
}
