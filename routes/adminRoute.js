
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
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        if (!file.mimetype.startsWith('image/')) {
            return cb(new Error('Only image files are allowed.'));
        }
        cb(null, true);
    },
});



router.get('/login', adminAuth.adminSessionYes, adminController.adminLoginGet );
router.post('/login',  adminController.adminLoginPost );

// Home page
router.get('/', adminAuth.adminSessionNo, adminController.adminHomeGet );
router.get('/dashboard/data', adminAuth.adminSessionNo, adminController.dashBoardDetails );
router.get('/dashboard/data/custom', adminAuth.adminSessionNo, adminController.customDetails );


// To get user list for admin;
router.get('/users', adminAuth.adminSessionNo, admUserController.adminUsersGet );
router.post('/user-status', adminAuth.adminSessionNo, admUserController.userStatusPost );


// admin category
router.get('/category', adminAuth.adminSessionNo, admCategoryController.categoryGet );
router.post('/category', adminAuth.adminSessionNo,  admCategoryController.createCategoryPost );
router.patch('/category', adminAuth.adminSessionNo,  admCategoryController.categoryListEditPatch );
router.delete('/category/:id', adminAuth.adminSessionNo,  admCategoryController.categoryDelete );
router.get('/category/:categoryId', adminAuth.adminSessionNo, admCategoryController.categoryUpdateGet );
router.patch('/category/update/:categoryId', adminAuth.adminSessionNo, admCategoryController.categoryUpdatePut );


// admin product 
router.get('/products', adminAuth.adminSessionNo,  admProductController.getProducts );
router.get('/products/add', adminAuth.adminSessionNo,  admProductController.addProductGet );
router.patch('/product', adminAuth.adminSessionNo, admProductController.productListEditPatch );
router.delete('/product/:id', adminAuth.adminSessionNo, admProductController.productDelete );


router.post('/products/add', adminAuth.adminSessionNo, upload.array('images', 6 ), admProductController.productsAdd );
router.get('/products/edit/:productId', adminAuth.adminSessionNo, admProductController.productEditGet );
router.post('/products/edit/:productId', adminAuth.adminSessionNo,  upload.array('images', 6 ), admProductController.productEditPost );
router.delete('/products/delete-image', adminAuth.adminSessionNo, admProductController.productImageDelete );

router.get('/order', adminAuth.adminSessionNo, admOrdersController.orderGet );
router.patch('/order-status', adminAuth.adminSessionNo, admOrdersController.orderStatusPatch );

router.get('/coupon', adminAuth.adminSessionNo, admCouponController.couponGet );
router.get('/coupon/add', adminAuth.adminSessionNo, admCouponController.addCouponGet );
router.post('/coupon/add', adminAuth.adminSessionNo, admCouponController.addCouponPost );
router.delete('/coupon/delete/:couponId', adminAuth.adminSessionNo, admCouponController.couponDelete );

router.get('/sales-report/', adminAuth.adminSessionNo, admSalesReportController.salesReportGet );
router.get('/sales-report/:reportType', adminAuth.adminSessionNo, admSalesReportController.customSalesReportGet);
router.get('/sales/pdf/:reportType', adminAuth.adminSessionNo, admSalesReportController.genPdfGet );
router.get('/sales-report-total', adminAuth.adminSessionNo, admSalesReportController.salesReportTotalGet );
router.get('/sales/excel/:reportType', adminAuth.adminSessionNo, admSalesReportController.salesReportExcelGet );

router.get('/offer-module', adminAuth.adminSessionNo, admOfferModule.offerModuleGet );
router.post('/offer-module', adminAuth.adminSessionNo, admOfferModule.offerModulePost );
router.delete('/offer/delete/:offerId', adminAuth.adminSessionNo, admOfferModule.deleteOffer );

router.get('/logout', adminController.logout );


module.exports = router;
