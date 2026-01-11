import { gencode } from 'qris-pay';
import QRCode from 'qrcode';

export default async function handler(req, res) {
  try {
    const { amount, codeqr } = req.query;

    if (!amount || !codeqr) {
      res.setHeader('Content-Type', 'text/plain');
      return res.status(400).send(
        'Error: Parameter amount dan codeqr wajib diisi!\n' +
        'Contoh: ?amount=10000&codeqr=00020101...'
      );
    }

    const qrisDynamic = await gencode(codeqr, amount);

    const qrBuffer = await QRCode.toBuffer(qrisDynamic, {
      margin: 2,
      width: 400
    });

    res.setHeader('Content-Type', 'image/png');
    res.status(200).send(qrBuffer);

  } catch (error) {
    console.error('SERVER_ERROR:', error);

    res.status(500).send(
      'Terjadi kesalahan di server:\n' +
      (error?.message || 'Unknown error')
    );
  }
}
