import { json } from "express";
import mongoose,{Schema} from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const productschema= new Schema(
    {
    product_barcode:{
        type:String, //cloudinary url
        required:true
    },
     product_name:{
        type:String,
        required:true
    },
    product_keywords:{
        type:Object,
        
    },
    brand_name:{
        type:String,
        required:true
    },
    ingredients:{
        type:Object,
        required:true
    },
    nutritional_value:{
        type:Object,
        required:true
    },
    product_front_image:{
        type:String,
        // required:true
    },
    product_back_image:{
        type:String
    },
    product_category:{
        type:String,
        required:true
    }




    
    },{timestamps:true})



    productschema.plugin(mongooseAggregatePaginate)

export const product = mongoose.model("product",productschema)
