import https from 'https';

export default async function handler(req, res) {
    // 1. Setup Headers untuk CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', 'application/json');

    // 2. Baca body yang dikirim dari api-cekpayment-orkut.js
    let body = '';
    req.on('data', chunk => { body += chunk; });
    
    return new Promise((resolve) => {
        req.on('end', () => {
            try {
                // Parse data dari buildPayload()
                const params = new URLSearchParams(body);
                const user = params.get('username') || 'kangnaum';
                const token = params.get('token') || '2449343:LANp7rEhloiH0d3ImSvnX8JjMgDa5eFU';

                // 3. Setup Data "Rahasia" (Gunakan string langsung jika belum setting Environment Variables)
                // Tips: Ganti process.env.NAMAVARIABEL dengan string aslinya jika ingin test cepat
                const signature = process.env.SIGNATURE || "5d5e6c42521b2815ae49e88dcdfa7ed29d3bfaf290d071f5d93bc1d4a6e16eaf96495660789fb1cf824b241080ccdbecf7736a02372e80c7f4000cb169741992";
                const regId = process.env.APP_REG_ID || "cFatqTI9Qe-w5RCucj8qtI:APA91bHl2OcuNjXH24L90UL3FqtiZJLOhhP0QvnVIVibCKt-Y3s97237nfvNYsv3MK1uWG7uZ9mriHOxiw3aysN8NzyelDzxGE_LREVv5IhwClwMxrfIZQw";
                const uuid = process.env.PHONE_UUID || "cFatqTI9Qe-w5RCucj8qtI";
                const timestamp = "1769237452114"; // Wajib sama dengan pasangan Signature-nya

                // 4. Susun Body Request untuk Orderkuota
                // Pakai manual string agar urutan parameter persis seperti saat kamu sniffing
                const postData = `app_reg_id=${encodeURIComponent(regId)}&phone_uuid=${encodeURIComponent(uuid)}&phone_model=M2103K19PG&requests%5Bqris_history%5D%5Bketerangan%5D=&requests%5Bqris_history%5D%5Bjumlah%5D=&request_time=${timestamp}&phone_android_version=13&app_version_code=260115&auth_username=${encodeURIComponent(user)}&requests%5Bqris_history%5D%5Bpage%5D=1&auth_token=${encodeURIComponent(token)}&app_version_name=26.01.15&ui_mode=dark&requests%5Bqris_history%5D%5Bdari_tanggal%5D=&requests%5B0%5D=account&requests%5Bqris_history%5D%5Bke_tanggal%5D=`;

                const options = {
                    hostname: 'app.orderkuota.com',
                    path: '/api/v2/qris/mutasi/2449343', // Pastikan ID ini benar
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                        'User-Agent': 'okhttp/4.12.0',
                        'signature': signature,
                        'timestamp': timestamp,
                        'Content-Length': Buffer.byteLength(postData)
                    }
                };

                // 5. Eksekusi Request ke Orkut
                const request = https.request(options, (response) => {
                    let result = '';
                    response.on('data', chunk => { result += chunk; });
                    response.on('end', () => {
                        try {
                            const jsonRes = JSON.parse(result);
                            res.status(200).json(jsonRes);
                        } catch (e) {
                            res.status(500).json({ error: "Gagal parse response Orkut", raw: result });
                        }
                        resolve();
                    });
                });

                request.on('error', (err) => {
                    res.status(500).json({ error: "Koneksi ke Orkut gagal", details: err.message });
                    resolve();
                });

                request.write(postData);
                request.end();

            } catch (err) {
                res.status(500).json({ error: "Script Error di Vercel", details: err.message });
                resolve();
            }
        });
    });
}
