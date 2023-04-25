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



const loadLogin = async (req, res) => {
    try {

        res.render('login');

    } catch (error) {
        console.log(error);
        res.status(500).send("Server Error");

    }
}
const verifyLogin = async (req, res) => {
    try {

        const email = req.body.email;
        const password = req.body.password;

        // const admindata = await User.findOne({ email: email });
        const admindata = await Admin.findOne({ email: email })
        if (admindata) {
            const passwordMatch = await bcrypt.compare(password, admindata.password)
            if (passwordMatch) {

                // if (admindata.is_admin === 0) {
                //     res.render('login', { message: "sorry you are not an admin" })
                // } else {
                req.session.admin_id = admindata._id;
                res.redirect("/admin/home");
                // }
            } else {
                res.render('login', { message: "password is incorrect" })
            }

        } else {
            res.render('login', { message: "email is incorrect" })
        }

    } catch (error) {
        console.log(error);
        res.status(500).send("Server Error");
    }
}

const addmindashboard = async (req, res) => {
    try {
        id = req.session.admin_id
        const adminData = await Admin.findOne({ _id: id })

        res.render('home', { adminData })


    } catch (error) {
        console.log(error);
        res.status(500).send("Server Error");
    }
}

const logout = async (req, res) => {
    try {
        id = req.session.admin_id = null
        res.redirect('/admin');

    } catch (error) {
        console.log(error);
        res.status(500).send("Server Error");

    }
}
const loadDashboard = async (req, res) => {
    try {
        if (req.query.search) {
            search = req.query.search
            const userdata = await User.find({
                is_admin: 0,
                $or: [
                    { name: { $regex: '.*' + search + '.*' } },
                    { email: { $regex: '.*' + search + '.*' } }

                ]
            })
            res.render('user_list', { users: userdata })
        } else {
            const userdata = await User.find({ is_admin: 0 })
            res.render('user_list', { users: userdata });

        }
    } catch (error) {
        console.log(error);
        res.status(500).send("Server Error");

    }
}

const blockUser = async (req, res) => {
    try {
        user_id = req.query.id
        const Data = await User.findOne({ _id: req.query.id })
        let id = Data._id
        console.log(id);
        if (Data.is_blocked == 0) {
            const updateInfo = await User.updateOne({ _id: req.query.id }, { $set: { is_blocked: 1 } })
            req.session.user_id = null
            console.log(updateInfo);
            res.redirect('/admin/userlist')
        } else {
            const updateInfo = await User.updateOne({ _id: req.query.id }, { $set: { is_blocked: 0 } })
            console.log(updateInfo);
            res.redirect('/admin/userlist')

        }

    } catch (error) {
        console.log(error);
        res.status(500).send("Server Error");

    }
}





const loadAddCategory = async (req, res) => {
    try {
        res.render('add_category', { message, sweetalert })
        sweetalert = null
    } catch (error) {
        console.log(error);
        res.status(500).send("Server Error");

    }
}
let alert
const loadCategoryList = async (req, res) => {
    try {
        const c_details = await categorySchema.find({})
        res.render('category_list', { c_details, alert })
        alert = null
    } catch (error) {
        console.log(error);
        res.status(500).send("Server Error");
    }
}

const insertCategory = async (req, res) => {
    try {

        const findCategoryExist = await categorySchema.findOne({ category: req.body.category })
        if (findCategoryExist) {
            sweetalert = "exist"
            res.render('add_category', { sweetalert })
            sweetalert = null

        } else if (req.body.category == '') {
            sweetalert = "null"
            res.render('add_category', { sweetalert })
            sweetalert = null

        } else {
            const categorys = new categorySchema({
                category: req.body.category
            })


            const categoryData = await categorys.save();
            console.log(categoryData);

            if (categoryData) {
                sweetalert = "success"
                res.render('add_category', { sweetalert })
                sweetalert = null
            } else {
                res.render('add_category', { sweetalert: "something went wrong" })
                sweetalert = null
            }
        }
    } catch (error) {
        console.log(error.message);

    }
}
const editCategoryLoad = async (req, res) => {
    try {
        const id = req.query.id
        const categoryData = await categorySchema.findById({ _id: id })
        console.log(categoryData);
        if (categoryData) {
            res.render('edit_category', { c_details: categoryData, sweetalert })
        } else {
            res.redirect('/admin/categorylist')
        }
    } catch (error) {
        console.log(error.message);
    }
}

const updateCategory = async (req, res) => {
    try {

        id = req.query.id

        const findCategoryExist = await categorySchema.findOne({ category: req.body.category })
        if (findCategoryExist) {
            sweetalert = "exist"
            alert = 'category already exsist'
            res.redirect('/admin/categorylist')
            sweetalert = null

        } else {

            const updatedC = await categorySchema.findByIdAndUpdate({ _id: id }, { $set: { category: req.body.category } })
            console.log(updatedC);
            if (updatedC) {
                sweetalert = "success"
                alert = 'category updated success'
                res.redirect('/admin/categorylist')
                sweetalert = null

            }

        }
        res.redirect('/admin/categorylist')

    } catch (error) {
        console.log(error);
        res.status(500).send("Server Error");
    }
}








const loadDashboards = async (req, res) => {
    try {
        id = req.session.admin_id
        const adminData = await Admin.findOne({ _id: id })

        const userData = await User.find()
        const usersLength = userData.length
        const today = new Date()
        
        today.setHours(0, 0, 0, 0)
        const weekAgo = new Date(today);
        weekAgo.setDate(today.getDate() - 7);

        const yearAgo = new Date(today);
        yearAgo.setFullYear(today.getFullYear() - 1);

        const dailySalesReport = await orderSchema.aggregate([
            {
                $match: {
                    "order.status": "delivered",
                    "order.delivered_date": { $gte: today, $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000) }
                },
            },
            { $unwind: "$order" },
            {
                $match: {
                    "order.status": "delivered",
                    "order.delivered_date": { $gte: today, $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000) }
                },
            },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$order.delivered_date" } },
                    totalsales: { $sum: "$grandTotal" },
                    totalItemsSold: { $sum: "$order.quantity" },
                },
            },
            { $sort: { _id: 1 } },
        ]);
        // ////////
        
        
        /////////////////////

        const weeklySalesReport = await orderSchema.aggregate([
            {
                $match: {
                    "order.status": "delivered",
                    "order.delivered_date": { $gte: weekAgo, $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000) },
                },
            },
            { $unwind: "$order" },
            {
                $match: {
                    "order.status": "delivered",
                    "order.delivered_date": { $gte: weekAgo, $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000) },
                },

            },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$order.delivered_date" } },
                    totalSales: { $sum: "$grandTotal" },
                    totalItemsSold: { $sum: "$order.quantity" },
                },
            },
            { $sort: { _id: 1 } },

        ]);
        /////////////
        
        
        ////////////

        const yearlySalesReport = await orderSchema.aggregate([
            {
                $match: {
                    "order.status": "delivered",
                    "order.delivered_date": { $gte: yearAgo, $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000) },
                },
            },
            { $unwind: "$order" },
            {
                $match: {
                    "order.status": "delivered",
                    "order.delivered_date": { $gte: yearAgo, $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000) },
                },
            },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$order.delivered_date" } },
                    totalSales: { $sum: "$grandTotal" },
                    totalItemsSold: { $sum: "$order.quantity" },
                },
            },
            { $sort: { _id: 1 } },

        ]);
        /////////////
        
        
        /////////////////////////

        const currentDate = new Date()
        const currentMonth = currentDate.getMonth()
        const currentYear = currentDate.getFullYear()
        const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate()

        const monthlyStart = new Date(currentYear, currentMonth, 1).toLocaleString("en-US", { timeZone: "Asia/Kolkata" });
        const monthlyEnd = new Date(currentYear, currentMonth, daysInMonth);

        const monthlySalesData = await orderSchema.find({
            'order.delivered_date': {
                $gte: monthlyStart,
                $lte: monthlyEnd
            },
        });

        const dailySalesDetails = []
        for (let i = 2; i <= daysInMonth + 1; i++) {
            const date = new Date(currentYear, currentMonth, i)
            const salesOfDay = monthlySalesData.filter((order) => {
                return new Date(order.order[0].delivered_date).toDateString() === date.toDateString()
            })
            const totalSalesOfDay = salesOfDay.reduce((total, order) => {
                return total + order.grandTotal;
            }, 0);
            let productCountOfDay = 0;
            salesOfDay.forEach((order) => {
                productCountOfDay += order.order[0].quantity;
            });

            dailySalesDetails.push({ date: date, totalSales: totalSalesOfDay, totalItemsSold: productCountOfDay });
        }

        const a=await orderSchema.find()
        console.log("==========",a,"=========");
        const order = await orderSchema.aggregate([
            {
                $group: {
                    _id: "$payment_type",
                    count: { $sum: 1 },
                },
            },
            {
                $group: {
                    _id: null,
                    codCount: {
                        $sum: {
                            $cond: { if: { $eq: ["$_id", "cod"] }, then: "$count", else: 0 },
                        },
                    },
                    razorpayCount: {
                        $sum: {
                            $cond: { if: { $eq: ["$_id", "razorpay"] }, then: "$count", else: 0 },
                        },
                    },
                    walletCount: {
                        $sum: {
                            $cond: { if: { $eq: ["$_id", "wallet"] }, then: "$count", else: 0 },
                        },
                    },
                },
            },
            {
                $project: {
                    _id: 0,
                    codCount: 1,
                    razorpayCount: 1,
                    walletCount: 1,
                },
            },
            
        ]);

        const order1 = await orderSchema.aggregate([
            {
                $group: {
                    _id: "$payment_type",
                    count: { $sum: 1 }
                }
            }])

        const fullorder=await orderSchema.find().populate('order.product')
        

        
        const orders2 = await orderSchema.find().distinct('order.payment_type');

        res.render("home", {
            dailySalesReport,
            weeklySalesReport,
            yearlySalesReport,
            message,
            usersLength,
            dailySalesDetails,
            order,
            adminData
        }),
            (message = null);

    } catch (error) {
        console.log(error);
        res.status(500).send("Server Error");
    }
}
const loadSales = async (req, res) => {
    try {

        const filterData = await orderSchema.find({ order: { $elemMatch: { status: "delivered" } } }).populate('order.product')
        
        res.render("sales_report", { filterData })
    } catch (error) {
        console.log(error);
        res.status(500).send("Server Error");
    }
}

const sales = async (req, res) => {
    try {
        const { first, last } = req.body;
        const filterData = await orderSchema.find({
            'order.status': "delivered",
            'order.cancel_date': { $gte: first, $lte: last }
        }).populate('order.product')
        res.render('sales_report', { filterData });

    } catch (error) {
        console.log(error);
        res.status(500).send("Server Error");
    }
}

module.exports = {
    loadLogin,
    verifyLogin,
    addmindashboard,
    
    blockUser,
    logout,
    loadDashboard,
    

    loadAddCategory,
    loadCategoryList,
    insertCategory,
    editCategoryLoad,
    updateCategory,

    

    

    loadDashboards,

    loadSales,
    sales


}