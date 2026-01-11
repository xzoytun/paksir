const { gencode } = require('qris-pay');
const QRCode = require('qrcode');

export default async function handler(req, res) {
  // Mengambil parameter dari URL
  const { amount, codeqr } = req.query;

  // Validasi input
  if (!amount || !codeqr) {
    return res.status(400).json({ 
      status: 'error', 
      message: 'Parameter amount dan codeqr harus diisi!' 
    });
  }

  try {
    // 1. Proses mengubah QR Statis jadi Dynamic sesuai nominal
    // gencode(payload_qris, nominal)
    const qrisDynamic = await gencode(codeqr, amount);

    // 2. Generate Gambar QR Code dari string hasil gencode
    const qrBuffer = await QRCode.toBuffer(qrisDynamic, {
      margin: 2,
      scale: 10, // Kualitas gambar diperbagus
      color: {
        dark: '#000000', // Warna QR Hitam
        light: '#ffffff', // Background Putih
      },
    });

    // 3. Set header sebagai gambar PNG agar bisa dibaca Bot/Browser
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Cache-Control', 'public, max-age=604800, immutable'); // Cache agar cepat
    
    // Kirim gambarnya
    res.status(200).send(qrBuffer);

  } catch (error) {
    console.error('Error Generate QRIS:', error);
    res.status(500).json({ 
      status: 'error', 
      message: 'Gagal membuat QRIS: ' + error.message 
    });
  }
}
