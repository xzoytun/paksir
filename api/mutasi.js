const https = require('https');

module.exports = async (req, res) => {
    // Agar bisa dipanggil dari VPS manapun
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', 'application/json');

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Harus POST' });
    }

    const { account_id, auth_username, auth_token } = req.body;

    // Body data untuk Orderkuota
    const postData = `auth_username=${encodeURIComponent(auth_username)}&auth_token=${encodeURIComponent(auth_token)}`;

    const options = {
        hostname: 'app.orderkuota.com',
        path: `/api/v2/qris/mutasi/${account_id}`,
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
                res.status(response.statusCode).json(JSON.parse(data));
            } catch (e) {
                res.status(500).json({ error: 'Gagal parse JSON dari Orderkuota', raw: data });
            }
        });
    });

    request.on('error', (err) => {
        res.status(500).json({ error: err.message });
    });

    request.write(postData);
    request.end();
};
