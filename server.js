const express = require('express');
const TelegramBot = require('node-telegram-bot-api');

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 8080;

// הטוקן של בוט התשלומים שלך
const BOT_TOKEN = '8894022992:AAG0N6K3AirxFbtVR_Ocaw_t1cn5uPIeqVE';
const bot = new TelegramBot(BOT_TOKEN, { polling: true });

// בסיס נתונים זמני בזיכרון השרת לשמירת סטטוס התשלומים
// במערכת אמיתית וגדולה מומלץ להשתמש בבסיס נתונים כמו MongoDB או Firebase
const paymentStatuses = {};

console.log('שרת ה-API של התשלומים פעיל בגוגל קלאוד...');

// =======================================================
// 1. ה-API ליצירת קישור להוראת קבע (7 כוכבים)
// =======================================================
app.post('/create-invoice', async (req, res) => {
  try {
    const { chat_id } = req.body;

    if (!chat_id) {
      return res.status(400).json({ error: 'Missing chat_id in request body' });
    }

    // לפני יצירת הקישור, נגדיר שהסטטוס הנוכחי של המשתמש הוא "בהמתנה"
    paymentStatuses[chat_id] = 'pending';

    const invoiceLink = await bot.createInvoiceLink(
      "מנוי חודשי VIP",
      "הוראת קבע מתחדשת - 7 כוכבים בכל חודש 🌟",
      `sub_user_${chat_id}`,
      "",
      "XTR",
      [{ label: "מנוי חודשי", amount: 7 }],
      { subscription_period: 2592000 }
    );

    return res.json({ success: true, invoice_link: invoiceLink });

  } catch (error) {
    console.error("שגיאה ביצירת קישור מנוי:", error);
    return res.status(500).json({ error: 'Failed to create subscription link' });
  }
});

// =======================================================
// 2. ה-API החדש עבור האתר - בדיקה האם המשתמש אישר ושילם
// =======================================================
app.get('/check-status/:chat_id', (req, res) => {
  const { chat_id } = req.params;
  
  const status = paymentStatuses[chat_id] || 'not_found';
  
  // מחזיר לאתר status: 'paid' (אם שילם) או 'pending' (אם עדיין לא שילם)
  return res.json({ success: true, status: status });
});

// =======================================================
// 3. אישור חובה מטלגרם לפני ביצוע החיוב (Pre-Checkout)
// =======================================================
bot.on('pre_checkout_query', (query) => {
  bot.answerPreCheckoutQuery(query.id, true)
    .catch((err) => console.error("שגיאה באישור טרום-תשלום:", err));
});

// =======================================================
// 4. קבלת עדכון על תשלום מוצלח - עדכון הסטטוס ל-'paid'
// =======================================================
bot.on('successful_payment', (msg) => {
  const userId = msg.chat.id;
  console.log(`🎉 הוראת קבע הופעלה עבור יוזר: ${userId}`);
  
  // ברגע שטלגרם מעדכנת שהתשלום הצליח, אנחנו משנים את הסטטוס שלו ל-'paid'
  paymentStatuses[userId] = 'paid';
});

app.get('/', (req, res) => res.send('Payment API with Status Check is running!'));
app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
