const https = require('https');

module.exports = async (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    if (req.method !== 'POST') return res.status(405).json({ error: 'Harus POST' });

    let body = '';
    await new Promise(resolve => {
        req.on('data', chunk => { body += chunk; });
        req.on('end', resolve);
    });

    const params = new URLSearchParams(body);
    const user = params.get('username');
    const token = params.get('token');

    // Pakai endpoint mutasi QRIS tanpa ID di ujungnya agar semua transaksi terbaca
    const postData = `auth_username=${encodeURIComponent(user)}&auth_token=${encodeURIComponent(token)}&requests[qris_history][page]=1&requests[0]=account`;

    const options = {
        hostname: 'app.orderkuota.com',
        path: `/api/v2/qris/mutasi`, // KUNCI: Hapus angka ID di sini agar QRIS bisa di-scan umum
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': Buffer.byteLength(postData),
            'User-Agent': 'okhttp/4.12.0'
        }
    };

    const request = https.request(options, (response) => {
        let result = '';
        response.on('data', chunk => { result += chunk; });
        response.on('end', () => {
            try { res.status(200).json(JSON.parse(result)); } 
            catch (e) { res.status(500).json({ error: 'Gagal parse', raw: result }); }
        });
    });
    request.on('error', (err) => res.status(500).json({ error: err.message }));
    request.write(postData);
    request.end();
};
