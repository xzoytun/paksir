const QRCode = require('qrcode');

export default async function handler(req, res) {
  const { amount, codeqr } = req.query;

  if (!codeqr) return res.status(400).send('Missing QR Data');

  try {
    // Logic: Kamu bisa pakai library 'qris-payment' jika ingin QR Dynamic asli
    // Atau sekedar generate QR dari string statis untuk tahap awal
    const qrBuffer = await QRCode.toBuffer(codeqr, {
      margin: 2,
      width: 400
    });

    res.setHeader('Content-Type', 'image/png');
    res.send(qrBuffer);
  } catch (err) {
    res.status(500).send(err.message);
  }
}
