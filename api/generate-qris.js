const QRCode = require('qrcode');

function crc16(str) {
  let crc = 0xFFFF;
  for (let c = 0; c < str.length; c++) {
    crc ^= str.charCodeAt(c) << 8;
    for (let i = 0; i < 8; i++) {
      crc = (crc & 0x8000) ? (crc << 1) ^ 0x1021 : crc << 1;
    }
  }
  return (crc & 0xFFFF).toString(16).toUpperCase().padStart(4, "0");
}

function makeDynamicQRIS(staticQR, amount) {
  // 1. Ganti dari Statis (11) ke Dinamis (12)
  let qris = staticQR.replace("010211", "010212");

  // 2. Hapus CRC lama (4 digit terakhir)
  qris = qris.slice(0, -4);

  // 3. Cek apakah sudah ada tag nominal (54), kalau belum, tambahkan
  if (!qris.includes("54")) {
    const amtStr = amount.toString();
    const amtTag = "54" + amtStr.length.toString().padStart(2, "0") + amtStr;
    
    // Sisipkan sebelum tag 58 (Country Code)
    const splitPoint = qris.indexOf("5802ID");
    if (splitPoint !== -1) {
      qris = qris.slice(0, splitPoint) + amtTag + qris.slice(splitPoint);
    }
  }

  // 4. Hitung dan pasang CRC baru
  return qris + crc16(qris);
}

module.exports = async (req, res) => {
  try {
    const { amount, codeqr } = req.query;

    if (!amount || !codeqr) {
      return res.status(400).send("Format salah.");
    }

    const dynamicQR = makeDynamicQRIS(codeqr, amount);
    
    const qrBuffer = await QRCode.toBuffer(dynamicQR, {
      width: 450, // Sedikit lebih besar agar lebih tajam di-scan
      margin: 2
    });

    res.setHeader("Content-Type", "image/png");
    res.status(200).send(qrBuffer);

  } catch (err) {
    res.status(500).send("Error: " + err.message);
  }
};
