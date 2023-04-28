const User = require('../models/userModel')
const Admin = require('../models/adminModel')
const productSchema = require('../models/productModel')
const categorySchema = require("../models/categoryModel")
const sharp = require('sharp')
const fs = require('fs')
const orderSchema = require('../models/orderModel')
const bannerSchema = require('../models/bannerModel')
const couponSchema = require('../models/couponModel')
const bcrypt = require('bcrypt')

let message;
let sweetalert
let alert


const loadAddProduct = async (req, res) => {
    try {
        const c_details = await categorySchema.find({})
        res.render('add_product', { c_details })

    } catch (error) {
        console.log(error);
        res.status(500).send("Server Error");

    }
}

// const insertProduct = async (req, res) => {
//     try {

//         const validExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp']; // valid image extensions
//         const images = [];

//         for (let i = 0; i < req.files.length; i++) {
//             const extension = req.files[i].filename.split('.').pop().toLowerCase(); // get the file extension
//             if (validExtensions.includes(extension)) { // check if the file extension is valid
//                 images.push(req.files[i].filename) // add the image filename to the array
//             }
//         }

//         // let images = []
//         // for (let i = 0; i < req.files.length; i++) {
//         //     images[i] = req.files[i].filename
//         // }
//         console.log("insert product start");
//         if (images.length < 1) {
//             sweetalert = "success"
//             alert = 'please select image or check valid extensions'
//             res.redirect('/admin/productlist')
//             sweetalert = null

//         } else {
//             const findCategory = await categorySchema.findOne({ category: req.body.category })
//             console.log(findCategory);
//             const products = new productSchema({
//                 p_name: req.body.p_name,
//                 p_brand: req.body.p_brand,
//                 p_description: req.body.p_description,
//                 p_price: req.body.p_price,
//                 p_stock: req.body.p_stock,
//                 images: images,
//                 p_catogory: findCategory._id,
//                 p_is_flaged: 0

//             });
//             const productData = await products.save();
//             console.log(productData);

//             if (productData) {

//                 sweetalert = "success"
//                 alert = 'product added success'
//                 res.redirect('/admin/productlist')
//                 sweetalert = null




//             } else {
//                 res.render('add_product', { message: "something went wrong" })
//             }

//         }

//     } catch (error) {
//         console.log(error);
//         res.status(500).send("Server Error");

//     }
// }
const insertProduct = async (req, res) => {
    try {

        const validExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp']; // valid image extensions
       

        // for (let i = 0; i < req.files.length; i++) {
        //     const extension = req.files[i].filename.split('.').pop().toLowerCase(); // get the file extension
        //     if (validExtensions.includes(extension)) { // check if the file extension is valid
        //         let image = req.files.map((file) => file);
        //         console.log(image, 'ldshfaidhsfo');
        //         for (i = 0; i < req.files.length; i++) {
        //             let path = image[i].path;
        //             const processImage = new Promise((resolve, reject) => {
        //                 sharp(path)
        //                     .rotate()
        //                     .resize(253, 200)
        //                     .toFile("public/product-images/" + image[i].filename, (err) => {
        //                         sharp.cache(false);
        //                         if (err) {
        //                             console.log(err);
        //                             reject(err);
        //                         } else {
        //                             console.log(`Processed file: ${path}`);
        //                             resolve();
        //                         }
        //                     });
        //             });
        //             processImage
        //                 .then(() => {
        //                     fs.unlink(path, (err) => {
        //                         if (err) {
        //                             console.log(err);
        //                         } else {
        //                             console.log(`Deleted file: ${path}`);
        //                         }
        //                     });
        //                 })
        //                 .catch((err) => {
        //                     console.log(err);
        //                 });

        //         } // add the image filename to the array
        //     }
        // }

        let images = []
        for (let i = 0; i < req.files.length; i++) {
            images[i] = req.files[i].filename
        }
        console.log("insert product start");
        if (images.length < 1) {
            sweetalert = "success"
            alert = 'please select image or check valid extensions'
            res.redirect('/admin/productlist')
            sweetalert = null
        }

        
            const findCategory = await categorySchema.findOne({ category: req.body.category })
            const products = new productSchema({
                p_name: req.body.p_name,
                p_brand: req.body.p_brand,
                p_description: req.body.p_description,
                p_price: req.body.p_price,
                p_stock: req.body.p_stock,
                images:images,
                p_catogory: findCategory._id,
                p_is_flaged: 0

            });
            const productData = await products.save();
          

            if (productData) {

                sweetalert = "success"
                alert = 'product added success'
                res.redirect('/admin/productlist')
                sweetalert = null




            } else {
                res.render('add_product', { message: "something went wrong" })
            }

        

    } catch (error) {
        console.log(error);
        res.status(500).send("Server Error");

    }
}

const loadProductList = async (req, res) => {
    try {
        // let currentPage=1
        // if(req.query.currentpage){
        //     currentPage=req.query.currentpage
        // }
        // const limit=10
        // offset=(currentPage-1)*limit
        // const orderdetails = await orderschema.find({})
        // const orderData=await orderschema.find({}).skip(offset).limit(limit)
        // const totalOrders=orderdetails.length
        // const totalPage=Math.ceil(totalOrders/limit)

        // res.render('adminhome', { admin: userdetails ,orderData,currentPage,totalPage})

        let currentPage = 1
        if (req.query.currentpage) {
            currentPage = req.query.currentpage
        }
        const limit = 5
        offset = (currentPage - 1) * limit
        const p_details1 = await productSchema.find({})
        const p_details = await productSchema.find({}).skip(offset).limit(limit)


        const totalProducts = p_details1.length
        const totalPage = Math.ceil(totalProducts / limit)

        res.render('product_list', { p_details, currentPage, totalPage, alert })
        alert = null


        // const p_details = await productSchema.find({})
        // res.render('product_list', { p_details, alert })
        // alert = null

    } catch (error) {
        console.log(error);
        res.status(500).send("Server Error");

    }
}

const loadEditProduct = async (req, res) => {
    try {
        const id = req.query.id
        const productData = await productSchema.findById({ _id: id })

        if (productData) {
            res.render('edit_product', { p_details: productData })
        } else {
            res.redirect('/admin/editproduct')
        }

    } catch (error) {
        console.log(error);
        res.status(500).send("Server Error");
    }
}

const updateProduct = async (req, res) => {

    try {
        const id = req.query.id
        console.log(req.body);
        console.log('updating product');
        const updateProduct = await productSchema.findByIdAndUpdate({ _id: id }, { $set: { p_name: req.body.p_name, p_brand: req.body.p_brand, p_price: req.body.p_price, p_stock: req.body.p_stock } })

        let images = []
        if (req.files.length > 0) {
            for (let i = 0; i < req.files.length; i++) {
                images[i] = req.files[i].filename
            }


            await productSchema.findByIdAndUpdate({ _id: id }, { $push: { images: images } })

        }

        console.log(updateProduct);
        if (updateProduct) {
            alert = 'product updated success'
            res.redirect('/admin/productlist')
            sweetalert = null
        } else {
            res.redirect('/admin/productlist')
        }

    } catch (error) {
        console.log(error);
        res.status(500).send("Server Error");

    }
}

const deleteProduct = async (req, res) => {
    try {
        console.log("szdxfcvbn delete prdt");
        const Data = await productSchema.findOne({ _id: req.query.id })
        if (Data.p_is_flaged == 0) {
            const deleteInfo = await productSchema.updateOne({ _id: req.query.id }, { $set: { p_is_flaged: 1 } })
            console.log(deleteInfo);
            res.redirect('/admin/productlist')
        }
    } catch (error) {
        console.log(error);
        res.status(500).send("Server Error");
    }
}

module.exports = {
    loadAddProduct,
    insertProduct,
    loadProductList,
    loadEditProduct,
    updateProduct,
    deleteProduct,
}