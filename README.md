# 🤖 Telegram Bot (Node.js + Telegraf)

Bot Telegram minimal siap deploy ke **Sevalla** menggunakan **GitHub integration**.

---

## 🚀 Langkah Setup

### 1️⃣ Klon / Upload ke GitHub
1. Buat repo di GitHub (contoh: `telegram-bot`)
2. Upload semua fail ini:
   - `.gitignore`
   - `package.json`
   - `index.js`
   - `README.md`
3. Commit & push ke branch `main`

---

### 2️⃣ Tambah BOT_TOKEN
Bot membaca token dari environment variable `BOT_TOKEN`.

Di **Sevalla**:
- Pergi ke **Application Settings → Environment Variables**
- Tambah:
