const https = require('https');
const { buildPayload, headers, API_URL } = require('./api-cekpayment-orkut');

module.exports = async (req, res) => {
    // 1. Setup CORS & Response Header
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', 'application/json');

    // 2. Validasi Method
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed. Gunakan POST.' });
    }

    // 3. Ambil Payload dari Modul
    const postData = buildPayload();
    
    // Parse URL untuk mengambil hostname dan path
    const targetUrl = new URL(API_URL);

    // 4. Konfigurasi Request
    const options = {
        hostname: targetUrl.hostname,
        path: targetUrl.pathname,
        method: 'POST',
        headers: {
            ...headers, // Mengambil headers dari modul
            'Content-Length': Buffer.byteLength(postData)
        }
    };

    // 5. Eksekusi Request HTTPS
    const request = https.request(options, (response) => {
        let data = '';
        
        response.on('data', (chunk) => { data += chunk; });
        
        response.on('end', () => {
            try {
                // Berhasil mendapatkan data dari Paksir API
                const jsonResponse = JSON.parse(data);
                res.status(response.statusCode).json(jsonResponse);
            } catch (e) {
                // Jika response bukan JSON valid
                res.status(500).json({ 
                    error: 'Gagal parse response dari upstream', 
                    raw: data 
                });
            }
        });
    });

    request.on('error', (err) => {
        res.status(500).json({ error: 'Request Error: ' + err.message });
    });

    // Kirim data payload
    request.write(postData);
    request.end();
};
