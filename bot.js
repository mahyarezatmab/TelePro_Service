const { Telegraf, Markup, session } = require('telegraf');

// توکن ربات شما
const bot = new Telegraf('8993997083:AAF2ip5VyNpPzyEDvFBM_rYmV68akPPnf6E');

// لیست آیدی‌های مجاز (مدیران ربات)
// آیدی عددی خودتان را بگذارید. بعداً برای اضافه کردن نفرات دیگر، کافی است آیدی آن‌ها را با کاما (,) اینجا اضافه کنید
const ADMIN_IDS = [
    170567510, // <-- آیدی تلگرام خودتان
    // 987654321 // <-- آیدی دوستان یا همکاران در آینده (فقط کافی است خط پایین را از حالت کامنت خارج کنید)
];

// لایه امنیتی: چک کردن اینکه آیا کاربر اجازه استفاده از ربات را دارد یا خیر
bot.use((ctx, next) => {
    const userId = ctx.from?.id;
    if (!ADMIN_IDS.includes(userId)) {
        return ctx.reply('⛔ شما اجازه دسترسی به این ربات اختصاصی را ندارید.');
    }
    return next();
});

bot.use(session());

// ذخیره موقت وضعیت مراحل سفارش هر کاربر
const userState = {};

// منوی اصلی ربات
const mainMenuMarkup = Markup.inlineKeyboard([
    [
        Markup.button.callback('👁 بازدید پست', 'cmd_views'),
        Markup.button.callback('❤ لایک و ریکشن', 'cmd_reactions')
    ],
    [
        Markup.button.callback('📸 بازدید استوری', 'cmd_story'),
        Markup.button.callback('👥 ممبر فیک کانال', 'cmd_members')
    ]
]);

bot.start((ctx) => {
    return ctx.reply(
        '👑 به پنل مدیریت اختصاصی خوش آمدید.\nلطفاً یکی از خدمات زیر را انتخاب کنید:',
        mainMenuMarkup
    );
});

// --- بخش لایک و ریکشن (گام‌به‌گام) ---
bot.action('cmd_reactions', async (ctx) => {
    await ctx.answerCbQuery();
    userState[ctx.from.id] = { step: 'waiting_for_post_link', action: 'reactions' };
    return ctx.reply('🔗 لطفاً **لینک پست** مورد نظر را ارسال کنید:');
});

// مدیریت سایر بخش‌ها (برای جلوگیری از ارور، فعلاً پیام موقت می‌گذاریم)
bot.action(['cmd_views', 'cmd_story', 'cmd_members'], async (ctx) => {
    await ctx.answerCbQuery();
    return ctx.reply('این بخش در حال توسعه است. فعلاً می‌توانید از بخش «لایک و ریکشن» استفاده کنید.', Markup.inlineKeyboard([
        [Markup.button.callback('🔙 بازگشت به منوی اصلی', 'back_to_home')]
    ]));
});

// مدیریت پیام‌های متنی بر اساس مرحله‌ی کاربر
bot.on('text', async (ctx) => {
    const userId = ctx.from.id;
    const state = userState[userId];

    if (!state) {
        return ctx.reply('لطفاً از طریق دستور /start منوی اصلی را باز کنید.', Markup.inlineKeyboard([
            [Markup.button.callback('🏠 منوی اصلی', 'back_to_home')]
        ]));
    }

    // مرحله ۱: دریافت لینک پست
    if (state.step === 'waiting_for_post_link') {
        state.postLink = ctx.message.text;
        state.step = 'waiting_for_reaction_type';
        return ctx.reply('✨ عالی. حالا **نوع ریکشن** را مشخص کنید (مثلاً ایموجی دلخواه، عادی یا پرمیوم):');
    }

    // مرحله ۲: دریافت نوع ریکشن
    if (state.step === 'waiting_for_reaction_type') {
        state.reactionType = ctx.message.text;
        state.step = 'waiting_for_count';
        return ctx.reply('🔢 **تعداد** درخواستی برای ریکشن را وارد کنید:');
    }

    // مرحله ۳: دریافت تعداد و ثبت نهایی سفارش
    if (state.step === 'waiting_for_count') {
        state.count = ctx.message.text;
        
        const summary = `✅ سفارش شما با موفقیت ثبت شد و به صف پشت صحنه رفت:\n\n` +
                        `📌 لینک: ${state.postLink}\n` +
                        `🎯 نوع ریکشن: ${state.reactionType}\n` +
                        `📊 تعداد: ${state.count}\n\n` +
                        `(به زودی این بخش به اکانت‌های پشت صحنه متصل می‌شود)`;

        // پاک کردن وضعیت کاربر پس از اتمام کار
        delete userState[userId];

        return ctx.reply(summary, Markup.inlineKeyboard([
            [Markup.button.callback('🔙 بازگشت به منوی اصلی', 'back_to_home')]
        ]));
    }
});

// دکمه بازگشت به منوی اصلی
bot.action('back_to_home', async (ctx) => {
    await ctx.answerCbQuery();
    delete userState[ctx.from.id];
    return ctx.reply('منوی اصلی:', mainMenuMarkup);
});

// راه‌اندازی ربات
bot.launch();
console.log('Advanced Private Bot is running...');

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
