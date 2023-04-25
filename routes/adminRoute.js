const express=require('express');
const admin_route=express();
const path=require('path');
const multer=require('multer')
require('dotenv').config()

const session=require('express-session')
const config=require("../config/config");

admin_route.use(session({
    secret:process.env.sessionSecret,
    resave: true,
    cookie:({maxAge:600000}),
    saveUninitialized: true
}))

const storage=multer.diskStorage({
    destination:function(req,file,cb){
        cb(null,path.join(__dirname,'../public/product-images/temp'))
    },
    filename: function(req,file,cb){
        cb(null,Date.now() + '-' + file.originalname)
    }

})
const upload=multer({storage: storage})

const bodyParser=require('body-parser');
admin_route.use(bodyParser.json());
admin_route.use(bodyParser.urlencoded({extended:true}));


admin_route.set('views','./views/admin');

const adminController=require("../controllers/adminController");
const productController=require("../controllers/productsController")
const bannerController=require("../controllers/bannerController")
const couponController=require("../controllers/couponController")
const orderController=require("../controllers/orderController")
const adminAuth=require("../middleware/adminAuth")

 
admin_route.get('/',adminAuth.isLogout,adminController.loadLogin);
admin_route.post('/',adminController.verifyLogin);

admin_route.get('/home',adminAuth.isLogin,adminController.loadDashboards);
admin_route.get('/userlist',adminAuth.isLogin,adminController.loadDashboard);

admin_route.get('/banner',adminAuth.isLogin,bannerController.loadBannerAdd)
admin_route.post('/banner',upload.array('image'),bannerController.uploadBanner)
admin_route.get('/banner/delete',bannerController.deleteBanner)
admin_route.get('/editbanner',bannerController.editBanner)
admin_route.post('/editbanner',bannerController.updateBanner)

admin_route.get('/block_user',adminController.blockUser);

admin_route.get('/addproducts',adminAuth.isLogin,productController.loadAddProduct);
admin_route.post('/addproducts',upload.array('images'),productController.insertProduct);
admin_route.get('/productlist',adminAuth.isLogin,productController.loadProductList);
admin_route.get('/editproduct',adminAuth.isLogin,productController.loadEditProduct)
admin_route.post('/editproduct',upload.array('images'),productController.updateProduct);
admin_route.get('/delete_product',productController.deleteProduct);

admin_route.get('/categorylist',adminAuth.isLogin,adminController.loadCategoryList)
admin_route.get('/addcategory',adminAuth.isLogin,adminController.loadAddCategory);
admin_route.post('/addcategory',adminController.insertCategory);
admin_route.get('/editcategory',adminAuth.isLogin,adminController.editCategoryLoad)
admin_route.post('/updatecategory',adminController.updateCategory)

admin_route.get('/orderlist',adminAuth.isLogin,orderController.loadOrderList),
admin_route.get('/ordermanage',adminAuth.isLogin,orderController.loadOrderManage)
admin_route.get('/shipOrder',adminAuth.isLogin,orderController.shipOrder)
admin_route.get('/returnAccept',orderController.acceptReturn)

admin_route.get('/coupon',adminAuth.isLogin,couponController.loadCoupons)
admin_route.get('/addcoupon',adminAuth.isLogin,couponController.loadAddCoupons)
admin_route.post('/addcoupon',couponController.insertCoupon)
admin_route.get('/delete/coupon',couponController.deleteCoupon)
admin_route.get('/editcoupon',couponController.loadEditCoupon)
admin_route.post('/updatecoupon',couponController.updateCoupon)

admin_route.get('/salesReport',adminController.loadSales)
admin_route.post('/sales',adminController.sales)



admin_route.get('/logout',adminController.logout)


module.exports=admin_route;