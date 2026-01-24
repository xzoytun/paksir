const axios = require('axios');
const qs = require('qs');
// Ambil config lama (buat ambil token/user)
const orkutConfig = require('../api-cekpayment-orkut');

export default async function handler(req, res) {
  // 1. Target URL OrderKuota (Bukan target paksir lagi)
  const API_ORDER_KUOTA = 'https://app.orderkuota.com/api/v2/qris/mutasi/2449343';
  const ts = Date.now().toString();

  // 2. Susun Payload lengkap ala OrderKuota
  const payload = qs.stringify({
    'app_reg_id': 'cFatqTI9Qe-w5RCucj8qtI:APA91bHl2OcuNjXH24L90UL3FqtiZJLOhhP0QvnVIVibCKt-Y3s97237nfvNYsv3MK1uWG7uZ9mriHOxiw3aysN8NzyelDzxGE_LREVv5IhwClwMxrfIZQw',
    'phone_uuid': 'cFatqTI9Qe-w5RCucj8qtI',
    'requests[qris_history][jenis]': 'debet',
    'phone_model': 'M2103K19PG',
    'request_time': ts,
    'auth_username': 'kangnaum',
    'auth_token': '2449343:LANp7rEhloiH0d3ImSvnX8JjMgDa5eFU',
    'app_version_code': '260115',
    'ui_mode': 'dark',
    'requests[0]': 'account'
  });

  try {
    const response = await axios.post(API_ORDER_KUOTA, payload, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'okhttp/4.12.0',
        'Accept-Encoding': 'gzip',
        'timestamp': ts,
        'signature': 'dd8dcad4e4121cb2b417a2f5b271bd4565c3f93eb6885f8f479e0b8dd80332950656f4b49b1b7b321ce72875d70eebc509c99dfa0f99c2a1e4b4d1ecd352aec9'
      }
    });

    // Balikin datanya ke domain paksir.sshgreen.cloud/api/mutasi lu
    return res.status(200).json(response.data);

  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.response ? error.response.data : error.message
    });
  }
}
