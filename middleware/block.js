const userSchema = require('../models/userModel')

 const is_blocked = async(req,res,next)=>{
    try{
        const id = req.session.user_id
        const userdetails = await userSchema.findOne({_id:id})
        if(userdetails){
            if(userdetails.is_blocked==1){
                blocked ="Admin blocked this Account"
                res.redirect('/logout')
                
            }
            else{
                next()
            }
        }
        else{
            next()
        }
    }
    catch(error){
        console.log(error)
    }
 }



 module.exports = {is_blocked}