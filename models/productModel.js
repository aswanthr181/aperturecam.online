const mongoose=require('mongoose')

const productSchema=mongoose.Schema({

    p_name:{
        type:String,
        required:true
    },
    p_brand:{
        type:String,
        require:true
    },
    p_description:{
        type:String,
        require:true
    },
    p_price:{
        type:Number,
        required:true
    },
    p_stock:{
        type:Number,
        required:true
    },
    images:{
        type:Array,
        required:true
    },
    p_catogory:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'category'
    },
    p_is_flaged:{
        type:Number,
        required:true
    }

})

module.exports=mongoose.model('productList',productSchema)