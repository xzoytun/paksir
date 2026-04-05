export default {
  async fetch(request, env) {
    if (request.method !== "POST") {
      return new Response("API QRIS Bridge Active", { status: 200 });
    }

    try {
      // 1. Ambil data yang dikirim dari terminal/bot (username & token)
      const formData = await request.formData();
      const user = formData.get('username'); // Sesuai buildPayload bot-mu
      const token = formData.get('token');    // Sesuai buildPayload bot-mu
      const jenis = formData.get('jenis') || 'masuk';

      // Ekstrak ID dari token (misal: 2449343:LANp... diambil 2449343-nya)
      const userId = token.split(':')[0];

      // 2. Tembak ke API OrderKuota menggunakan data dari bot
      const targetUrl = `https://app.orderkuota.com/api/v2/qris/mutasi/${userId}`;

      const response = await fetch(targetUrl, {
        method: "POST",
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': 'okhttp/4.12.0',
          'Accept': 'application/json',
          'X-Requested-With': 'com.orderkuota.app'
        },
        body: new URLSearchParams({
          'auth_username': user,
          'auth_token': token,
          'requests[qris_history][page]': '1',
          'requests[qris_history][dari_tanggal]': '',
          'requests[qris_history][ke_tanggal]': '',
          'requests[qris_history][keterangan]': '',
          'requests[qris_history][jumlah]': '',
          'jenis': jenis
        })
      });

      const result = await response.json();

      // 3. Mapping data biar outputnya cakep
      if (result.responses && result.responses.qris_history) {
        const history = result.responses.qris_history.data || [];
        let output = `📤 Output: ${history.length} Transaksi (filter: ${jenis})\n`;

        history.forEach((item, index) => {
          const nominal = Number(item.amount).toLocaleString('id-ID');
          output += `[#${index + 1}]\n`;
          output += `Tanggal    : ${item.created_at}\n`;
          output += `Status     : IN\n`;
          output += `Kredit     : ${nominal}\n`;
          output += `Keterangan : ${item.note || '-'}\n`;
          output += `Brand      : ${item.issuer || 'QRIS'}\n`;
          output += `------------------------\n`;
        });

        return new Response(output || "Belum ada transaksi.", {
          headers: { "content-type": "text/plain; charset=utf-8" }
        });
      } else {
        return new Response(`❌ Gagal: ${result.message || "Data tidak ditemukan"}`, { status: 400 });
      }

    } catch (err) {
      return new Response("Error: " + err.message, { status: 500 });
    }
  }
};
