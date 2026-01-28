const axios = require('axios');
const qs = require('qs');

export default async function handler(req, res) {
  // Hanya izinkan metode POST
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    // Vercel otomatis parse JSON body jika dikirim dari bot pakai Content-Type: application/json
    const payload = req.body;

    // Tambahkan log untuk debug di dashboard Vercel
    console.log('Payload diterima bot:', payload);

    // URL Target Asli Orderkuota
    const TARGET_URL = 'https://app.orderkuota.com/api/v2/qris/mutasi/2449343';

    // Kirim request ke Orderkuota
    const response = await axios({
      method: 'post',
      url: TARGET_URL,
      // PENTING: Bungkus payload dengan qs.stringify agar jadi form-urlencoded
      data: qs.stringify({
        auth_username: payload.auth_username || payload.username,
        auth_token: payload.auth_token || payload.token,
        jenis: payload.jenis || 'masuk'
      }),
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'okhttp/4.12.0',
        'Accept': 'application/json'
      }
    });

    // Kirim balik hasilnya ke bot kamu
    return res.status(200).json(response.data);

  } catch (error) {
    console.error('Error Proxy Vercel:', error.message);
    
    const statusCode = error.response ? error.response.status : 500;
    const errorData = error.response ? error.response.data : { message: error.message };
    
    return res.status(statusCode).json(errorData);
  }
}
