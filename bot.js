const { Telegraf, Markup } = require('telegraf');

// توکن ربات شما
const bot = new Telegraf('8993997083:AAF2ip5VyNpPzyEDvFBM_rYmV68akPPnf6E');

// منوی اصلی با دکمه‌های شیشه‌ای
bot.start((ctx) => {
    ctx.reply(
        'سلام مالک عزیز! 🤖\nبه پنل مدیریت اختصاصی خوش آمدید. لطفاً گزینه مورد نظر خود را انتخاب کنید:',
        Markup.inlineKeyboard([
            [
                Markup.button.callback('👁 بازدید پست', 'menu_post_views'),
                Markup.button.callback('❤️️ لایک و ریکشن', 'menu_reactions')
            ],
            [
                Markup.button.callback('📸 بازدید استوری', 'menu_story_views'),
                Markup.button.callback('👥 ممبر فیک کانال', 'menu_fake_members')
            ],
            [
                Markup.button.callback('⚙️ مدیریت اکانت‌های پشت صحنه', 'menu_accounts')
            ]
        ])
    );
});

// مدیریت کلیک روی دکمه‌های شیشه‌ای
bot.action('menu_post_views', async (ctx) => {
    await ctx.answerCbQuery();
    return ctx.reply('لینک پست مورد نظر را برای افزایش بازدید بفرستید: (این بخش بعداً به پشت صحنه وصل می‌شود)');
});

bot.action('menu_reactions', async (ctx) => {
    await ctx.answerCbQuery();
    return ctx.reply('لطفاً لینک پست و نوع ریکشن را مشخص کنید:');
});

bot.action('menu_story_views', async (ctx) => {
    await ctx.answerCbQuery();
    return ctx.reply('لینک استوری مورد نظر را ارسال کنید:');
});

bot.action('menu_fake_members', async (ctx) => {
    await ctx.answerCbQuery();
    return ctx.reply('یوزرنیم کانال و تعداد ممبر درخواستی را وارد کنید:');
});

bot.action('menu_accounts', async (ctx) => {
    await ctx.answerCbQuery();
    return ctx.reply('وضعیت اکانت‌های مجازی متصل در پشت صحنه: (به زودی)');
});

// راه‌اندازی ربات
bot.launch();
console.log('Bot is running...');

// بستن امن ربات
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
