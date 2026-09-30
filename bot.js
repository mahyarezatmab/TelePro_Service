const { Telegraf, Markup } = require('telegraf');

const TOKEN = '8993997083:AAF2ip5VyNpPzyEDvFBM_rYmV68akPPnf6E'; // توکن ربات خودتان را اینجا بگذارید
const ADMIN_ID = 170567510; // شناسه عددی (ID) تلگرام خودتان

const bot = new Telegraf(TOKEN);

// دیتابیس ساده در حافظه برای شروع
const db = {
    users: new Set(),
    likesCount: 0,
    userLikes: {}
};

// منوهای ربات
const memberKeyboard = Markup.keyboard([
    ['❤️ ثبت لایک', '📊 پروفایل من'],
    ['🔗 دریافت لینک اختصاصی ممبرگیری', '❓ راهنما']
]).resize();

const adminKeyboard = Markup.keyboard([
    ['❤️ ثبت لایک', '📊 پروفایل من'],
    ['⚙ پنل مدیریت (ممبرها و لایک‌ها)', '📊 آمار کلی ربات']
]).resize();

bot.start((ctx) => {
    const userId = ctx.from.id;
    db.users.add(userId);

    if (userId === ADMIN_ID) {
        ctx.reply('سلام ادمین عزیز! 👑 خوش آمدید.', adminKeyboard);
    } else {
        ctx.reply('سلام! به ربات مدیریت ممبر و لایک خوش آمدید:', memberKeyboard);
    }
});

bot.hears('❤️ ثبت لایک', (ctx) => {
    const userId = ctx.from.id;
    db.likesCount += 1;
    db.userLikes[userId] = (db.userLikes[userId] || 0) + 1;
    ctx.reply(`❤️ لایک شما ثبت شد!\nمجموع لایک‌های شما: ${db.userLikes[userId]}`);
});

bot.hears('📊 پروفایل من', (ctx) => {
    const userId = ctx.from.id;
    const myLikes = db.userLikes[userId] || 0;
    ctx.reply(`👤 اطلاعات حساب:\n🆔 آی‌دی: \`${userId}\`\n❤️ لایک‌ها: ${myLikes}`, { parse_mode: 'Markdown' });
});

bot.hears('🔗 دریافت لینک اختصاصی ممبرگیری', (ctx) => {
    const userId = ctx.from.id;
    ctx.reply(`🔗 لینک دعوت شما:\n\`https://t.me/YourBotName?start=${userId}\``, { parse_mode: 'Markdown' });
});

bot.hears('❓ راهنما', (ctx) => {
    ctx.reply('ℹ️ راهنمای استفاده از ربات مدیریت لایک و ممبر.');
});

bot.hears('⚙ پنل مدیریت (ممبرها و لایک‌ها)', (ctx) => {
    if (ctx.from.id !== ADMIN_ID) return ctx.reply('⚠ دسترسی ندارید!');
    ctx.reply('🛠 پنل مدیریت:', Markup.inlineKeyboard([
        [Markup.button.callback('👥 لیست ممبرها', 'admin_list_members')],
        [Markup.button.callback('🗑 ریست لایک‌ها', 'admin_reset_likes')]
    ]));
});

bot.hears('📊 آمار کلی ربات', (ctx) => {
    if (ctx.from.id !== ADMIN_ID) return;
    ctx.reply(`📊 آمار:\n👥 کل ممبرها: ${db.users.size}\n❤️ کل لایک‌ها: ${db.likesCount}`);
});

bot.action('admin_list_members', (ctx) => {
    ctx.answerCbQuery();
    ctx.reply(`👥 ممبرها:\n- ${Array.from(db.users).join('\n- ')}`);
});

bot.action('admin_reset_likes', (ctx) => {
    ctx.answerCbQuery();
    db.likesCount = 0;
    db.userLikes = {};
    ctx.reply('🔄 لایک‌ها ریست شدند!');
});

bot.on('text', (ctx) => {
    if (ctx.message.text.startsWith('/')) return;
    ctx.reply('لطفاً از دکمه‌های منو استفاده کنید.');
});

// راه‌اندازی ربات روی سرور
bot.launch().then(() => {
    console.log('✅ ربات با موفقیت روی سرور روشن شد!');
}).catch((err) => {
    console.error('❌ خطا در راه‌اندازی:', err.message);
});

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));