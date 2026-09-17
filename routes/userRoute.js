
const express = require('express');
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
// const userController = require('../controllers/userController')
const userController = require('../controllers/userControllerrr')
const userAuth = require('../middlewares/authUser');
const otpModel = require('../models/db-otp');
const userModel = require('../models/user');
// const { render } = require('ejs');
const productModel = require('../models/products');
const orderModel = require('../models/order');

const router = express.Router();



// Home 
router.get('/', userController.userHomeGet );

// Signup page
router.get('/signup', userAuth.userSessionYes, userController.userSignupGet );
router.post('/signup', userController.validateSignupBody );
router.get('/signup/otp', userController.sendOtp, userController.signupOtpGet );
router.post('/signup/otp/validate', userController.signupOtpPost );
router.get('/post-user', userController.userSignupPost );
router.get('/check-referal/:referalCode', userController.checkReferalcode );

// Login
router.get('/login', userAuth.userSessionYes ,userController.loginGet );
router.post('/login', userController.loginPost );
router.get('/login/forgot-password', userController.forgotPasswordGet );
router.post('/login/forgot-password', userController.loginForgotPasswordOtp, userController.sendOtp, userController.successMessage );
router.get('/resend-otp', userController.sendOtp );
router.post('/login/validate-otp', userController.validateOtpPost );
router.get('/login/new-password', userController.newPasswordGet );
router.post('/login/new-password', userController.newPasswordPost );

router.get('/logout', userController.userLogout );

router.get('/product-list/:search', userController.productListGet );
router.get('/product-list', userController.productListGet );
router.get('/product-list/:sortBy', userController.productListGetSortBy );
router.get('/filter', userController.sortFilterGet );

router.get('/product/:productId', userController.productGet );
router.patch('/product/cart/:productId/:quantity', userController.productCartPatch );


// User profile
router.get('/dashboard', userAuth.userSessionNo, userController.dashboardGet );
router.patch('/dashboard/user-details', userAuth.userSessionNo, userController.DashboardUserDetailsPatch );
router.patch('/address/:userId', userController.addAddressPatch );
router.delete('/address/:addressId', userController.deleteAddress );
router.get('/address/edit/:addressId', userController.addressEditGet );
router.patch('/address/update/:addressId/:userId', userController.addressUpdatePatch );
router.post('/wallet/top-ups', userAuth.userSessionNo, userController.createWalletTopUp);
router.get('/order/invoice/:orderId', userAuth.userSessionNo, userController.genInvoice );


// User Cart
router.get('/cart', userAuth.userSessionNo, userController.cartGet );
router.patch('/cart/:productId', userController.cartPatch );
router.patch('/cart/product/:userId/:productId/:nums', userController.cartCountPatch );
router.patch('/cart/delete/:productId', userController.cartProductDelete );
router.get('/address/preffered/:addressId', userController.preferredAddressGet );




// User wishlist
router.get('/wishlist', userAuth.userSessionNo, userController.wishlistGet );
router.post('/wishlist/:productId', userController.wishlistPost );
router.delete('/wishlist/remove/:productId', userController.wishlistDelete );


// User checkout
router.get('/checkout', userAuth.userSessionNo, userController.checkoutGet );
router.post('/checkout/:userId', userAuth.userSessionNo, userController.checkoutPost );
router.post('/checkout-error/:userId', userAuth.userSessionNo, userController.checkoutErrorPost );
router.get('/checkout-validation', userController.validateCheckoutAddress );
router.get('/coupon/check/:couponCode/:productTotal', userController.couponCheck );
router.get('/remove-coupon/:couponCode', userController.removeCoupon );
router.get('/failed-payment', userAuth.userSessionNo, userController.failedPayment );


router.get('/order/:orderId', userController.orderSingleGet );
router.patch('/order/cancel/:orderId/:productId', userController.orderCancellationPath );
router.patch('/order/return/:orderId/:productId', userController.orderReturnPatch );
// router.post('/order-details/checkout', userController.orderFromOrderDetails );
router.post('/payment-pending', userAuth.userSessionNo, userController.paymentPendingPost )



const Razorpay = require('razorpay');
var instance = new Razorpay({ key_id: process.env.RAZORPAY_KEYID, key_secret: process.env.RAZORPAY_KEYSECRET })



router.post('/create/orderId', userAuth.userSessionNo, (req, res) => {
  console.log('Creating order using Razorpay');

  // Get the order details from the request body
  const amount = Number(req.body.amount);
  if (!Number.isSafeInteger(amount) || amount < 100) {
    return res.status(400).json({ error: 'A valid payment amount is required.' });
  }

  // Create the order options
  const options = {
    amount: amount, // Amount in the smallest currency unit
    currency: "INR",
    receipt: "order_rcptid_11" // Unique order receipt ID
  };

  // Create the order using the Razorpay instance
  instance.orders.create(options, (err, order) => {
    if (err) {
      console.error('Error creating Razorpay order:', err);
      console.log('Complete Error Object:', err);
      return res.status(500).json({ error: 'Error creating order' });
    }

    console.log('Razorpay order created:', order);
    return res.status(200).json({ orderId: order.id, amount: order.amount, currency: order.currency, keyId: process.env.RAZORPAY_KEYID });
  });
});



module.exports = router;
