import https from 'https';

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', 'application/json');

    let body = '';
    req.on('data', chunk => { body += chunk; });
    
    return new Promise((resolve) => {
        req.on('end', () => {
            try {
                // DATA INI HARUS PERSIS DENGAN HASIL SNIFFING TERBARU (MAX 5 MENIT LALU)
                const SIGNATURE = "7a31b1ce933c3abfd1b4180977eb42d032a2dcdef0f5ee7ee163a5b2938f470c1372b780f71165c314ff3a4f94326f91dcb9bca9e5bfde186059b6ac24861f7d";
                const TIMESTAMP = "1769240941742"; 
                
                // Urutan parameter di bawah ini HARUS SAMA PERSIS dengan log yang kamu kirim
                // Jangan ada spasi atau karakter tambahan.
                const postData = `request_time=${TIMESTAMP}&app_reg_id=cFatqTI9Qe-w5RCucj8qtI%3AAPA91bHl2OcuNjXH24L90UL3FqtiZJLOhhP0QvnVIVibCKt-Y3s97237nfvNYsv3MK1uWG7uZ9mriHOxiw3aysN8NzyelDzxGE_LREVv5IhwClwMxrfIZQw&phone_android_version=13&app_version_code=260115&phone_uuid=cFatqTI9Qe-w5RCucj8qtI&requests%5Bqris_details%5D%5Bid%5D=196598976&auth_username=kangnaum&auth_token=2449343%3ALANp7rEhloiH0d3ImSvnX8JjMgDa5eFU&app_version_name=26.01.15&ui_mode=light&phone_model=M2103K19PG`;

                const options = {
                    hostname: 'app.orderkuota.com',
                    path: '/api/v2/get',
                    method: 'POST',
                    headers: {
                        'signature': SIGNATURE,
                        'timestamp': TIMESTAMP,
                        'Content-Type': 'application/x-www-form-urlencoded',
                        'User-Agent': 'okhttp/4.12.0',
                        'Accept-Encoding': 'gzip',
                        'Connection': 'Keep-Alive',
                        'Content-Length': Buffer.byteLength(postData)
                    }
                };

                const request = https.request(options, (response) => {
                    let result = '';
                    response.on('data', chunk => { result += chunk; });
                    response.on('end', () => {
                        // Jika masih "Gunakan Jaringan Lain", artinya IP Vercel diblokir atau Signature Expired
                        res.status(200).json(JSON.parse(result || '{"error":"No Response"}'));
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
