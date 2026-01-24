const axios = require('axios');
const qs = require('qs');
// Ambil config lama cuma buat dapet Username & Token-nya doang
const orkutConfig = require('../api-cekpayment-orkut');

export default async function handler(req, res) {
  // 1. Link asli OrderKuota yang lu mau
  const REAL_API_URL = 'https://app.orderkuota.com/api/v2/qris/mutasi/2449343';
  const ts = Date.now().toString();

  // 2. Bongkar buildPayload() lama buat ambil username & token
  // Lalu kita rakit ulang sesuai kebutuhan OrderKuota V2
  const payload = qs.stringify({
    'app_reg_id': 'cFatqTI9Qe-w5RCucj8qtI:APA91bHl2OcuNjXH24L90UL3FqtiZJLOhhP0QvnVIVibCKt-Y3s97237nfvNYsv3MK1uWG7uZ9mriHOxiw3aysN8NzyelDzxGE_LREVv5IhwClwMxrfIZQw',
    'phone_uuid': 'cFatqTI9Qe-w5RCucj8qtI',
    'requests[qris_history][jenis]': 'debet',
    'phone_model': 'M2103K19PG',
    'request_time': ts,
    'auth_username': 'kangnaum',
    'auth_token': '2449343:LANp7rEhloiH0d3ImSvnX8JjMgDa5eFU',
    'app_version_code': '260115',
    'app_version_name': '26.01.15',
    'ui_mode': 'dark',
    'requests[0]': 'account'
  });

  try {
    const response = await axios.post(REAL_API_URL, payload, {
      headers: {
        ...orkutConfig.headers, // Ambil header okhttp dll dari file lama
        'signature': 'dd8dcad4e4121cb2b417a2f5b271bd4565c3f93eb6885f8f479e0b8dd80332950656f4b49b1b7b321ce72875d70eebc509c99dfa0f99c2a1e4b4d1ecd352aec9',
        'timestamp': ts
      }
    });

    // Balikin data mutasi asli dari OrderKuota
    return res.status(200).json(response.data);

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Gagal tembak API OrderKuota",
      error: error.response ? error.response.data : error.message
    });
  }
}
