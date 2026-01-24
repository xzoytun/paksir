import https from 'https';

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', 'application/json');

    // Ambil data body yang dikirim bot (dari buildPayload)
    let body = '';
    req.on('data', chunk => { body += chunk; });
    
    return new Promise((resolve) => {
        req.on('end', () => {
            try {
                const params = new URLSearchParams(body);
                // Ini ngambil 'kangnaum' & 'token' yang dikirim bot kamu
                const user = params.get('username');
                const token = params.get('token');

                if (!user || !token) {
                    res.status(400).json({ error: "Username atau Token tidak dikirim dari bot" });
                    return resolve();
                }

                // Data rahasia diambil dari Environment Variables Vercel
                const signature = process.env.SIGNATURE;
                const regId = process.env.APP_REG_ID;
                const uuid = process.env.PHONE_UUID;
                const timestamp = "1769237452114"; // Pakai timestamp yang pas pasangannya sama signature

                const postData = new URLSearchParams({
                    'app_reg_id': regId,
                    'phone_uuid': uuid,
                    'phone_model': 'M2103K19PG',
                    'auth_username': user,
                    'auth_token': token,
                    'request_time': timestamp,
                    'app_version_code': '260115',
                    'requests[qris_history][page]': '1',
                    'requests[0]': 'account'
                }).toString();

                const options = {
                    hostname: 'app.orderkuota.com',
                    path: '/api/v2/qris/mutasi/2449343',
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                        'User-Agent': 'okhttp/4.12.0',
                        'signature': signature,
                        'timestamp': timestamp
                    }
                };

                const request = https.request(options, (response) => {
                    let result = '';
                    response.on('data', chunk => { result += chunk; });
                    response.on('end', () => {
                        try {
                            const orkutRes = JSON.parse(result);
                            // Kalau orkut nolak (Jaringan lain), kita kasih tau bot
                            if (orkutRes.success === false) {
                                res.status(403).json({ error: "Ditolak Orkut", msg: orkutRes.message });
                            } else {
                                res.status(200).json(orkutRes);
                            }
                        } catch (e) {
                            res.status(500).json({ error: "Gagal parse JSON dari Orkut", raw: result });
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
                res.status(500).json({ error: "Script Error", details: err.message });
                resolve();
            }
        });
    });
}
