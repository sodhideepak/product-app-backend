import bcrypt from "bcrypt";
import mongoose, { Schema } from "mongoose";
import  Jwt  from "jsonwebtoken";
import { Int32 } from "mongodb";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";
// structure of the data to be stored in database
const bookmarkschema= new mongoose.Schema({
    post_id:{
        type: Schema.Types.ObjectId,
        ref: "blog",   
        default: null,
    }, 
    bookamrked_By: {
        type: Schema.Types.ObjectId,
        ref: "user",
      }
    },
    {timestamps:true}
)



bookmarkschema.plugin(mongooseAggregatePaginate);



export const bookmark = mongoose.model("bookmark", bookmarkschema)     