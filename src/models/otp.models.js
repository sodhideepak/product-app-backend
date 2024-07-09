import bcrypt from "bcrypt";
import mongoose, { Schema } from "mongoose";
import  Jwt  from "jsonwebtoken";
import { Int32 } from "mongodb";
// structure of the data to be stored in database
const otpschema= new mongoose.Schema({
    email:{
        type : String,
        required:true    
    },
    Otp:{
        type: String,
        required: true
        },
    expiresAt:{
        type : Date,
        required: true
    }
})


export const otp = mongoose.model("otp", otpschema)     