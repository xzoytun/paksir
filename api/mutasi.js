import axios from 'axios';
import qs from 'qs';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const payload = req.body;

    // URL Target Asli Orderkuota
    const TARGET_URL = 'https://app.orderkuota.com/api/v2/qris/mutasi/2449343';

    const response = await axios({
      method: 'post',
      url: TARGET_URL,
      // Mengubah JSON dari bot menjadi Form-Urlencoded untuk Orkut
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

    return res.status(200).json(response.data);

  } catch (error) {
    const statusCode = error.response ? error.response.status : 500;
    return res.status(statusCode).json(error.response ? error.response.data : { message: error.message });
  }
}
