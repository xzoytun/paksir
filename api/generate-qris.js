const { gencode } = require('qris-pay');
const QRCode = require('qrcode');

module.exports = async (req, res) => {
  try {
    const { amount, codeqr } = req.query;

    // Proteksi: Jika parameter tidak ada, jangan lanjut ke gencode
    if (!amount || !codeqr) {
      res.setHeader('Content-Type', 'text/plain');
      return res.status(400).send('Error: Parameter amount dan codeqr wajib diisi!');
    }

    const qrisDynamic = await gencode(codeqr, amount);
    const qrBuffer = await QRCode.toBuffer(qrisDynamic, {
      margin: 2,
      width: 400
    });

    res.setHeader('Content-Type', 'image/png');
    res.status(200).send(qrBuffer);
  } catch (error) {
    console.error('SERVER_ERROR:', error.message);
    res.status(500).send('Terjadi kesalahan: ' + error.message);
  }
};
