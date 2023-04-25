const mongoose=require('mongoose')

const userSchema=mongoose.Schema({
    name:{
        type: String,
        required: true
    },
    email:{
        type: String,
        required: true
    },
    mobile:{
        type: String,
        required: true
    },
    password:{
        type: String,
        required: true
    },
    repassword:{
        type: String,
        required: true
    },
    is_admin:{
        type: Number,
        required: true
    },
    is_verified:{
        type:Number,
        required:true
    },
    is_blocked:{
        type:Number,
        required:true
    },
    address:{
        type:Array,
        required:true
    },
    wallet:{
        type:Number,
        default:0

    },
    wishlist:[{
        product:{
            type:mongoose.Schema.Types.ObjectId,
            ref:'productList',
            required:true
        }
    }]


})

module.exports = mongoose.model('User',userSchema)