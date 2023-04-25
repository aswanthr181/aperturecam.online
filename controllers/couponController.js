const User = require('../models/userModel')
const Admin = require('../models/adminModel')
const productSchema = require('../models/productModel')
const categorySchema = require("../models/categoryModel")
const orderSchema = require('../models/orderModel')
const bannerSchema = require('../models/bannerModel')
const couponSchema = require('../models/couponModel')
const bcrypt = require('bcrypt')

let message = null;
let sweetalert






const loadCoupons = async (req, res) => {
    try {

        const coupon = await couponSchema.find({}).sort({ _id: -1 })
        res.render('coupon_list', { message, coupon })
        message=null

    } catch (error) {
        console.log(error);
        res.status(500).send("Server Error");
    }
}

const loadAddCoupons = async (req, res) => {
    try {
        const d = new Date()
        const today = d.getFullYear() + '-0' + (d.getMonth() + 1) + '-' + d.getDate()
        console.log(today);
        res.render('add_coupon', { message, today, d })
        message = null
    } catch (error) {
        console.log(error);
        res.status(500).send("Server Error");
    }
}

const insertCoupon = async (req, res) => {
    try {
        console.log(req.body);
        console.log(req.body.cid);

        const { Name, cid, date, minAmount, maxAmount, discount, maxdiscount, number } = req.body
        const findcoupon = await couponSchema.findOne({ couponId: cid })
        if (findcoupon) {
            message = 'coupon already exist'
            res.redirect('/admin/addcoupon')

        } else {

            await couponSchema.insertMany({ couponId: cid, expiryDate: date, maxAmount: maxAmount, minAmount: minAmount, discount: discount, no_of_Coupon: number, max_discount: maxdiscount })

            message = 'coupon addedd success'
            res.redirect('/admin/coupon')

        }
    } catch (error) {
        console.log(error);
        res.status(500).send("Server Error");

    }
}
const loadEditCoupon = async (req, res) => {
    try {
        const d = new Date()
        const today = d.getFullYear() + '-0' + (d.getMonth() + 1) + '-' + d.getDate()
        id = req.query.id
        const coupons = await couponSchema.findOne({ _id: id })
        res.render('edit_coupon', { coupons, today, message })
        message = null
    } catch (error) {
        console.log(error);
        res.status(500).send("Server Error");
    }
}
const updateCoupon = async (req, res) => {
    try {

        id = req.query.id
        console.log("sarting update coupon");
        const c = await couponSchema.findOne({ _id: id })
        same = c.couponId

        const { cid, date, minAmount, maxAmount, discount, maxdiscount, number } = req.body

        console.log("ujual");
        console.log(id);
        const updateC = await couponSchema.updateOne({ _id: id }, { $set: { couponId: cid, expiryDate: date, maxAmount: maxAmount, minAmount: minAmount, discount: discount, no_of_Coupon: number, max_discount: maxdiscount } })
        console.log(updateC);


        message = 'coupon updated success'
        res.redirect('/admin/coupon')



    } catch (error) {

        console.log(error);
        res.status(500).send("Server Error");
    }
}

const deleteCoupon = async (req, res) => {
    try {
        id = req.query.id
        await couponSchema.deleteOne({ _id: id })
        message = "are you sure"
        res.redirect('/admin/coupon')
    } catch (error) {
        console.log(error);
        res.status(500).send("Server Error");
    }
}


module.exports = {

    loadCoupons,
    loadAddCoupons,
    insertCoupon,
    loadEditCoupon,
    deleteCoupon,
    updateCoupon
}