const express = require('express');
const TelegramBot = require('node-telegram-bot-api');

const app = express();
const PORT = process.env.PORT || 8080; // גוגל קלאוד דורשת פורט 8080

const BOT_TOKEN = '8894022992:AAG0N6K3AirxFbtVR_Ocaw_t1cn5uPIeqVE';
const bot = new TelegramBot(BOT_TOKEN, { polling: true });

console.log('הבוט @paymentngbot פעיל ומקשיב בגוגל קלאוד...');

bot.onText(/\/start/, (msg) => {
  bot.sendMessage(msg.chat.id, "ברוך הבא! לחץ למטה לרכישת המוצר ב-7 כוכבים 🌟", {
    reply_markup: {
      inline_keyboard: [[{ text: "💳 קנה ב-7 כוכבים", callback_data: "buy_stars" }]]
    }
  });
});

bot.on('callback_query', async (callbackQuery) => {
  const chatId = callbackQuery.message.chat.id;
  if (callbackQuery.data === 'buy_stars') {
    bot.answerCallbackQuery(callbackQuery.id);
    try {
      await bot.sendInvoice(
        chatId,
        "גישה למוצר הדיגיטלי", 
        "רכישה חד פעמית של 7 כוכבים", 
        "payload_id_123", 
        "", 
        "XTR", 
        [{ label: "מוצר", amount: 7 }]
      );
    } catch (e) {
      bot.sendMessage(chatId, "תקלה ביצירת התשלום.");
    }
  }
});

bot.on('pre_checkout_query', (query) => {
  bot.answerPreCheckoutQuery(query.id, true);
});

bot.on('successful_payment', (msg) => {
  bot.sendMessage(msg.chat.id, `🎉 התשלום של 7 כוכבים עבר בהצלחה! קיבלת גישה.`);
});

app.get('/', (req, res) => res.send('Bot is active on Google Cloud!'));
app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
