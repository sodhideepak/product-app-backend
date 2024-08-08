import bcrypt from "bcrypt";
import mongoose, { Schema } from "mongoose";
import  Jwt  from "jsonwebtoken";
import { Int32 } from "mongodb";
// structure of the data to be stored in database
const likeschema= new mongoose.Schema({
    product_id:{
        type: Schema.Types.ObjectId,
        ref: "product",   
        default: null,
    },
    post_id:{
        type: Schema.Types.ObjectId,
        ref: "blog",   
        default: null,
    }, 
    comment_id:{
        type: Schema.Types.ObjectId,
        ref: "blog",   
        default: null,
    },
    likedBy: {
        type: Schema.Types.ObjectId,
        ref: "user",
      }
    },
    {timestamps:true}
)


export const like = mongoose.model("like", likeschema)     