import QRCode from 'qrcode';
import { gencode } from 'qris-pay';

export default async function handler(req, res) {
  try {
    if (req.method !== 'GET') {
      return res.status(405).send('Method not allowed');
    }

    const amount = req.query.amount;
    const codeqr = req.query.codeqr;

    if (!amount || !codeqr) {
      return res.status(400).send(
        'Gunakan format:\n' +
        '/api/generate-qris?amount=10000&codeqr=QRIS_STRING'
      );
    }

    const qrisDynamic = await gencode(codeqr, amount);

    const qrBuffer = await QRCode.toBuffer(qrisDynamic, {
      width: 400,
      margin: 2
    });

    res.setHeader('Content-Type', 'image/png');
    return res.status(200).send(qrBuffer);

  } catch (err) {
    console.error('QRIS_ERROR:', err);
    return res.status(500).send(
      'Server Error:\n' + (err?.message || 'Unknown error')
    );
  }
}
