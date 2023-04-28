const mongoose = require('mongoose')
const User = require('../models/userModel')
const productSchema = require('../models/productModel')
const cartSchema = require('../models/cartModel')
const categorySchema = require('../models/categoryModel')
const orderSchema = require('../models/orderModel')
const bannerSchema = require('../models/bannerModel')
const couponSchema = require('../models/couponModel')
const bcrypt = require('bcrypt')
const nodemailer = require('nodemailer')
const Razorpay = require('razorpay')
var instance = new Razorpay({
    key_id: 'rzp_test_bXTgxd9QntzABH',
    key_secret: 'MTKYRjDzIWSoxTRZW3cCE89a',
});
const { ObjectId } = mongoose.Schema.Types
let message
let orderAddress
let sweetalert
let alert

const securePassword = async (password) => {
    try {
        const passwordHash = await bcrypt.hash(password, 10);
        return passwordHash;

    } catch (error) {
        console.log(error.message);
    }

}

// for send mail
const sendVerifyMail = async (name, email, user_id) => {
    try {
        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 587,
            secure: false,
            require: true,
            auth: {
                user: 'apertureshoppee@gmail.com',
                pass: 'kxjwimorxmjbtfqq'
            }


        })
        const mailOption = {
            from: 'apertureshoppee@gmail.com',
            to: email,
            subject: 'For verification',
            html: '<p>Hi ' + name + ', please click here to <a href="https://aperturecam.online/verify?id=' + user_id + '">verify</a> your mail.</p>'
        }
        transporter.sendMail(mailOption, function (error, info) {
            if (error) {
                console.log(error);
            } else {
                console.log("email has been send", info.response);
            }
        })

    } catch (error) {
        console.log(error.message)

    }
}

const loadSignup = async (req, res) => {
    try {
        res.render('signup1', { message })
        message = null
    } catch (error) {
        console.log(error.message)
    }
}

const insertUser = async (req, res) => {
    try {

        const repeat = await User.findOne({ email: req.body.email })
        if (req.body.name == "" && req.body.email == "" && req.body.password == "" && req.body.repassword == "") {
            message = "please fill Registration details"
            res.redirect('/signup')
        } else if (req.body.email == "") {
            message = "email is empty"
            res.redirect('/signup')
        } else if (repeat) {
            message = "email already exist"
            res.redirect('/signup')
        } else if (req.body.name == "") {
            message = "Please enter name"
            res.redirect('/signup')
        } else if (req.body.password == "") {
            message = "Please enter password"
            res.redirect('/signup')
        } else if (req.body.password.length < 8) {
            message = "password must contain 8 character"
            res.redirect('/signup')
        } else if (req.body.repassword == "") {
            message = "Please confirm your password"
            res.redirect('/signup')
        } else if (req.body.password != req.body.repassword) {
            message = "password does not match"
            res.redirect('/signup')
        }
        else {

            const spassword = await securePassword(req.body.password); console.log("hiiiiii")
            //const{name,email,mobile}=req.body
            const user = new User({
                name: req.body.name,
                email: req.body.email,
                mobile: req.body.mobile,
                password: spassword,
                repassword: spassword,
                is_admin: 0,
                is_verified: 0,
                is_blocked: 0

            });

            const userData = await user.save();
            console.log(userData);

            if (userData) {
                sendVerifyMail(req.body.name, req.body.email, userData._id)
                res.render('login1', { message: "please verify your mail to login" })
            } else {
                res.render('signup1', { mesage: "registration FAILED" })
            }
        }

    } catch (error) {
        console.log(error);
        res.status(500).send("Server Error");
    }
}
const verifyMail = async (req, res) => {
    try {
        const updateInfo = await User.updateOne({ _id: req.query.id }, { $set: { is_verified: 1 } })

        console.log(updateInfo);
        res.render('email-verified');

    } catch (error) {
        console.log(error);
        res.status(500).send("Server Error");

    }
}
const loginLoad = async (req, res) => {
    try {
        res.render('login1', { message })

    } catch (error) {
        console.log(error);
        res.status(500).send("Server Error");

    }
}
const verifyLogin = async (req, res) => {
    try {

        emaillogin = req.body.email
        passwordlogin = req.body.password

        const loginData = await User.findOne({ email: emaillogin })
        if (loginData) {
            if (loginData.is_verified == 1) {
                if (loginData.is_blocked == 0) {
                    const passwordmatch = await bcrypt.compare(passwordlogin, loginData.password)
                    if (passwordmatch) {
                        req.session.user_id = loginData._id
                        console.log(loginData._id);
                        //usereData = loginData._id
                        res.redirect('/home')

                    } else {

                        res.render('login1', { message: "incorrect password" })
                    }
                } else {
                    res.render('login1', { message: "sorry your account has been blocked" })
                }

            } else {
                res.render('login1', { message: "email not verified" })
            }
        } else {
            res.render('login1', { message: "incorrect mail" })
        }


    } catch (error) {
        console.log(error);
        res.status(500).send("Server Error");

    }
}

const loadAccount = async (req, res) => {
    try {
        const userData = req.session.user_id
        const user = await User.findOne({ _id: userData })
        res.render('Account', { user, alert })
        alert = null
    } catch (error) {
        console.log(error);
        res.status(500).send("Server Error");
    }
}

const loadEditProfile = async (req, res) => {
    try {
        const userData = req.session.user_id
        const user = await User.findOne({ _id: userData })
        res.render('edit_account', { user })
    } catch (error) {
        console.log(error.message);

    }
}

const updateProfile = async (req, res) => {
    try {
        const userData = req.session.user_id
        const user = await User.findOne({ _id: userData })

        const { name, email, mobile } = req.body

        const updateProfile = await User.updateOne({ _id: user._id }, { $set: { name: name, email: email, mobile: mobile } })
        console.log("check profile update");
        console.log(updateProfile);
        if (updateProfile) {
            alert = 'profile updated success'
            res.redirect('/user/account')
            sweetalert = null
        }
        res.redirect('/user/account')

    } catch (error) {
        console.log(error.message);
    }
}

const loadAddDefaultAddress = async (req, res) => {
    try {
        res.render('add_defaultAddress')
    } catch (error) {
        console.log(error.message);
    }
}

const addUserAddress = async (req, res) => {
    try {
        const userData = req.session.user_id
        console.log(userData);

        const userAddress = await User.findByIdAndUpdate({ _id: userData }, {
            $push: {
                address: {
                    name: req.body.name,
                    home: req.body.home,
                    street: req.body.street,
                    district: req.body.district,
                    zip: req.body.zip,
                    state: req.body.state,
                    country: req.body.country,
                    mobile: req.body.mobile,
                    email: req.body.email
                }
            }
        })
        console.log(userAddress);
        res.redirect('/user/account')
    } catch (error) {
        console.log(error.message);
    }
}

const userLogout = async (req, res) => {
    try {
        // const userData = req.session.user_id
        // const user = await User.findOne({ _id: userData })
        // id=user._id
        // req.session.destroy()
        req.session.user_id = null

        res.redirect('/login');

    } catch (error) {
        console.log(error);
        res.status(500).send("Server Error");

    }
}

const loadHome = async (req, res) => {
    try {

        //res.render('home', { useremail })

        const userData = req.session.user_id
        const user = await User.findOne({ _id: userData })
        const banner = await bannerSchema.find({})

        const p_details = await productSchema.find({})
        res.render('home', { p_details, user, banner })
    } catch (error) {
        console.log(error);
        res.status(500).send("Server Error");
    }
}

const loadContact = async (req, res) => {
    try {
        res.render('contact')
    } catch (error) {
        console.log(error);
        res.status(500).send("Server Error");
    }
}

const loadShop = async (req, res) => {
    try {
        const userData = req.session.user_id
        const user = await User.findOne({ _id: userData })

        const p_details = await productSchema.find({})
        const c_details = await categorySchema.find({})
        res.render('shop', { p_details, user, c_details })
    } catch (error) {
        console.log(error);
        res.status(500).send("Server Error");
    }
}



const search2 = async (req, res) => {
    try {
        const { search, id } = req.body
        console.log("123456789");

        let p_details
        if (search || id) {

            p_details = await productSchema.find({
                $or: [
                    { p_name: { $regex: '.*' + search + '.*', $options: 'i' } },
                    { p_brand: { $regex: '.*' + search + '.*', $options: 'i' } },
                    { p_catogory: id }
                ]
            })

        }
        console.log(p_details);

        res.json({ p_details })

    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');

    }
}


const search = async (req, res) => {
    try {
        // const id = req.query.id
        const { id, search } = req.query

        let p_details
        if (search !== 'undefined') {
            console.log(1);
            if (id !== 'undefined') {
                console.log(id);
                p_details = await productSchema.find({
                    p_catogory: id,
                    $or: [
                        { p_name: { $regex: '.*' + search + '.*', $options: 'i' } },
                        { p_brand: { $regex: '.*' + search + '.*', $options: 'i' } },

                    ]
                })
            } else {
                console.log(3);
                p_details = await productSchema.find({
                    $or: [
                        { p_name: { $regex: '.*' + search + '.*', $options: 'i' } },
                        { p_brand: { $regex: '.*' + search + '.*', $options: 'i' } },

                    ]
                })
            }
        } else if (id) {
            console.log(12);
            console.log(id);
            p_details = await productSchema.find({ p_catogory: id })
            console.log(p_details);
        }


        res.send({ success: true, p_details: p_details })
        // res.render('shop',{productdetails,loginsession,category})
    }
    catch (error) {
        console.log(error);
        res.status(500).send("Server Error");

    }
}

const categoryFilter = async (req, res) => {
    try {
        const categoryId = req.query.id

        const p_details = await productSchema.find({})
        res.send({ sucess: true, p_details: p_details });
    } catch (error) {
        console.log(error);
        res.status(500).send("Server Error");
    }
}

const productDetails = async (req, res) => {
    try {
        const userData = req.session.user_id
        const user = await User.findOne({ _id: userData })

        const id = req.query.id
        const productData = await productSchema.findById({ _id: id }).populate('p_catogory')


        if (productData) {
            res.render('details', { p_details: productData, user, alert })
            alert = null
        } else {
            res.redirect('/product/details')
        }
    } catch (error) {
        console.log(error);
        res.status(500).send("Server Error");
    }
}

const loadWishlist = async (req, res) => {
    try {
        console.log(req.session);
        const userData = req.session.user_id
        const user = await User.findOne({ _id: userData }).populate('wishlist.product')
        res.render('wishlist', { user, alert })
        alert = null
    } catch (error) {
        console.log(error);
        res.status(500).send("Server Error");
    }
}

const addToWishList = async (req, res) => {
    try {

        id = req.query.id
        const userData = req.session.user_id
        const user = await User.findOne({ _id: userData })
        if (userData) {
            const findProduct = await productSchema.findOne({ _id: id })
            const wishlistid = await User.findOne({ _id: userData, 'wishlist.product': id })
            if (wishlistid) {
                sweetalert = "success"
                alert = 'Already wishlisted'
                res.redirect('/product/wishlist')
                sweetalert = null
                alert = null
            } else {
                const wishlistupdate = await User.updateOne({ _id: user._id }, { $push: { wishlist: { product: findProduct._id } } })
                const product = await productSchema.findById({ _id: id })
                if (wishlistupdate) {


                    sweetalert = "success"
                    alert = 'Item added to wishlist'
                    res.render('details', { p_details: product, user, alert })
                    sweetalert = null
                    alert = null

                }

            }
        }
    } catch (error) {
        console.log(error);
        res.status(500).send("Server Error");
    }
}

const removeFromWishlist = async (req, res) => {
    try {
        id = req.query.id
        const userData = req.session.user_id
        const user = await User.findOne({ _id: userData })
        const update = await User.updateOne({ _id: user._id }, { $pull: { wishlist: { _id: id } } })
        console.log(update);
        res.redirect('/product/wishlist')
    } catch (error) {
        console.log(error);
        res.status(500).send("Server Error");
    }
}

const loadCart = async (req, res) => {
    try {
        const userData = req.session.user_id
        const user = await User.findOne({ _id: userData })
        const userCart = await cartSchema.findOne({ userId: userData })
        if (userCart) {

            if (user) {


                const itemData2 = await cartSchema.findOne({ userId: user._id })
                const y = itemData2.item.map((k) => {
                    return k.total
                }).reduce((a, b) => {
                    return a = a + b
                })
                const grandTotal = await cartSchema.updateOne({ userId: user._id }, { $set: { "subTotalPrice": y, "grandTotalPrice": y } })
                const userCart = await cartSchema.findOne({ userId: userData }).populate('item.product')


                res.render('cart', { user, userCart, message, alert })
                alert = null
            } else {
                res.redirect('/login')
            }
        } else {
            const userCart = null
            res.render('cart', { user, userCart, alert })
            alert = null
        }
    } catch (error) {
        console.log(error);
        res.status(500).send("Server Error");
    }
}

const addToCart = async (req, res) => {
    try {
        const userData = req.session.user_id
        if (userData) {
            const user = await User.findById({ _id: userData })

            id = req.query.id
            const findProduct = await productSchema.findOne({ _id: id })

            const userCart = await cartSchema.findOne({ userId: userData })
            const cartCount = await cartSchema.findOne({ userId: user._id, "item.product": id })
            console.log(cartCount);

            if (userCart) {
                if (cartCount) {
                    const inccart = await cartSchema.updateOne({ userId: user._id, "item.product": id }, { $inc: { "item.$.quantity": 1 } })
                    console.log(inccart);
                    alert = 'Item already exist'
                    res.redirect('/product/cart')
                } else {
                    const updateItems = await cartSchema.updateOne({ userId: user._id }, { $push: { item: { product: findProduct._id, quantity: 1, price: findProduct.p_price, total: findProduct.p_price } } });
                    console.log(updateItems);

                    const itemData2 = await cartSchema.findOne({ userId: user._id })
                    const y = itemData2.item.map((k) => {
                        return k.total
                    }).reduce((a, b) => {
                        return a = a + b
                    })
                    const grandTotal = await cartSchema.updateOne({ userId: user._id }, { $set: { "grandTotalPrice": y, "subTotalPrice": y } })

                    if (updateItems) {
                        sweetalert = "success"
                        alert = 'New Item added to Cart'
                        res.redirect('/product/cart')
                        sweetalert = null
                    }


                }
            } else {
                const cartItem = await cartSchema.insertMany({ userId: user._id, item: [{ product: findProduct._id, quantity: 1, price: findProduct.p_price, total: findProduct.p_price }] });
                console.log(cartItem);
                sweetalert = "success"
                alert = 'New Item added to Cart'
                res.redirect('/product/cart')
                sweetalert = null

            }
        } else {
            res.redirect('/login')
        }
    } catch (error) {
        console.log(error);
        res.status(500).send("Server Error");
    }
}

// const incItem = async (req, res) => {
//     try {

//         const userData = req.session.user_id
//         const user = await User.findById({ _id: userData })
//         console.log(user._id);

//         id = req.query.id
//         console.log(id);

//         const inccart = await cartSchema.updateOne({ userId: user._id, 'item._id': id }, { $inc: { "item.$.quantity": 1 } })
//         console.log(inccart);
//         const itemData = await cartSchema.findOne({ userId: user._id, 'item._id': id })
//         const x = itemData.item.filter((v) => {
//             return v._id == id
//         })
//         const total = x[0].price * x[0].quantity;
//         const itemTotal = await cartSchema.updateOne({ userId: user._id, 'item._id': id }, { $set: { "item.$.total": total } })
//         const itemData2 = await cartSchema.findOne({ userId: user._id, 'item._id': id })
//         const y = itemData2.item.map((k) => {
//             return k.total
//         }).reduce((a, b) => {
//             return a = a + b
//         })
//         const grandTotal = await cartSchema.updateOne({ userId: user._id, 'item._id': id }, { $set: { "grandTotalPrice": y } })

//         res.redirect('/product/cart')

//     } catch (error) {
//         console.log(error.message);
//     }
// }
const incItem = async (req, res) => {
    try {

        const userData = req.session.user_id
        const user = await User.findById({ _id: userData })
        console.log(user._id);

        id = req.query.id
        console.log(id);

        const itemData0 = await cartSchema.findOne({ userId: user._id, 'item._id': id })
        const z = itemData0.item.filter((v) => {
            return v._id == id
        })
        const prodctId = z[0].product
        const productfind = await productSchema.findOne({ _id: prodctId })


        if (z[0].quantity > productfind.p_stock) {


        } else {
            const inccart = await cartSchema.updateOne({ userId: user._id, 'item._id': id }, { $inc: { "item.$.quantity": 1 } })
            console.log(inccart);
            const itemData = await cartSchema.findOne({ userId: user._id, 'item._id': id })
            const x = itemData.item.filter((v) => {
                return v._id == id
            })
            const total = x[0].price * x[0].quantity;
            const itemTotal = await cartSchema.updateOne({ userId: user._id, 'item._id': id }, { $set: { "item.$.total": total } })
            const itemData2 = await cartSchema.findOne({ userId: user._id, 'item._id': id })
            const y = itemData2.item.map((k) => {
                return k.total
            }).reduce((a, b) => {
                return a = a + b
            })
            const grandTotal = await cartSchema.updateOne({ userId: user._id, 'item._id': id }, { $set: { "grandTotalPrice": y, "subTotalPrice": y } })
        }
        /////////////
        const itemData = await cartSchema.findOne({ userId: user._id, 'item._id': id })
        const x = itemData.item.filter((v) => {
            return v._id == id
        })
        const total = x[0].price * x[0].quantity;
        const y = itemData.item.map((k) => {
            return k.total
        }).reduce((a, b) => {
            return a = a + b
        })

        const setOne = await cartSchema.findOne({ userId: user._id, 'item._id': id })
        const quantity = setOne.item.filter((v) => {
            return v._id == id
        })
        const newQuantity = quantity[0].quantity


        res.json({ x, total, y, id, newQuantity })



        // res.redirect('/product/cart')

    } catch (error) {
        console.log(error);
        res.status(500).send("Server Error");
    }
}



const decItem = async (req, res) => {
    try {
        const userData = req.session.user_id
        const user = await User.findById({ _id: userData })
        id = req.query.id
        const itemData0 = await cartSchema.findOne({ userId: user._id, 'item._id': id })
        const z = itemData0.item.filter((v) => {
            return v._id == id
        })
        if (z[0].quantity > 1) {
            const inccart = await cartSchema.updateOne({ userId: user._id, 'item._id': id }, { $inc: { "item.$.quantity": -1 } })
            const itemData = await cartSchema.findOne({ userId: user._id, 'item._id': id })
            const x = itemData.item.filter((v) => {
                return v._id == id
            })
            const total = x[0].price * x[0].quantity;
            const itemTotal = await cartSchema.updateOne({ userId: user._id, 'item._id': id }, { $set: { "item.$.total": total } })
            const itemData2 = await cartSchema.findOne({ userId: user._id, 'item._id': id })
            const y = itemData2.item.map((k) => {
                return k.total
            }).reduce((a, b) => {
                return a = a + b
            })
            const grandTotal = await cartSchema.updateOne({ userId: user._id, 'item._id': id }, { $set: { "grandTotalPrice": y, "subTotalPrice": y } })

        }
        const itemData = await cartSchema.findOne({ userId: user._id, 'item._id': id })
        const x = itemData.item.filter((v) => {
            return v._id == id
        })
        const total = x[0].price * x[0].quantity;
        const y = itemData.item.map((k) => {
            return k.total
        }).reduce((a, b) => {
            return a = a + b
        })

        const setOne = await cartSchema.findOne({ userId: user._id, 'item._id': id })
        const quantity = setOne.item.filter((v) => {
            return v._id == id
        })
        const newQuantity = quantity[0].quantity
        console.log(total);

        res.json({ z, total, y, id, newQuantity })


    } catch (error) {
        console.log(error.message);
    }
}

// const deleteFromCart = async (req, res) => {
//     try {
//         const userData = req.session.user_id
//         const user = await User.findById({ _id: userData })
//         id = req.query.id

//         const deleteItem = await cartSchema.updateOne({ userId: user._id }, { $pull: { item: { _id: id } } })
//         const cartData = await cartSchema.findOne({ userId: user._id })
//         if (cartData.item.length == 0) {
//             await cartSchema.deleteOne({ userId: user._id })
//         }
//         const responseData = {
//             success: true,
//             message :"product removed from the cart"
//           };
//           res.json(responseData);
//         // res.redirect('/product/cart')
//     } catch (error) {
//         console.log(error.message);
//     }
// }
const deleteFromCart = async (req, res) => {
    try {
        const userData = req.session.user_id
        const user = await User.findById({ _id: userData })
        id = req.query.id
        const deleteItem = await cartSchema.updateOne(
            { userId: user._id },
            { $pull: { item: { _id: id } } }
        )

        const cartData = await cartSchema.findOne({ userId: user._id })
        if (cartData.item.length == 0) {
            await cartSchema.deleteOne({ userId: user._id })
        }
        const itemData2 = await cartSchema.findOne({ userId: user._id })
        const y = itemData2.item.map((k) => {
            return k.total
        }).reduce((a, b) => {
            return a = a + b
        })
        const grandTotal = await cartSchema.updateOne({ userId: user._id }, { $set: { "grandTotalPrice": y, "subTotalPrice": y } })
        const responseData = {
            success: true,
            message: "product removed from the cart",
            total: y
        };

        console.log(responseData, "chech seccess");
        res.json(responseData);

    } catch (error) {
        console.log(error);
        res.status(500).send("Server Error");

    }
}

const deleteCart = async (req, res) => {
    try {
        const productId = req.query.id;
        const userId = req.session.user_Id
        if (userId) {
            await User.updateOne(
                { _id: userId },
                { $pull: { cart: { product: productId } } }
            );
            const responseData = {
                success: true,
                message: "product removed from the cart"
            };
            res.json(responseData);
        } else {
            mes = "please Login for continue";
            res.redirect("/login");
        }
    } catch (error) {
        console.log(error);
        res.status(500).send("Server Error");
    }
}

const loadAddress = async (req, res) => {
    try {
        const userData = req.session.user_id
        const user = await User.findById({ _id: userData })
        const cartData = await cartSchema.findOne({ userId: user._id })
        
        if (user.address.length >=1) {

            let id1
            let id2
            if (!req.query.cart) {
                id1 = req.query.id
            } else {
                id2 = req.query.id
            }
            cartId = id2
            address_Index = id1
            addressDetails = user.address[address_Index]
            if (addressDetails) {
                res.render('address', { addressDetails, cartData })
            } else {               
                const cartData = await cartSchema.findOne({ userId: user._id })
                console.log(cartData);
                addressDetails = user.address[0]
                res.render('address', { addressDetails, cartData })
            }
        } else {
            res.redirect('/user/addAddress')
        }
    } catch (error) {
        console.log(error.message);
        res.status(500).send("Server Error");
    }
}



const loadNewAddress = async (req, res) => {
    try {
        res.render('add_address')
    } catch (error) {
        console.log(error);
        res.status(500).send("Server Error");
    }
}

const addAddress = async (req, res) => {
    try {
        const userData = req.session.user_id
        console.log(userData);

        const userAddress = await User.findByIdAndUpdate({ _id: userData }, {
            $push: {
                address: {
                    name: req.body.name,
                    home: req.body.home,
                    street: req.body.street,
                    district: req.body.district,
                    zip: req.body.zip,
                    state: req.body.state,
                    country: req.body.country,
                    mobile: req.body.mobile,
                    email: req.body.email
                }
            }
        })
        console.log(userAddress);
        res.redirect('/user/addresslist')

    } catch (error) {
        console.log(error.message);
        res.status(500).send("Server Error");
    }
}


const loadAddressList = async (req, res) => {
    try {
        cart = req.query.fromCart
        const userData = req.session.user_id
        const user = await User.findById({ _id: userData })

        res.render('address_list', { user, cart })

    } catch (error) {
        console.log(error.message);
        res.status(500).send("Server Error");
    }
}

const removeSingleAddress = async (req, res) => {
    try {
        index = req.query.index
        const userData = req.session.user_id
        const user = await User.findById({ _id: userData })

        user.address.splice(index, 1)
        await user.save()

        res.redirect('/user/addresslist')

    } catch (error) {
        console.log(error);
        res.status(500).send("Server Error");
    }
}

const loadEditAddress = async (req, res) => {
    try {
        const userData = req.session.user_id
        const user = await User.findById({ _id: userData })

        index = req.query.index
        const addressDetails = user.address[index]

        res.render('edit_address', { addressDetails, index })
    } catch (error) {
        console.log(error.message);
        res.status(500).send("Server Error");
    }
}

const updateAddress = async (req, res) => {
    try {

        const userData = req.session.user_id
        const user = await User.findById({ _id: userData })
        const index = req.query.index;

        const { name, home, street, district, zip, state, country, mobile, email } = req.body;
        const updateObj = {};
        updateObj[`address.${index}.name`] = name;
        updateObj[`address.${index}.home`] = home;
        updateObj[`address.${index}.street`] = street;
        updateObj[`address.${index}.district`] = district;
        updateObj[`address.${index}.zip`] = zip;
        updateObj[`address.${index}.state`] = state;
        updateObj[`address.${index}.country`] = country;
        updateObj[`address.${index}.mobile`] = mobile;
        updateObj[`address.${index}.email`] = email;
        const updatedaddress = await User.updateOne({ _id: user._id }, { $set: updateObj })

        console.log(updatedaddress);

        res.redirect('/user/addresslist')


    } catch (error) {
        console.log(error.message);
        res.status(500).send("Server Error");
    }
}

const loadPayment = async (req, res) => {
    try {
        address = req.body
        orderAddress = address
        const userData = req.session.user_id
        const order = req.session.order
        const user = await User.findById({ _id: userData })
        const cartData = await cartSchema.findOne({ userId: user._id })
        const subtotal = cartData ? cartData.subTotalPrice : 0;
        const coupons = await couponSchema.find({ minAmount: { $lte: subtotal } });


        res.render('payment', { cartData, address, sweetalert, order, coupons, user })
        sweetalert = null

    } catch (error) {
        console.log(error.message);
        res.status(500).send("Server Error");
    }
}

const getpayment = async (req, res) => {
    try {
        const userData = req.session.user_id
        const order = req.session.order
        const user = await User.findById({ _id: userData })
        const cartData = await cartSchema.findOne({ userId: user._id })
        const coupons = await couponSchema.find()

        console.log("chech payment after order");
        res.render('payment', { cartData, user, sweetalert, coupons, order })
        sweetalert = null

    } catch (error) {
        console.log(error.message);
        res.status(500).send("Server Error");
    }
}

const applycoupon = async (req, res) => {
    try {
        const userData = req.session.user_id

        const couponId = req.body.search
        console.log(req.body.search);
        const cart = await cartSchema.findOne({ userId: userData })
        const coupon = await couponSchema.findOne({ couponId: couponId })
        console.log(coupon);
        const discount = (coupon.discount / 100)
        let reduction
        if (coupon) {
            if (cart.subTotalPrice >= coupon.minAmount && cart.subTotalPrice <= coupon.maxAmount) {
                const reduction = cart.subTotalPrice * discount
                const grand = cart.subTotalPrice - reduction
                await cartSchema.updateOne({ userId: userData }, { $set: { "grandTotalPrice": grand } })
                res.json({ success: true, grand, reduction })
            } else if (cart.subTotalPrice >= coupon.maxAmount) {
                const reduction = coupon.max_discount
                const grand = cart.subTotalPrice - reduction
                await cartSchema.updateOne({ userId: userData }, { $set: { "grandTotalPrice": grand } })
                res.json({ success: true, grand, reduction })
            }

        }

    } catch (error) {
        console.log(error.message);
        res.status(500).send("Server Error");
    }
}
const couponviamodal = async (req, res) => {
    try {
        const userData = req.session.user_id

        const couponId = req.query.id
        console.log(couponId);
        const cart = await cartSchema.findOne({ userId: userData })
        const coupon = await couponSchema.findOne({ couponId: couponId })
        console.log(coupon);
        const discount = (coupon.discount / 100)
        let reduction
        if (coupon) {
            if (cart.subTotalPrice >= coupon.minAmount && cart.subTotalPrice <= coupon.maxAmount) {
                const reduction = cart.subTotalPrice * discount
                const grand = cart.subTotalPrice - reduction
                await cartSchema.updateOne({ userId: userData }, { $set: { "grandTotalPrice": grand } })
                res.json({ success: true, grand, reduction })
            } else if (cart.subTotalPrice >= coupon.maxAmount) {
                const reduction = coupon.max_discount
                const grand = cart.subTotalPrice - reduction
                await cartSchema.updateOne({ userId: userData }, { $set: { "grandTotalPrice": grand } })
                res.json({ success: true, grand, reduction })
            }

        }

    } catch (error) {
        console.log(error.message);
        res.status(500).send("Server Error");
    }
}

const orderPlaced = async (req, res) => {
    try {

        const userData = req.session.user_id
        const user = await User.findById({ _id: userData })

        const payment = req.body
        console.log(payment);



        const cart = await cartSchema.findOne({ userId: user._id }).populate("item.product")

        console.log(cart);
        const today = new Date();
        const arrivingDate = new Date();
        arrivingDate.setDate(today.getDate() + 5);
        const orderItem = cart.item.map((item) => {
            return {
                product: item.product._id,
                price: item.total,
                quantity: item.quantity,
                order_date: new Date(),
                arriving_date: arrivingDate,



            }
        })

        console.log(orderItem);

        req.session.orderItem = orderItem
        // const grandtotal = cart.item.map((item) => {
        //     return item.total
        // }).reduce((a, b) => {
        //     return a = a + b
        // })
        const grandtotal = cart.grandTotalPrice

        console.log(grandtotal);


        if (payment.payment == "cod") {
            const order = new orderSchema({
                userId: userData,
                order: orderItem,
                address: orderAddress,
                grandTotal: grandtotal,
                payment_type: payment.payment

            });

            const saveOrder = await order.save();
            console.log(saveOrder);

            if (saveOrder) {
                await cartSchema.deleteOne({ userId: user._id })
            }

            orderItem.forEach(async (element) => {
                const product = await productSchema.findById({ _id: element.product })
                const inventoryUpdate = await productSchema.updateOne({ _id: element.product }, { $set: { p_stock: Number(product.p_stock) - Number(element.quantity) } })
            });
            const id = saveOrder._id
            const orderData = await orderSchema.find({ _id: id }).populate("order.product")


            if (saveOrder) {
                sweetalert = "success"
                res.render('orderSuccess', { user, userData, order, sweetalert, orderData })
                sweetalert = null
            }
        } else if (payment.payment == "razorpay") {

            const userData = req.session.user_id
            const user = await User.findById({ _id: userData })

            const payment = req.body
            console.log(payment);


            req.session.orderAddress = orderAddress
            const cart = await cartSchema.findOne({ userId: user._id }).populate("item.product")

            console.log(cart);
            const today = new Date();
            const arrivingDate = new Date();
            arrivingDate.setDate(today.getDate() + 5);
            const orderItem = cart.item.map((item) => {
                return {
                    product: item.product._id,
                    price: item.total,
                    quantity: item.quantity,
                    order_date: new Date(),
                    arriving_date: arrivingDate,



                }
            })

            console.log(orderItem);


            const g = cart.grandTotalPrice
            const grandtotal = Math.round(g)

            const options = {
                amount: grandtotal, // amount in paisa (multiply by 100)
                currency: "INR", // currency code
                receipt: "order_" + today.getTime(), // unique order ID
            }
            const order = await instance.orders.create(options)
            req.session.order = order
            req.session.orderDatas = {
                userId: userData,
                order: orderItem,
                address: orderAddress,
                grandTotal: grandtotal,
                payment_type: payment.payment
            };
            console.log(order);

            res.redirect('/user/payment?orderId=' + order.id)




        } else if (payment.payment == "wallet") {
            if (user.wallet >= grandtotal) {
                const order = new orderSchema({
                    userId: userData,
                    order: orderItem,
                    address: orderAddress,
                    grandTotal: grandtotal
                });

                const saveOrder = await order.save();
                console.log(saveOrder);

                if (saveOrder) {
                    await cartSchema.deleteOne({ userId: user._id })
                }

                orderItem.forEach(async (element) => {
                    const product = await productSchema.findById({ _id: element.product })
                    const inventoryUpdate = await productSchema.updateOne({ _id: element.product }, { $set: { p_stock: Number(product.p_stock) - Number(element.quantity) } })
                });
                id = saveOrder._id
                const orderData = await orderSchema.find({ _id: id }).populate("order.product")
                if (saveOrder) {
                    sweetalert = "success"
                    res.render('orderSuccess', { user, userData, order, sweetalert, orderData })
                    sweetalert = null
                }

            }

        }
    } catch (error) {
        console.log(error);
        res.status(500).send("Server Error");
    }
}

const razorpay = async (req, res) => {

    const orderDatas = req.session.orderDatas

    const userData = req.session.user_id
    const orderAddress = req.session.orderAddress
    console.log(req.session.orderAddress);
    console.log(req.session.user_id);
    const order = new orderSchema({
        userId: userData,
        order: orderDatas.order,
        grandTotal: orderDatas.grandTotal,
        address: orderAddress,
        payment_type: "razorpay"

    });
    const save = await order.save();
    //  const orderData=await Order.findOne({_id:save._id}).populate('order.product')
    const orderData = await orderSchema.findOne({ _id: save._id }).populate('order.product')

    if (save) {
        await cartSchema.deleteOne({ userId: userData })
    }

    orderItem = req.session.orderItem

    orderItem.forEach(async (element) => {
        const product = await productSchema.findById({ _id: element.product })
        const inventoryUpdate = await productSchema.updateOne({ _id: element.product }, { $set: { p_stock: Number(product.p_stock) - Number(element.quantity) } })
    });

    const orderid = orderData._id
    console.log(orderid + "razorpay success");

    res.json({ orderid, orderData })


}
const orderReview = async (req, res) => {
    try {
        req.session.order = null
        const userData = req.session.user_id
        const user = await User.findById({ _id: userData })

        const orderDetails = await orderSchema.find({ userId: user._id }).sort({ _id: -1 }).populate("order.product")

        res.render('user_orders', { orderDetails })

    } catch (error) {
        console.log(error);
        res.status(500).send("Server Error");
    }
}
const loadSuccess = async (req, res) => {
    try {
        const id = req.query.id

        const orderData = await orderSchema.findOne({ _id: id }).populate('order.product')

        res.render('successOrder', { orderData })

    } catch (error) {
        console.log(error);
        res.status(500).send("Server Error");
    }
}


const loadSeperateOrder = async (req, res) => {
    try {
        const userData = req.session.user_id
        const user = await User.findById({ _id: userData })

        orderId = req.query.id

        const itemData = await orderSchema.findOne({ _id: orderId }).populate("order.product")
        console.log(itemData);
        res.render('order_details', { itemData })
    } catch (error) {
        console.log(error);
        res.status(500).send("Server Error");
    }
}

const orderCancel = async (req, res) => {
    try {
        const userData = req.session.user_id
        const user = await User.findById({ _id: userData })
        cancelIndex = req.query.cancelIndex;
        console.log(cancelIndex, " cancelindex");
        orderId = req.query.id;
        console.log(orderId, " orderid");
        canceldate = new Date();
        const cancel = await orderSchema.updateOne({ _id: orderId, 'order._id': cancelIndex }, { $set: { "order.$.status": "cancelled", "order.$.cancel_date": canceldate } },)
        console.log(cancel);


        const cancelledProduct = await orderSchema.findOne({ _id: orderId })
        console.log(cancelledProduct);
        const x = cancelledProduct.order.filter((y) => {
            return y._id == cancelIndex
        })
        if (cancelledProduct.payment_type == "razorpay") {
            console.log("cancelling razor");
            const refund = (x[0].price - (x[0].price * 0.10))
            const razorcancel = await User.updateOne({ _id: userData }, { $set: { wallet: Number(user.wallet) + Number(x[0].price) } })

        }
        const product = await productSchema.findOne({ _id: x[0].product })
        await productSchema.updateOne({ _id: x[0].product }, { $set: { p_stock: Number(product.p_stock) + Number(x[0].quantity) } })

        res.redirect('/order/review')


    } catch (error) {
        console.log(error);
        res.status(500).send("Server Error");
    }
}

const orderDelivered = async (req, res) => {
    try {
        receiveIndex = req.query.receiveIndex;
        orderId = req.query.id;
        deliveryDate = new Date();
        const delivered = await orderSchema.updateOne({ _id: orderId, 'order._id': receiveIndex }, { $set: { "order.$.status": "delivered", "order.$.delivered_date": deliveryDate } })
        console.log(delivered);

        res.redirect('/order/review')
    } catch (error) {
        console.log(error);
        res.status(500).send("Server Error");
    }
}

const orderReturn = async (req, res) => {
    try {
        index = req.query.returnIndex
        orderId = req.query.id
        today = new Date()
        const returnInfo = await orderSchema.updateOne({ _id: orderId, 'order._id': index }, { $set: { "order.$.return": "requested", "order.$.return_req_date": today } })
        console.log(returnInfo);

        res.redirect('/order/review')
    } catch (error) {
        console.log(error);
        res.status(500).send("Server Error");
    }
}







module.exports = {
    loadSignup,
    insertUser,
    verifyMail,
    loginLoad,
    verifyLogin,
    loadHome,
    loadAccount,
    loadEditProfile,
    updateProfile,
    loadAddDefaultAddress,
    addUserAddress,
    userLogout,
    loadContact,
    loadShop,
    search,
    categoryFilter,
    loadWishlist,
    addToWishList,
    removeFromWishlist,
    productDetails,
    loadCart,
    addToCart,
    incItem,
    decItem,
    deleteFromCart,
    loadAddress,


    loadNewAddress,
    addAddress,
    loadAddressList,
    loadEditAddress,
    updateAddress,
    removeSingleAddress,

    loadPayment,
    getpayment,
    applycoupon,
    couponviamodal,
    razorpay,

    orderPlaced,
    loadSuccess,

    orderReview,
    loadSeperateOrder,
    orderCancel,
    orderDelivered,
    orderReturn



}