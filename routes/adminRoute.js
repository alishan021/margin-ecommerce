
const express = require('express');
const adminController = require('../controllers/adminController');
const admProductController = require('../controllers/admProductController');
const admUserController = require('../controllers/admUserController');
const admCategoryController = require('../controllers/admCategoryController');
const admOrdersController = require('../controllers/admOrdersController');
const admCouponController = require('../controllers/admCouponController');
const admSalesReportController = require('../controllers/admSalesReport');
const admOfferModule = require('../controllers/admOfferModule');
const adminModel = require('../models/admin');
const adminAuth = require('../middlewares/authAdmin');
const userModel = require('../models/user');
const categoryModel = require('../models/category');
const orderModel = require('../models/order');
const productModel = require('../models/products');

const router = express.Router();



const multer = require('multer');
const fs = require('fs');

const dir = './public/products';
if (!fs.existsSync(dir)){
    fs.mkdirSync(dir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: function(req, file, cb) {
      cb(null, dir);
    },
    filename: function(req, file, cb) {
      const fileName = Date.now() + file.originalname;
      cb(null, fileName );
    },

});

const upload = multer({ storage: storage });



router.get('/login', adminAuth.adminSessionYes, adminController.adminLoginGet );
router.post('/login',  adminController.adminLoginPost );

// Home page
router.get('/', adminAuth.adminSessionNo, adminController.adminHomeGet );
router.get('/dashboard/data', adminAuth.adminSessionNo, adminController.dashBoardDetails );
router.get('/dashboard/data/custom', adminAuth.adminSessionNo, adminController.customDetails );


// To get user list for admin;
router.get('/users', adminAuth.adminSessionNo, admUserController.adminUsersGet );
router.post('/user-status', admUserController.userStatusPost );


// admin category
router.get('/category', adminAuth.adminSessionNo, admCategoryController.categoryGet );
router.post('/category',  admCategoryController.createCategoryPost );
router.patch('/category',  admCategoryController.categoryListEditPatch );
router.delete('/category/:id',  admCategoryController.categoryDelete );
router.get('/category/:categoryId', adminAuth.adminSessionNo, admCategoryController.categoryUpdateGet );
router.patch('/category/update/:categoryId', admCategoryController.categoryUpdatePut );


// admin product 
router.get('/products', adminAuth.adminSessionNo,  admProductController.getProducts );
router.get('/products/add', adminAuth.adminSessionNo,  admProductController.addProductGet );
router.patch('/product', admProductController.productListEditPatch );
router.delete('/product/:id', admProductController.productDelete );


router.post('/products/add', upload.array('images', 6 ), admProductController.productsAdd );
router.get('/products/edit/:productId', adminAuth.adminSessionNo, admProductController.productEditGet );
router.post('/products/edit/:productId',  upload.array('images', 6 ), admProductController.productEditPost );
router.delete('/products/delete-image', admProductController.productImageDelete );

router.get('/order', adminAuth.adminSessionNo, admOrdersController.orderGet );
router.patch('/order-status', admOrdersController.orderStatusPatch );

router.get('/coupon', adminAuth.adminSessionNo, admCouponController.couponGet );
router.get('/coupon/add', adminAuth.adminSessionNo, admCouponController.addCouponGet );
router.post('/coupon/add', admCouponController.addCouponPost );
router.delete('/coupon/delete/:couponId', admCouponController.couponDelete );

router.get('/sales-report/', adminAuth.adminSessionNo, admSalesReportController.salesReportGet );
router.get('/sales-report/:reportType', adminAuth.adminSessionNo, admSalesReportController.customSalesReportGet);
router.get('/sales/pdf/:reportType', adminAuth.adminSessionNo, admSalesReportController.genPdfGet );
router.get('/sales-report-total', adminAuth.adminSessionNo, admSalesReportController.salesReportTotalGet );
router.get('/sales/excel/:reportType', adminAuth.adminSessionNo, admSalesReportController.salesReportExcelGet );

router.get('/offer-module', adminAuth.adminSessionNo, admOfferModule.offerModuleGet );
router.post('/offer-module', admOfferModule.offerModulePost );
router.delete('/offer/delete/:offerId', admOfferModule.deleteOffer );

router.get('/logout', adminController.logout );


module.exports = router;