
const express = require('express');
const config = require('dotenv').config({path: './.env'})
const bodyParser = require('body-parser');
const morgan = require('morgan');
const session = require('express-session');
const cors = require('cors');
const nocache = require("nocache");
const cookieParser = require('cookie-parser');
const Razorpay = require('razorpay');
const productModel = require('./models/products.js');


const app = express();

app.set('view engine', 'ejs');
app.set('views', ['./views/admin', './views/user' ]);
app.locals.productImageUrl = (image) => {
    if (!image) return '';
    return /^https?:\/\//i.test(image) ? image : `/products/${encodeURIComponent(image)}`;
};


app.use(morgan('dev'))
// Razorpay signs the exact raw body. This must run before express.json().
app.post('/payments/razorpay/wallet-webhook', express.raw({ type: 'application/json' }), require('./controllers/userControllerrr').razorpayWalletWebhook);
app.use(cors());
app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(nocache());
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true
}));
app.use(cookieParser());
// app.use(express.bodyPaser());
app.use(bodyParser.urlencoded({ extended: false }))


var instance = new Razorpay({
    key_id: process.env.RAZORPAY_KEYID,
    key_secret: process.env.RAZORPAY_KEYSECRET,
});



app.use('/', require('./routes/userRoute.js') );
app.use('/admin', require('./routes/adminRoute.js'));



// 404 Not Found handler
app.get('*', (req, res, next) => {
    console.log('response : ' + res );
    res.status(404).render('404.ejs', { userIn: req.session.userIn })
});

  // 500 Internal Server Error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).render('500.ejs', { userIn: req.session.userIn });
});
  


module.exports = app;
