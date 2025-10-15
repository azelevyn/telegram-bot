require("dotenv").config();
const { Telegraf } = require("telegraf");

// --- Load Bot Token ---
const BOT_TOKEN = process.env.BOT_TOKEN;
if (!BOT_TOKEN) {
  console.error("❌ Error: BOT_TOKEN not found in environment variables!");
  process.exit(1);
}

const bot = new Telegraf(BOT_TOKEN);

// --- Basic Commands ---
bot.start((ctx) => {
  ctx.reply(`👋 Hai ${ctx.from.first_name || 'pengguna'}! 
Saya bot Telegram yang sedang aktif di Sevalla 🚀

Perintah tersedia:
/start - Mula interaksi
/help - Lihat bantuan
/ping - Uji sambungan
`);
});

bot.help((ctx) =>
  ctx.reply("🤖 Arahan tersedia: /start, /help, /ping")
);

bot.command("ping", (ctx) => ctx.reply("🏓 Pong! Bot aktif!"));

// --- Launch Bot (Long Polling) ---
bot.launch().then(() => {
  console.log("✅ Bot telah dijalankan di Sevalla...");
});

// --- Graceful Stop (jika server dimatikan) ---
process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
