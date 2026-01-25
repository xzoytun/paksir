export default async function handler(req, res) {
  // Vercel otomatis mem-parse req.body jika Content-Type nya application/json
  if (req.method === 'POST') {
    const data = req.body;

    // Log ke dashboard Vercel buat debugging
    console.log("Mutasi masuk dari VPS:", data);

    // Contoh ambil data mutasi pertama (jika ada)
    const mutasiTerbaru = data.qris_history?.results?.[0];
    
    if (mutasiTerbaru) {
      console.log(`Ada duit masuk: Rp ${mutasiTerbaru.kredit} dari ${mutasiTerbaru.keterangan}`);
    }

    return res.status(200).json({
      status: 'success',
      message: 'Data mutasi berhasil diterima panel pakasir',
      timestamp: new Date().toLocaleString('id-ID')
    });
  } else {
    return res.status(405).json({ 
      status: 'error', 
      message: 'Cuma nerima POST bro!' 
    });
  }
}
