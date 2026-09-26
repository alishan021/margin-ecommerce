const express = require('express');
const config = require('dotenv').config({ path: './.env' });
const bodyParser = require('body-parser');
const morgan = require('morgan');
const session = require('express-session');
const cors = require('cors');
const nocache = require("nocache");
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db.js');
const productModel = require('./models/products.js');
const { completeHandler } = require('./middlewares/completeHandler');

const app = express();

app.set('view engine', 'ejs');
app.set('views', ['./views/admin', './views/user']);
app.locals.productImageUrl = (image) => {
  if (!image) return '';
  return /^https?:\/\//i.test(image) ? image : `/products/${encodeURIComponent(image)}`;
};

app.use(morgan('dev'));

app.post('/payments/razorpay/wallet-webhook', express.raw({ type: 'application/json' }), completeHandler(require('./controllers/userControllerrr').razorpayWalletWebhook));

app.use(cors());
app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(nocache());

// Ensure DB is connected before any route runs (cold start safe, warm-start cheap)
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    console.error('DB connection failed:', err);
    res.status(500).json({ error: 'Database connection failed' });
  }
});

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
}));
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: false }));

app.use('/', require('./routes/userRoute.js'));
app.use('/admin', require('./routes/adminRoute.js'));

app.get('*', (req, res) => {
  res.status(404).render('404.ejs', { userIn: req.session.userIn });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  if (res.headersSent) return next(err);
  res.status(500).render('500.ejs', { userIn: req.session.userIn });
});

// Only start a real server when this file is run directly (local dev / your own VM).
// Vercel instead does `require('./index.js')` and calls the exported app per-request,
// so this block never executes there — no port, no listener, no conflict.
if (require.main === module) {
  const PORT = process.env.PORT || 6000;
  app.listen(PORT, () => console.log(`app is running on port http://localhost:${PORT}`));
}

module.exports = app;