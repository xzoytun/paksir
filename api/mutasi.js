const https = require('https');

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', 'application/json');

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Harus POST' });
    }

    // Hapus account_id dari sini karena bot tidak mengirimnya
    const { auth_username, auth_token } = req.body;

    // Pastikan username dan token ada agar tidak error
    if (!auth_username || !auth_token) {
        return res.status(400).json({ error: 'Auth Username dan Token wajib diisi' });
    }

    const bodyObj = {
        'auth_username': auth_username,
        'auth_token': auth_token,
        'requests[qris_history][page]': '1',
        'requests[qris_history][dari_tanggal]': '',
        'requests[qris_history][ke_tanggal]': '',
        'requests[0]': 'account'
    };

    const postData = Object.keys(bodyObj)
        .map(key => encodeURIComponent(key) + '=' + encodeURIComponent(bodyObj[key]))
        .join('&');

    // --- BAGIAN PENTING: ISI ID ACCOUNT SECARA MANUAL ---
    // Ganti 'ANGKA_ID_DISINI' dengan ID account Orderkuota kamu
    // Bisa kamu lihat di aplikasi Orderkuota atau di riwayat mutasi QRIS
    const myAccountId = 'ANGKA_ID_DISINI'; 
    // ---------------------------------------------------

    const options = {
        hostname: 'app.orderkuota.com',
        path: `/api/v2/qris/mutasi/${myAccountId}`, // Pakai ID yang sudah diisi manual
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': Buffer.byteLength(postData),
            'User-Agent': 'okhttp/4.12.0'
        }
    };

    const request = https.request(options, (response) => {
        let data = '';
        response.on('data', (chunk) => { data += chunk; });
        response.on('end', () => {
            try {
                // Balikkan JSON ke bot
                res.status(response.statusCode).json(JSON.parse(data));
            } catch (e) {
                res.status(500).json({ error: 'Gagal parse dari Orderkuota', raw: data });
            }
        });
    });

    request.on('error', (err) => {
        res.status(500).json({ error: err.message });
    });

    request.write(postData);
    request.end();
};
