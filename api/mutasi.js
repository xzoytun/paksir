const axios = require('axios');

export default async function handler(req, res) {
  // Hanya izinkan metode POST
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    // Ambil body yang dikirim dari bot kamu (auth_username, auth_token, dll)
    const payload = req.body;

    // URL Target Asli Orderkuota
    const TARGET_URL = 'https://app.orderkuota.com/api/v2/qris/mutasi/2449343';

    // Kirim request ke Orderkuota
    const response = await axios({
      method: 'post',
      url: TARGET_URL,
      data: payload,
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
    
    // Jika error dari server Orderkuota, kirim statusnya
    const statusCode = error.response ? error.response.status : 500;
    const errorData = error.response ? error.response.data : { message: error.message };
    
    return res.status(statusCode).json(errorData);
  }
}
