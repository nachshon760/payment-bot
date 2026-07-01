const express = require('express');
const TelegramBot = require('node-telegram-bot-api');

const app = express();
app.use(express.json()); // מאפשר לשרת לקרוא מידע שנשלח מהאתר בפורמט JSON

const PORT = process.env.PORT || 8080;

// הטוקן של בוט התשלומים שלך
const BOT_TOKEN = '8894022992:AAG0N6K3AirxFbtVR_Ocaw_t1cn5uPIeqVE';

// הפעלת הבוט במצב פולינג כדי שיאשר את התשלומים מול טלגרם ברקע
const bot = new TelegramBot(BOT_TOKEN, { polling: true });

console.log('שרת ה-API של התשלומים פעיל בגוגל קלאוד...');

// =======================================================
// 1. ה-API עבור האתר שלך - יצירת קישור תשלום (Invoice Link)
// =======================================================
app.post('/create-invoice', async (req, res) => {
  try {
    // האתר שלך צריך לשלוח את ה-chat_id של המשתמש בטלגרם
    const { chat_id } = req.body;

    if (!chat_id) {
      return res.status(400).json({ error: 'Missing chat_id in request body' });
    }

    // פקודת ה-API הרשמית של טלגרם ליצירת קישור תשלום של 7 כוכבים
    const invoiceLink = await bot.createInvoiceLink(
      "גישה למוצר הדיגיטלי",       // כותרת המוצר באתר
      "רכישה חד פעמית של 7 כוכבים", // תיאור המוצר באתר
      `site_user_${chat_id}`,      // מזהה פנימי ייחודי בשבילך (Payload)
      "",                          // חייב להישאר ריק לחלוטין בכוכבים!
      "XTR",                       // המטבע הרשמי של כוכבי טלגרם
      [{ label: "מוצר", amount: 7 }] // המחיר (7 כוכבים)
    );

    // החזרת הקישור המוכן בחזרה לאתר שלך
    return res.json({ success: true, invoice_link: invoiceLink });

  } catch (error) {
    console.error("שגיאה ביצירת קישור תשלום:", error);
    return res.status(500).json({ error: 'Failed to create invoice link' });
  }
});

// =======================================================
// 2. אישור חובה מטלגרם לפני ביצוע החיוב (Pre-Checkout)
// =======================================================
bot.on('pre_checkout_query', (query) => {
  bot.answerPreCheckoutQuery(query.id, true)
    .catch((err) => console.error("שגיאה באישור טרום-תשלום:", err));
});

// =======================================================
// 3. קבלת עדכון על תשלום מוצלח
// =======================================================
bot.on('successful_payment', (msg) => {
  const userId = msg.chat.id;
  console.log(`🎉 משתמש ${userId} שילם בהצלחה 7 כוכבים דרך האתר!`);
  // כאן אתה יכול להוסיף קוד שמעדכן את בסיס הנתונים של האתר שלך
});

// בדיקת תקינות בסיסית בדפדפן
app.get('/', (req, res) => res.send('Payment API is running on Google Cloud!'));

app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
