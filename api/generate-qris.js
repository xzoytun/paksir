const { gencode } = require('qris-pay');
const QRCode = require('qrcode');

module.exports = async (req, res) => {
  try {
    const { amount, codeqr } = req.query;

    // Cek parameter
    if (!amount || !codeqr) {
      return res.status(400).send('Parameter amount dan codeqr wajib diisi!');
    }

    // 1. Generate QRIS Dynamic string
    const qrisDynamic = await gencode(codeqr, amount);

    // 2. Generate Buffer Gambar
    const qrBuffer = await QRCode.toBuffer(qrisDynamic, {
      margin: 2,
      width: 400
    });

    // 3. Kirim Header Gambar
    res.setHeader('Content-Type', 'image/png');
    res.status(200).send(qrBuffer);

  } catch (error) {
    console.error('SERVER ERROR:', error);
    res.status(500).send('Terjadi kesalahan internal: ' + error.message);
  }
};
