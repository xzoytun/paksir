// File: api/webhook/midtrans.js (Vercel)
// Forwarder Midtrans → VPS

const VPS_INTERNAL_WEBHOOK_URL = 'http://ruzk.isdarprem.net:50123/webhook/midtrans';
// Ganti dengan domain VPS dan path endpoint yang sudah kamu buat di app.js

export default async function handler(req, res) {
  // Hanya terima POST
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      message: 'Method not allowed',
    });
  }

  try {
    // Ambil payload dari Midtrans (sudah parsed otomatis oleh Vercel)
    const payload = req.body;

    // Log untuk debugging (opsional, bisa dihapus)
    console.log('[Midtrans Webhook] Received:', JSON.stringify(payload).slice(0, 200));

    // Forward ke VPS
    const forwardResp = await fetch(VPS_INTERNAL_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Bisa tambahkan header untuk identifikasi asal (opsional)
        'X-Forwarded-From': 'vercel-midtrans',
      },
      body: JSON.stringify(payload),
    });

    // Baca response dari VPS (untuk logging)
    const responseText = await forwardResp.text();
    const statusCode = forwardResp.status;

    console.log(`[Midtrans Webhook] Forwarded ke VPS, status: ${statusCode}`);

    // Midtrans mengharapkan response 200 OK untuk menganggap sukses
    return res.status(200).json({
      success: true,
      forwardedStatus: statusCode,
      // responseText, // jika ingin debug
    });
  } catch (err) {
    console.error('[Midtrans Webhook] Error forwarding:', err.message || err);

    // Tetap balik 200 agar Midtrans tidak retry (kecuali mau retry)
    // Tapi lebih baik 500 agar Midtrans tahu ada masalah
    return res.status(500).json({
      success: false,
      message: 'Internal Server Error',
    });
  }
}
