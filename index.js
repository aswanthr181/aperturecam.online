const express=require('express')
const app=express()
const nocache=require('nocache')
const dotenv=require('dotenv')
const mongoose=require('mongoose')
const path=require('path')
const userRoute=require('./routes/userRoute');
const adminRoute=require('./routes/adminRoute');
const error=require('./routes/404error')
require('dotenv').config()
mongoose.connect(process.env.DB_CONNECTION_STRING)



app.use(express.static(__dirname + '/public'));
app.set('view engine','ejs'); 
app.use(nocache())

app.use('/',userRoute);
app.use('/admin',adminRoute)
app.use('/',error)

app.listen(process.env.port,function(){
    console.log("server is running on port :4000")


})
