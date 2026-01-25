// Contoh untuk Next.js / Vercel Functions
export default async function handler(req, res) {
  if (req.method === 'POST') {
    const dataMutasi = req.body;
    console.log("Mutasi masuk:", dataMutasi);
    
    // Logika buat cek apakah transaksi sudah diproses atau belum
    // Misal: simpan ID mutasi ke database
    
    return res.status(200).json({ status: 'success' });
  }
  res.status(405).json({ message: 'Harus POST bro' });
}
