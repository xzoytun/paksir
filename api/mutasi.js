const https = require('https');

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', 'application/json');

    // Ambil data yang dikirim bot (username & token)
    let body = '';
    await new Promise((resolve) => {
        req.on('data', chunk => { body += chunk; });
        req.on('end', resolve);
    });

    const params = new URLSearchParams(body);
    const user = params.get('username'); // Ambil dari bot
    const token = params.get('token');      // Ambil dari bot

    // Jika bot lupa kirim, kasih pesan error
    if (!user || !token) {
        return res.status(400).json({ error: 'Username/Token tidak diterima' });
    }

    const account_id = '2449343'; 

    const bodyObj = {
        'auth_username': user,
        'auth_token': token,
        'requests[qris_history][page]': '1',
        'requests[0]': 'account'
    };

    const postData = Object.keys(bodyObj)
        .map(key => encodeURIComponent(key) + '=' + encodeURIComponent(bodyObj[key]))
        .join('&');

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
                res.status(200).json(JSON.parse(data));
            } catch (e) {
                res.status(500).json({ error: 'Gagal parse', raw: data });
            }
        });
    });

    request.on('error', (err) => {
        res.status(500).json({ error: err.message });
    });

    request.write(postData);
    request.end();
};
