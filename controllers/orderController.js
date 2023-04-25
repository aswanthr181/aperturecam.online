const User = require('../models/userModel')
const Admin = require('../models/adminModel')
const productSchema = require('../models/productModel')
const categorySchema = require("../models/categoryModel")
const orderSchema = require('../models/orderModel')
const bannerSchema = require('../models/bannerModel')
const couponSchema = require('../models/couponModel')
const bcrypt = require('bcrypt')

let message;
let sweetalert


const loadOrderList = async (req, res) => {
    try {
        const orderDetails = await orderSchema.find({}).sort({_id:-1}).populate("order.product")

        res.render('order_list', { orderDetails })
    } catch (error) {
        console.log(error);
        res.status(500).send("Server Error");
    }
}

const loadOrderManage = async (req, res) => {
    try {
        const userData = req.session.user_id
        const user = await User.findOne({ _id: userData })

        orderId = req.query.id
        console.log(orderId,"dxfcgvhbjn======");

        const itemData = await orderSchema.findOne({ _id: orderId }).populate("order.product")
        console.log(itemData);
        res.render('order_manage', { itemData })
    } catch (error) {
        console.log(error);
        res.status(500).send("Server Error");
    }
}

const shipOrder = async (req, res) => {
    try {

        shipIndex = req.query.shipIndex;
        orderId = req.query.id;
        Shipdate = new Date();
        const cancel = await orderSchema.updateOne({ _id: orderId, 'order._id': shipIndex }, { $set: { "order.$.status": "shipped", "order.$.cancel_date": Shipdate } },)
        console.log(cancel);

        res.redirect('/admin/orderlist')


    } catch (error) {
        console.log(error);
        res.status(500).send("Server Error");
    }
}

const acceptReturn = async (req, res) => {
    try {
        index = req.query.returnIndex;
        orderId = req.query.id;
        today = new Date();
        const orderview=await orderSchema.findOne({_id: orderId})
        console.log(orderview,"123456790");
        const userid=orderview.userId
        const userinfo= await User.findOne({_id:userid})
        console.log(userinfo,"sdfghjk=========ghij");
        const returnAccept = await orderSchema.updateOne({ _id: orderId, 'order._id': index }, { $set: { "order.$.return": "accepted" } })

        const cancelledProduct = await orderSchema.findOne({ _id: orderId })
        console.log(cancelledProduct);
        const x = cancelledProduct.order.filter((y) => {
            return y._id == index
        })
        if (x[0].payment_type == "razorpay") {
            console.log("cancelling razor");
            const refund = (x[0].price - (x[0].price * 0.10))
            const razorcancel = await User.updateOne({ _id: userid }, { $set: { wallet: Number(user.wallet) + Number(refund) } })

        }

        res.redirect('/admin/orderlist')
    } catch (error) {
        console.log(error);
        res.status(500).send("Server Error");
    }
}


module.exports={
    loadOrderList,
    loadOrderManage,
    shipOrder,
    acceptReturn,
}