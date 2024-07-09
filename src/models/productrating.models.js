import { json } from "express";
import mongoose,{Schema} from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const product_rating_schema= new Schema(
    {
    product_id:{
        type:Schema.Types.ObjectId,
        ref: "product_data",
        required:true
    },
     product_finalscore:{
        type:Number,
        required:true
    },
    product_nutriscore:{
        type:String,
        required:true
        
    }



    
    }
    // ,{timestamps:true}
)



    product_rating_schema.plugin(mongooseAggregatePaginate)

export const productrating = mongoose.model("productrating",product_rating_schema)
