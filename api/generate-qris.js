const { gencode } = require('qris-pay');
const QRCode = require('qrcode');

module.exports = async (req, res) => {
  try {
    const { amount, codeqr } = req.query;

    if (!amount || !codeqr) {
      return res.status(400).send('Parameter amount dan codeqr wajib diisi!');
    }

    const qrisDynamic = await gencode(codeqr, amount);
    const qrBuffer = await QRCode.toBuffer(qrisDynamic, {
      margin: 2,
      width: 400
    });

    res.setHeader('Content-Type', 'image/png');
    res.status(200).send(qrBuffer);
  } catch (error) {
    res.status(500).send('Error: ' + error.message);
  }
};
