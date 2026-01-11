// api/mutasi.js
const axios = require('axios');

export default async function handler(req, res) {
    // Set Header agar bisa diakses dari mana saja (CORS)
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, message: 'Gunakan POST' });
    }

    const { account_id, auth_username, auth_token } = req.body;

    if (!account_id || !auth_username || !auth_token) {
        return res.status(400).json({ success: false, message: 'Data tidak lengkap' });
    }

    const url = `https://app.orderkuota.com/api/v2/qris/mutasi/${account_id}`;

    try {
        const response = await axios.post(url, new URLSearchParams({
            auth_username: auth_username,
            auth_token: auth_token
        }).toString(), {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'User-Agent': 'okhttp/4.12.0' // Meniru aplikasi asli
            },
            timeout: 10000 // Timeout 10 detik
        });

        // Kembalikan hasil mutasi ke VPS kamu
        return res.status(200).json(response.data);

    } catch (error) {
        console.error('Error Bridge:', error.message);
        return res.status(error.response?.status || 500).json(
            error.response?.data || { success: false, message: error.message }
        );
    }
}
