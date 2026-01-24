import https from 'https';

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', 'application/json');

    // Baca data body dari request
    let body = '';
    req.on('data', chunk => { body += chunk; });
    
    return new Promise((resolve) => {
        req.on('end', () => {
            try {
                const params = new URLSearchParams(body);
                const user = params.get('username') || 'kangnaum';
                const token = params.get('token') || '2449343:LANp7rEhloiH0d3ImSvnX8JjMgDa5eFU';

                const postData = `auth_username=${encodeURIComponent(user)}&auth_token=${encodeURIComponent(token)}&requests[qris_history][page]=1&requests[0]=account&request_time=${Date.now()}`;

                const options = {
                    hostname: 'app.orderkuota.com',
                    path: '/api/v2/qris/mutasi/2449343',
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
                        try {
                            res.status(200).json(JSON.parse(result));
                        } catch (e) {
                            res.status(500).json({ error: "Gagal parse JSON", raw: result });
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
