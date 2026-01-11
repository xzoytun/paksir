import QRCode from "qrcode";

function crc16(payload) {
  let crc = 0xFFFF;
  for (let i = 0; i < payload.length; i++) {
    crc ^= payload.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      crc = (crc & 0x8000) ? (crc << 1) ^ 0x1021 : crc << 1;
    }
  }
  return (crc & 0xFFFF).toString(16).toUpperCase().padStart(4, "0");
}

function parseTLV(data) {
  const result = [];
  let i = 0;
  while (i < data.length) {
    const tag = data.substr(i, 2);
    const len = parseInt(data.substr(i + 2, 2));
    const val = data.substr(i + 4, len);
    result.push({ tag, len, val });
    i += 4 + len;
  }
  return result;
}

function buildTLV(list) {
  return list.map(x => x.tag + String(x.val.length).padStart(2, '0') + x.val).join('');
}

function makeDynamicQRIS(staticQR, amount) {
  let tlv = parseTLV(staticQR);

  // Ubah jadi dynamic
  tlv = tlv.map(t => t.tag === "01" ? { ...t, val: "12" } : t);

  // Hapus CRC lama
  tlv = tlv.filter(t => t.tag !== "63");

  // Tambah nominal (Tag 54)
  tlv.push({
    tag: "54",
    val: amount
  });

  // Bangun ulang
  let payload = buildTLV(tlv) + "6304";
  const crc = crc16(payload);

  return payload + crc;
}

export default async function handler(req, res) {
  try {
    const { amount, codeqr } = req.query;

    if (!amount || !codeqr) {
      return res.status(400).send("amount & codeqr wajib");
    }

    if (!codeqr.startsWith("000201")) {
      return res.status(400).send("QRIS tidak valid");
    }

    const dynamicQR = makeDynamicQRIS(codeqr, amount);

    const qrBuffer = await QRCode.toBuffer(dynamicQR, {
      width: 400,
      margin: 2
    });

    res.setHeader("Content-Type", "image/png");
    res.status(200).send(qrBuffer);

  } catch (err) {
    console.error(err);
    res.status(500).send(err.message);
  }
}
