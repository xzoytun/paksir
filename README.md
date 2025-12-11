# Pakasir Payment Gateway

Repo ini berisi API sederhana untuk menghubungkan website dengan sistem pembayaran Pakasir.

## Fitur
- Membuat invoice pembayaran
- Menerima webhook callback dari Pakasir
- Mengecek status pembayaran
- Siap deploy di Vercel atau Node.js

## Endpoint

1. POST /api/create  
   Membuat transaksi.
   Body:
   {
     "email": "user@gmail.com",
     "amount": 15000,
     "description": "Pembelian Layanan"
   }

2. POST /api/pakasir  
   Webhook callback untuk menerima status pembayaran dari Pakasir.

3. GET /api/status?id=INVOICE_ID  
   Mengecek status invoice.

## Environment (.env)
PAKASIR_API_KEY=your_api_key  
PAKASIR_SECRET=your_secret  
PANEL_AUTH_KEY=your_panel_key  

## Deploy
- Import repo ke Vercel
- Masukkan variabel .env
- Deploy

## Kontak
Telegram: @menyemenye
