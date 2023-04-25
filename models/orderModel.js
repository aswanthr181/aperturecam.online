const mongoose=require('mongoose')
const orderSchema=mongoose.Schema({
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true
    },
    order:[{
        product:{
            type:mongoose.Schema.Types.ObjectId,
            ref:'productList',
            require:true
        },
        price:{
            type:Number,
            require:true
        },
        quantity:{
            type:Number,
            require:true 
        },
        
        
        
        status:{
            type:String,
            require:true,
            default:'pending'
        },
        
        order_date:{
            type:Date,
            require:true,
            
        },
        arriving_date:{
            type:String,
            require:true,
        },
        cancel_date:{
            type:Date,
            require:true,
            default:0
        },
        delivered_date:{
            type:Date,
            require:true,
            default:0
        },
        return:{
            type:String,
            require:true,
            default:null
        },
        return_req_date:{
            type:Date,
            require:true
        }
        
    }],
    address:{
        type:Object,
        require:true
    },
    payment_type:{
        type:String,
        require:true
    },
    subTotal:{
        type:Number,
        require:true
    },
    grandTotal:{
        type:Number,
        require:true
    }
})

module.exports=mongoose.model('order',orderSchema)