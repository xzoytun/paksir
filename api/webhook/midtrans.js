// api/webhook/midtrans.js
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';
import crypto from 'crypto';
import axios from 'axios';

// Konfigurasi Database (Sesuaikan path file .db kamu di VPS jika perlu)
const DB_PATH = path.resolve(process.cwd(), 'sellvpn.db');

export default async function handler(req, res) {
  // Hanya terima method POST dari Midtrans
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  const notification = req.body;

  if (!notification || !notification.order_id) {
    return res.status(400).json({ success: false, message: 'Invalid payload structure' });
  }

  const { order_id, transaction_status, fraud_status, gross_amount, payment_type } = notification;
  const amount = Number(gross_amount || 0);

  try {
    // Buka koneksi ke SQLite
    const db = await open({
      filename: DB_PATH,
      driver: sqlite3.Database
    });

    // 1. Ambil data pending deposit berdasarkan order_id
    const pendingDepo = await db.get(
      `SELECT * FROM pending_deposits_pakasir WHERE order_id = ? AND status = 'pending'`,
      [order_id]
    );

    if (!pendingDepo) {
      await db.close();
      return res.status(200).json({ success: true, message: 'Transaction already processed or not found' });
    }

    const userId = pendingDepo.user_id;

    // 2. Evaluasi Status Midtrans
    let isSuccess = false;
    if (transaction_status === 'capture') {
      if (fraud_status === 'accept') isSuccess = true;
    } else if (transaction_status === 'settlement') {
      isSuccess = true;
    } else if (transaction_status === 'cancel' || transaction_status === 'deny' || transaction_status === 'expire') {
      await db.run(`UPDATE pending_deposits_pakasir SET status = 'expired' WHERE order_id = ?`, [order_id]);
      await db.close();
      return res.status(200).json({ success: true, message: 'Transaction failed/expired' });
    }

    if (!isSuccess) {
      await db.close();
      return res.status(200).json({ success: true, message: 'Status pending or unhandled' });
    }

    // 3. Eksekusi Penambahan Saldo (Sinkron dengan app.js)
    let saldoBaru = 0;
    let usernameLog = String(userId);
    let isWebUser = false;
    let webUserData = null;

    // Cek apakah user berasal dari web_users atau Telegram users
    webUserData = await db.get(`SELECT * FROM web_users WHERE id = ?`, [userId]);

    if (webUserData) {
      isWebUser = true;
      await db.run(`UPDATE web_users SET balance = balance + ? WHERE id = ?`, [amount, userId]);
      const updatedWeb = await db.get(`SELECT balance, username, email FROM web_users WHERE id = ?`, [userId]);
      saldoBaru = Number(updatedWeb?.balance || 0);
      usernameLog = updatedWeb?.username || updatedWeb?.email || `WEB-${userId}`;
    } else {
      await db.run(`UPDATE users SET saldo = saldo + ? WHERE user_id = ?`, [amount, userId]);
      
      // Auto-extend reseller jika memenuhi syarat
      if (amount >= 20000) {
        await db.run(
          `UPDATE users SET warned_h7 = 0, warned_h3 = 0, reseller_since = datetime('now') WHERE user_id = ? AND saldo >= 30000 AND role = 'reseller'`,
          [userId]
        ).catch(() => {});
      }

      const updatedUser = await db.get(`SELECT saldo, username, first_name FROM users WHERE user_id = ?`, [userId]);
      saldoBaru = Number(updatedUser?.saldo || 0);
      usernameLog = updatedUser?.username || updatedUser?.first_name || String(userId);
    }

    // Update status pending deposit & catat ke topup_log
    await db.run(`UPDATE pending_deposits_pakasir SET status = 'completed' WHERE order_id = ?`, [order_id]);
    await db.run(
      `INSERT INTO topup_log (user_id, username, amount, reference, metode, created_at) VALUES (?, ?, ?, ?, ?, datetime('now'))`,
      [userId, usernameLog, amount, order_id, `Midtrans (${payment_type || 'QRIS/VA'})`]
    );

    await db.close();

    // 4. Kirim Notifikasi via Telegram Bot API (Opsional tapi direkomendasikan agar konsisten)
    const BOT_TOKEN = process.env.BOT_TOKEN; // Pastikan env bot token terpasang di Vercel
    const GROUP_ID = process.env.GROUP_ID;   // Pastikan group id terpasang di Vercel

    if (BOT_TOKEN) {
      const timestamp = new Date().toLocaleString('id-ID', {
        timeZone: 'Asia/Jakarta',
        day: '2-digit', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit', hour12: false
      }).replace(/\./g, ':');

      // Notif ke User (Jika bukan user web)
      if (!isWebUser) {
        const userMsg = 
          `<b>✅ TOP UP SALDO BERHASIL (MIDTRANS)</b>\n\n` +
          `📄 <b>Invoice:</b> <code>${order_id}</code>\n` +
          `💰 <b>Jumlah:</b> Rp ${amount.toLocaleString('id-ID')}\n` +
          `🏧 <b>Metode:</b> Midtrans (${payment_type})\n` +
          `💳 <b>Saldo Baru:</b> Rp ${saldoBaru.toLocaleString('id-ID')}\n\n` +
          `Terima kasih telah menggunakan layanan kami.`;

        await axios.post(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
          chat_id: userId,
          text: userMsg,
          parse_mode: 'HTML'
        }).catch(() => {});
      }

      // Notif ke Grup Utama (Menyesuaikan fungsi mask di app.js secara manual di endpoint)
      if (GROUP_ID) {
        let groupMsg = '';
        if (isWebUser) {
          const maskedEmail = webUserData?.email ? webUserData.email.slice(0, 2) + '***@' + webUserData.email.split('@')[1] : 'user@web.com';
          groupMsg = `
━━━━━━━━━━━━━━━━━━━━━
<b>💳 DEPOSIT SUCCESS (WEB)</b>
━━━━━━━━━━━━━━━━━━━━━
<blockquote>💵 <b>Nominal :</b> Rp ${amount.toLocaleString('id-ID')}
🏧 <b>Metode :</b> Midtrans (${payment_type})
💰 <b>Saldo :</b> Rp ${saldoBaru.toLocaleString('id-ID')}
📋 <b>Ref ID :</b> <code>${order_id}</code></blockquote>
━━━━━━━━━━━━━━━━━━━━━
📧 <b>Email :</b> <code>${maskedEmail}</code>
🕒 <b>Waktu :</b> <code>${timestamp} WIB</code>`.trim();
        } else {
          groupMsg = `
━━━━━━━━━━━━━━━━━━━━━
<b>💳 DEPOSIT SUCCESS (MIDTRANS)</b>
━━━━━━━━━━━━━━━━━━━━━
<blockquote>💵 <b>Nominal :</b> Rp ${amount.toLocaleString('id-ID')}
🏧 <b>Metode :</b> Midtrans (${payment_type})
💰 <b>Saldo :</b> Rp ${saldoBaru.toLocaleString('id-ID')}
📋 <b>Ref ID :</b> <code>${order_id}</code></blockquote>
━━━━━━━━━━━━━━━━━━━━━
👤 <b>User  :</b> ${usernameLog}
🆔 <b>ID    :</b> <code>${userId}</code>
🕒 <b>Waktu :</b> <code>${timestamp} WIB</code>`.trim();
        }

        await axios.post(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
          chat_id: GROUP_ID,
          text: groupMsg,
          parse_mode: 'HTML'
        }).catch(() => {});
      }
    }

    return res.status(200).json({ success: true, message: 'Webhook processed successfully' });

  } catch (error) {
    console.error('Midtrans Webhook Error:', error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
}
