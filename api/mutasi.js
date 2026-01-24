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
                // Mengambil username & token yang dikirim bot kamu
                const user = params.get('username') || 'kangnaum';
                const token = params.get('token') || '2449343:LANp7rEhloiH0d3ImSvnX8JjMgDa5eFU';

                // Payload lengkap sesuai hasil sniff agar tidak ditolak Orkut
                const postData = new URLSearchParams({
                    'app_reg_id': 'cFatqTI9Qe-w5RCucj8qtI:APA91bHl2OcuNjXH24L90UL3FqtiZJLOhhP0QvnVIVibCKt-Y3s97237nfvNYsv3MK1uWG7uZ9mriHOxiw3aysN8NzyelDzxGE_LREVv5IhwClwMxrfIZQw',
                    'phone_uuid': 'cFatqTI9Qe-w5RCucj8qtI',
                    'phone_model': 'M2103K19PG',
                    'auth_username': user,
                    'auth_token': token,
                    'request_time': Date.now().toString(),
                    'app_version_code': '260115',
                    'requests[qris_history][page]': '1',
                    'requests[0]': 'account'
                }).toString();

                const options = {
                    hostname: 'app.orderkuota.com',
                    path: '/api/v2/qris/mutasi/2449343', // Pastikan path v2
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                        'User-Agent': 'okhttp/4.12.0',
                        // SIGNATURE DARI HASIL SNIFF (Ini kuncinya!)
                        'signature': '5d5e6c42521b2815ae49e88dcdfa7ed29d3bfaf290d071f5d93bc1d4a6e16eaf96495660789fb1cf824b241080ccdbecf7736a02372e80c7f4000cb169741992',
                        'timestamp': Date.now().toString()
                    }
                };

                const request = https.request(options, (response) => {
                    let result = '';
                    response.on('data', chunk => { result += chunk; });
                    response.on('end', () => {
                        try {
                            const jsonRes = JSON.parse(result);
                            res.status(200).json(jsonRes);
                        } catch (e) {
                            res.status(500).json({ error: "Gagal parse Orkut", raw: result });
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
