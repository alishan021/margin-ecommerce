# Margin Ecommerce

This is an ecommerce project that sells tools. It includes the signup, login, forgot password,  Home page, products page, filters (price, category, search, sort), cart, favourites, checkout, profile page includes ( new password, wallet, address and address management, orders and signout ), orders and order details, invoice generate etc are included in user side. 

In admin side login page, home page that includes charts, tables and sales report, A sales report page where we can download sales report as pdf and excel. A page for user managemnet, offer managment, product management , category management, coupon management etc. are included.



> The env file should include these values 

PORT=6600 <br/>
DB_URI='mongodb://localhost:27017/margin' or Mongodb Atlas URL ( better ) <br/>
EMAIL_PASS_KEY="your_email_passkey_for_sending_otp_" <br/>
OTP_EMAIL="your_email@gmail.com" <br/>
SALTROUNDS=10 <br/>
SESSION_SECRET='your-secret-key' <br/>
RAZORPAY_KEY_ID="your_razorpay_key_id" <br/>
RAZORPAY_KEY_SECRET="your_razorpay_key_secret" <br/>
DELIVERY_CHARGE=50 <br/>
REFERRAL_CODE_MONEY=100 <br/>
ADMIN_EMAIL='youremail@gmail.com'
ADMIN_PASSWORD='your_password'
CLOUDINARY_URL='cloudinary://your_api_key:your_api_secret@your_cloud_name'
# Or set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET.
# Optional. Defaults to margin/products.
CLOUDINARY_PRODUCT_FOLDER='margin/products'

Product uploads are stored in Cloudinary URLs. To upload existing files in `public/products` and update their product records, run `npm run migrate:product-images` after configuring Cloudinary. The script leaves local files in place; verify the catalog first, then remove them yourself when ready.
