import https from 'https';

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', 'application/json');

    return new Promise((resolve) => {
        // --- DATA DARI LOG TERBARU (WAJIB CLONE PERSIS) ---
        const SIGNATURE = "dd8dcad4e4121cb2b417a2f5b271bd4565c3f93eb6885f8f479e0b8dd80332950656f4b49b1b7b321ce72875d70eebc509c99dfa0f99c2a1e4b4d1ecd352aec9";
        const TIMESTAMP = "1769241856078";
        const USERNAME = "kangnaum";
        const TOKEN = "2449343:LANp7rEhloiH0d3ImSvnX8JjMgDa5eFU";
        const REG_ID = "cFatqTI9Qe-w5RCucj8qtI:APA91bHl2OcuNjXH24L90UL3FqtiZJLOhhP0QvnVIVibCKt-Y3s97237nfvNYsv3MK1uWG7uZ9mriHOxiw3aysN8NzyelDzxGE_LREVv5IhwClwMxrfIZQw";

        // Susun body persis log (Urutan parameter sangat krusial untuk signature)
        // Saya pakai manual string agar urutan tidak berantakan oleh URLSearchParams
        const postData = `app_reg_id=${encodeURIComponent(REG_ID)}&phone_uuid=cFatqTI9Qe-w5RCucj8qtI&requests%5Bqris_history%5D%5Bjenis%5D=debet&phone_model=M2103K19PG&requests%5Bqris_history%5D%5Bketerangan%5D=&requests%5Bqris_history%5D%5Bjumlah%5D=&request_time=${TIMESTAMP}&phone_android_version=13&app_version_code=260115&auth_username=${USERNAME}&requests%5Bqris_history%5D%5Bpage%5D=1&auth_token=${encodeURIComponent(TOKEN)}&app_version_name=26.01.15&ui_mode=dark&requests%5Bqris_history%5D%5Bdari_tanggal%5D=&requests%5B0%5D=account&requests%5Bqris_history%5D%5Bke_tanggal%5D=`;

        const options = {
            hostname: 'app.orderkuota.com',
            path: '/api/v2/qris/mutasi/2449343',
            method: 'POST',
            headers: {
                'signature': SIGNATURE,
                'timestamp': TIMESTAMP,
                'Content-Type': 'application/x-www-form-urlencoded',
                'User-Agent': 'okhttp/4.12.0',
                'Accept-Encoding': 'gzip',
                'Content-Length': Buffer.byteLength(postData),
                'Host': 'app.orderkuota.com',
                'Connection': 'Keep-Alive'
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
    });
}
