const mongoose=require('mongoose')

const categorySchema=mongoose.Schema({
    category:{
        type:String,
        uppercase: true,
        required:true
    }
});
module.exports=mongoose.model("category",categorySchema);