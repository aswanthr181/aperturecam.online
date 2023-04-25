const mongoose=require('mongoose')
const cartSchema=mongoose.Schema({
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User'
    },
    item:[{
        product:{
            type:mongoose.Schema.Types.ObjectId,
            ref:'productList',
            required:true
        },
        quantity:{
            type:Number,
            default:1,
            required:true
        },
        price:{
            type:Number,
            required:true
        },
        total:{
            type:Number,
            required:true
        }
    }],
    
    subTotalPrice:{
        type:Number
    },
    grandTotalPrice:{
        type:Number
    }

})

module.exports=mongoose.model('cart',cartSchema)