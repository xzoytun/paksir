const https = require('https');

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', 'application/json');

    // 1. Tangkap data yang dikirim Bot (Username & Token)
    let body = '';
    await new Promise((resolve) => {
        req.on('data', chunk => { body += chunk; });
        req.on('end', resolve);
    });

    const params = new URLSearchParams(body);
    const userFromBot = params.get('username'); // Mengambil 'kangnaum' dari bot
    const tokenFromBot = params.get('token');    // Mengambil token panjang dari bot

    // Proteksi jika data kosong
    if (!userFromBot || !tokenFromBot) {
        return res.status(400).json({ error: 'Bot tidak mengirim username/token' });
    }

    // 2. Susun parameter untuk Orderkuota
    const bodyObj = {
        'auth_username': userFromBot,
        'auth_token': tokenFromBot,
        'requests[qris_history][page]': '1',
        'requests[0]': 'account',
        'request_time': Date.now().toString(),
        'app_version_code': '251231'
    };

    const postData = Object.keys(bodyObj)
        .map(key => encodeURIComponent(key) + '=' + encodeURIComponent(bodyObj[key]))
        .join('&');

    const options = {
        hostname: 'app.orderkuota.com',
        path: '/api/v2/qris/mutasi', // Endpoint bersih sesuai permintaanmu
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
                // Balikin hasil JSON ke bot
                res.status(200).json(JSON.parse(data));
            } catch (e) {
                res.status(500).json({ error: 'Gagal parse JSON', raw: data });
            }
        });
    });

    request.on('error', (err) => {
        res.status(500).json({ error: err.message });
    });

    request.write(postData);
    request.end();
};
