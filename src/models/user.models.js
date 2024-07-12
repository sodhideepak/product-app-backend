import bcrypt from "bcrypt";
import mongoose, { Schema } from "mongoose";
import  Jwt  from "jsonwebtoken";
import { Int32 } from "mongodb";
// structure of the data to be stored in database
const userschema= new mongoose.Schema({
    phone_number:{
        type : String,
        required:true,
        trim: true,
       
        
    },
    email:{
        type: String,
        required: true,
        trim: true,
        lowercase: true,
      
    },
    fullname:{
        type : String,
        required: true,
        trim: true,
    },
    DOB:{
        type: Date,
        required: true,
       
    },
    is_email_verified:{
        type: Boolean,
        required: true,
       
    },
    
    password:{
        type : String,
        required:[true,"password is required"]
    },
    refreshToken:{
        type:String

    },
    token:{
        type:String,
        default:""
    }

},{timestamps:true})

userschema.pre("save",async function (next){
    if (!this.isModified("password")) return next() 
    this.password=await bcrypt.hash(this.password,10)
    // const Bmi=parseInt(this.weight)/((parseInt(this.height)/100)**2)
    // this.bmi=parseInt(this.weight)/((parseInt(this.height)/100)**2)
    // this.bmi=Bmi.toFixed(2)
    next()
    // if (!this.isModified("weight")) return next() 
    // this.bmi=parseInt(weight)/((parseInt(height)/100)**2)
   
    // next()
    
})

userschema.methods.isPasswordcorrect= async function(password){
    return await bcrypt.compare(password,this.password)
} 


userschema.methods.generateAccessToken=function(){
    return Jwt.sign({
        _id:this._id,
        email: this.email,
        phone_number: this.phone_number        
    },
    process.env.Access_Token_Secret,
    {
        expiresIn : process.env.Access_Token_Expiry
    })
}



userschema.methods.generateRefreshToken=function(){
    return Jwt.sign({
        _id:this._id,
        
    },
    process.env.Refresh_Token_Secret,
    {
        expiresIn : process.env.Refresh_Token_Expiry
    })
}


export const user = mongoose.model("user", userschema)     