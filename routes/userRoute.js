const express=require('express')
const user_route=express()
const session=require('express-session')

const config=require("../config/config");
require('dotenv').config()


user_route.use(session({
    secret:process.env.sessionSecret,
    resave:true,
    // cookie:({maxAge:600000}),
    saveUninitialized:true
}))


user_route.set('views','./views/users');

const bodyParser= require('body-parser')
user_route.use(bodyParser.json());
user_route.use(bodyParser.urlencoded({extended:true}))

const auth=require("../middleware/auth")
const block=require('../middleware/block')
const userController=require("../controllers/userController");

user_route.get('/signup',userController.loadSignup);
user_route.post('/signup',userController.insertUser);
user_route.get('/verify',userController.verifyMail);

user_route.get('/login',auth.isLogout,userController.loginLoad)
user_route.post('/login',userController.verifyLogin)
user_route.get('/user/account',auth.isLogin,userController.loadAccount)
user_route.get('/user/editprofile',userController.loadEditProfile)
user_route.post('/updateProfile',userController.updateProfile)
user_route.get('/user/addDefaultAddress',auth.isLogin,userController.loadAddDefaultAddress)
user_route.post('/addDefaultAddress',userController.addUserAddress)

user_route.get('/',userController.loadHome);
user_route.get('/home',userController.loadHome);
user_route.get('/logout',userController.userLogout);
user_route.get('/contact',userController.loadContact)
user_route.get('/shop',userController.loadShop);
user_route.post('/search',userController.search)
user_route.post('/categoryFilter',userController.categoryFilter)
user_route.get('/product/details',userController.productDetails);

user_route.get('/product/wishlist',auth.isLogin,userController.loadWishlist)
user_route.get('/product/addwishlist',auth.isLogin,userController.addToWishList)
user_route.post('/remove/wishlist',userController.removeFromWishlist)

user_route.get('/product/cart',auth.isLogin,userController.loadCart);
user_route.post('/product/cart',userController.addToCart);

user_route.post('/cart/inc',userController.incItem);
user_route.post('/cart/dec',userController.decItem);
user_route.get('/cart/delete',auth.isLogin,userController.deleteFromCart)

user_route.post('/checkout/address',userController.loadAddress)
user_route.get('/checkout/address',auth.isLogin,userController.loadAddress)
user_route.get('/user/addAddress',auth.isLogin,userController.loadNewAddress)
user_route.get('/user/addresslist',auth.isLogin,userController.loadAddressList)
user_route.post('/addAddress',userController.addAddress);
user_route.get('/user/editaddress',auth.isLogin,userController.loadEditAddress);
user_route.post('/updateAddress',userController.updateAddress)
user_route.get('/user/removeAddress',auth.isLogin,userController.removeSingleAddress)

user_route.post('/user/payment',userController.loadPayment)

user_route.get('/user/payment',auth.isLogin,userController.loadPayment)
user_route.post('/redeem',userController.applycoupon)
user_route.get('/redeemviamodal',userController.couponviamodal)
user_route.post('/order/place',userController.orderPlaced)
user_route.get('/razorpay',auth.isLogin,userController.razorpay)

user_route.get('/order/review',auth.isLogin,userController.orderReview),
user_route.get('/order/success',userController.loadSuccess)
user_route.get('/orderview/seperate',auth.isLogin,userController.loadSeperateOrder),
user_route.get('/orderCancel',auth.isLogin,userController.orderCancel),
user_route.get('/orderDelivered',auth.isLogin,userController.orderDelivered);
user_route.get('/returnItem',auth.isLogin,userController.orderReturn)




module.exports=user_route