import QRCode from 'qrcode';

function crc16(str) {
  let crc = 0xFFFF;
  for (let c = 0; c < str.length; c++) {
    crc ^= str.charCodeAt(c) << 8;
    for (let i = 0; i < 8; i++) {
      crc = (crc & 0x8000) ? (crc << 1) ^ 0x1021 : crc << 1;
    }
  }
  return (crc & 0xFFFF).toString(16).toUpperCase().padStart(4, '0');
}

function makeDynamicQRIS(staticQR, amount) {
  let qris = staticQR.replace("010211", "010212");

  if (!qris.includes("54")) {
    const nominal = "54" + amount.length.toString().padStart(2, '0') + amount;
    qris = qris.replace("5802ID", nominal + "5802ID");
  }

  qris = qris.replace(/6304[A-F0-9]{4}$/, "6304");
  const crc = crc16(qris);
  return qris + crc;
}

export default async function handler(req, res) {
  try {
    const { amount, codeqr } = req.query;

    if (!amount || !codeqr) {
      return res.status(400).send(
        "Gunakan format:\n" +
        "/api/generate-qris?amount=10000&codeqr=QRIS_STRING"
      );
    }

    const dynamicQR = makeDynamicQRIS(codeqr, amount);

    const qrBuffer = await QRCode.toBuffer(dynamicQR, {
      width: 400,
      margin: 2
    });

    res.setHeader("Content-Type", "image/png");
    return res.status(200).send(qrBuffer);

  } catch (err) {
    console.error("QRIS_ERROR:", err);
    return res.status(500).send("Server Error: " + err.message);
  }
}
