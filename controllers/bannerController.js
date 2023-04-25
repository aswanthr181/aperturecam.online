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



const loadBannerAdd = async (req, res) => {
    try {
        const banner = await bannerSchema.find({}).sort({_id:-1})
        res.render('add_banner', { banner })
    } catch (error) {
        console.log(error);
    }
}

const uploadBanner = async (req, res) => {
    try {

        let image = []
        for (let i = 0; i < req.files.length; i++) {
            image[i] = req.files[i].filename
        }
        console.log("insert banner start");

        const Banner = new bannerSchema({
            description: req.body.description,
            title: req.body.title,

            image: image

        });
        const BannerData = await Banner.save();
        console.log(BannerData);

        const banner = await bannerSchema.find({}).sort({_id:-1})
        res.render('add_banner', { banner })

    } catch (error) {
        console.log(error);
    }
}

const deleteBanner =async(req,res)=>{
    try {
        id=req.query.id
        const Banner=await bannerSchema.findOne({_id:id})
        console.log(Banner);
        await bannerSchema.deleteOne({_id:id})
        res.redirect('/admin/banner')


        
    } catch (error) {
        console.log(error);
    }
}
const editBanner=async(req,res)=>{
    try {
        id=req.query.id
        banner=await bannerSchema.findOne({_id:id})
        res.render('edit_banner',{banner})
    } catch (error) {
        console.log(error);
        res.status(500).send("Server Error");
    }
}
const updateBanner=async(req,res)=>{

    try {
        id=req.query.id
        console.log(req.body,"gbhjk");
        const title=req.body.title
        const description=req.query.description
        const updateB=await bannerSchema.updateOne({_id:id},{$set:{title:title,description:description}})
        console.log(updateB);
        res.redirect('/admin/banner')
    } catch (error) {
        
    }
   
}

module.exports={
    loadBannerAdd,
    uploadBanner,
    deleteBanner,
    editBanner,
    updateBanner
}