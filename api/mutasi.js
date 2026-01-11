const https = require('https');

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', 'application/json');

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Harus POST' });
    }

    const { auth_username, auth_token } = req.body;

    if (!auth_username || !auth_token) {
        return res.status(400).json({ error: 'Username/Token tidak boleh kosong' });
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

    // --- PERBAIKAN DISINI ---
    // Saya set ID account default 0 karena username/token biasanya sudah cukup 
    // untuk menarik data mutasi di beberapa versi API Orderkuota
    const options = {
        hostname: 'app.orderkuota.com',
        path: `/api/v2/qris/mutasi/0`, 
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
                const parsed = JSON.parse(data);
                res.status(response.statusCode).json(parsed);
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
