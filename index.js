require('dotenv').config();
const { Telegraf, Markup } = require('telegraf');
const { Low, JSONFile } = require('lowdb');
const { nanoid } = require('nanoid');
const path = require('path');


// === Configuration ===
const BOT_TOKEN = process.env.BOT_TOKEN;
const ADMIN_USERNAMES = (process.env.ADMIN_USERNAMES || '').split(',').map(s => s.trim().toLowerCase());
const RATE_NUM = parseFloat(process.env.RATE_NUMERATOR || '0.98');
const RATE_DEN = parseFloat(process.env.RATE_DENOMINATOR || '200');
const MIN_STARS = parseInt(process.env.MIN_STARS || '250', 10);
const MAX_STARS = parseInt(process.env.MAX_STARS || '50000', 10);


if (!BOT_TOKEN) {
console.error('❌ BOT_TOKEN missing in .env file.');
process.exit(1);
}


const bot = new Telegraf(BOT_TOKEN);


// === Database (LowDB) ===
const file = path.join(__dirname, 'db.json');
const adapter = new JSONFile(file);
const db = new Low(adapter);


(async () => {
await db.read();
db.data = db.data || { sales: [] };
await db.write();
})();


// === Helpers ===
function isAdmin(ctx) {
const username = ctx.from?.username?.toLowerCase();
return ADMIN_USERNAMES.includes(username);
}


function starsToUSDT(stars) {
return (stars * RATE_NUM) / RATE_DEN;
}


// === Start Command ===
bot.start(async ctx => {
const text = `Welcome to *Stars2USDT Bot*!\n\nYou can sell your Telegram Stars for USDT or TON.\n\n💫 *Conversion Rules:*\n• Minimum: ${MIN_STARS} Stars\n• Maximum: ${MAX_STARS} Stars\n• Rate: ${RATE_DEN} Stars = ${RATE_NUM} USDT\n\nPress the button below to begin.`;
await ctx.replyWithMarkdown(text, Markup.inlineKeyboard([
[Markup.button.callback('💫 Sell Stars', 'SELL_STARS')]
]));
});


// === Sell Stars Flow ===
bot.action('SELL_STARS', async ctx => {
await ctx.reply('Please enter the amount of Stars you want to sell (between 250 and 50,000):');
ctx.session = ctx.session || {};
ctx.session.awaitingAmount = true;
});


bot.on('text', async ctx => {
if (!ctx.session?.awaitingAmount) return;
const stars = parseInt(ctx.message.text.trim(), 10);
if (isNaN(stars)) return ctx.reply('❌ Please enter a valid number.');


if (stars < MIN_STARS) return ctx.reply(`❌ Minimum is ${MIN_STARS} Stars.`);
if (stars > MAX_STARS) return ctx.reply(`❌ Maximum is ${MAX_STARS} Stars.`);


const usdt = starsToUSDT(stars).toFixed(2);
const saleId = nanoid(6);


db.data.sales.push({ id: saleId, user: ctx.from.username, stars, usdt, status: 'pending' });
await db.write();


ctx.session.awaitingAmount = false;


await ctx.reply(`You are selling *${stars} Stars* for *${usdt} USDT* at the rate of 200 = 0.98 USDT.\n\nPress the button below to pay with Stars.`, {
parse_mode: 'Markdown',
...Markup.inlineKeyboard([
[Markup.button.callback('💫 Pay with Stars', `PAY_${saleId}`)]
])
});
});


bot.action(/PAY_(.+)/, async ctx => {
process.once('SIGTERM', () => bot.stop('SIGTERM'));
