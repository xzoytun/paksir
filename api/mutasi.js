import https from 'https';

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', 'application/json');

    let body = '';
    req.on('data', chunk => { body += chunk; });
    
    return new Promise((resolve) => {
        req.on('end', () => {
            try {
                const params = new URLSearchParams(body);
                const user = params.get('username') || 'kangnaum';
                const token = params.get('token') || '2449343:LANp7rEhloiH0d3ImSvnX8JjMgDa5eFU';

                // --- DATA INI HARUS SESUAI HASIL CAPTURE TERBARU ---
                // Karena statis, ini rawan expired dalam hitungan menit/jam
                const SIGNATURE = "5d5e6c42521b2815ae49e88dcdfa7ed29d3bfaf290d071f5d93bc1d4a6e16eaf96495660789fb1cf824b241080ccdbecf7736a02372e80c7f4000cb169741992";
                const FIXED_TIMESTAMP = "1769237452114"; 
                const APP_REG_ID = "cFatqTI9Qe-w5RCucj8qtI:APA91bHl2OcuNjXH24L90UL3FqtiZJLOhhP0QvnVIVibCKt-Y3s97237nfvNYsv3MK1uWG7uZ9mriHOxiw3aysN8NzyelDzxGE_LREVv5IhwClwMxrfIZQw";
                // --------------------------------------------------

                // Susun body harus sama urutannya dengan aslinya
                const postData = `app_reg_id=${encodeURIComponent(APP_REG_ID)}&phone_uuid=cFatqTI9Qe-w5RCucj8qtI&phone_model=M2103K19PG&requests%5Bqris_history%5D%5Bketerangan%5D=&requests%5Bqris_history%5D%5Bjumlah%5D=&request_time=${FIXED_TIMESTAMP}&phone_android_version=13&app_version_code=260115&auth_username=${encodeURIComponent(user)}&requests%5Bqris_history%5D%5Bpage%5D=1&auth_token=${encodeURIComponent(token)}&app_version_name=26.01.15&ui_mode=dark&requests%5Bqris_history%5D%5Bdari_tanggal%5D=&requests%5B0%5D=account&requests%5Bqris_history%5D%5Bke_tanggal%5D=`;

                const options = {
                    hostname: 'app.orderkuota.com',
                    path: '/api/v2/qris/mutasi/2449343',
                    method: 'POST',
                    headers: {
                        'signature': SIGNATURE,
                        'timestamp': FIXED_TIMESTAMP,
                        'Content-Type': 'application/x-www-form-urlencoded',
                        'Content-Length': Buffer.byteLength(postData),
                        'User-Agent': 'okhttp/4.12.0',
                        'Accept-Encoding': 'gzip'
                    }
                };

                const request = https.request(options, (response) => {
                    let result = '';
                    response.on('data', chunk => { result += chunk; });
                    response.on('end', () => {
                        try {
                            res.status(200).json(JSON.parse(result));
                        } catch (e) {
                            res.status(500).json({ error: "Gagal parse/Signature Expired", raw: result });
                        }
                        resolve();
                    });
                });

                request.on('error', (err) => {
                    res.status(500).json({ error: err.message });
                    resolve();
                });

                request.write(postData);
                request.end();

            } catch (err) {
                res.status(500).json({ error: "Script Error" });
                resolve();
            }
        });
    });
}
