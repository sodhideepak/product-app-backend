import bcrypt from "bcrypt";
import mongoose, { Schema } from "mongoose";
import  Jwt  from "jsonwebtoken";
import { Int32 } from "mongodb";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";
// structure of the data to be stored in database
const commentschema= new mongoose.Schema({
    
        content: {
          type: String,
          required: true,
        },
        postId: {
          type: Schema.Types.ObjectId,
          ref: "posts",
        },
        author: {
          type: Schema.Types.ObjectId,
          ref: "user",
        },     
      },
      { timestamps: true }
)


export const comment = mongoose.model("comment", commentschema)     