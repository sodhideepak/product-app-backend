import { json } from "express";
import mongoose,{Schema} from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const productschema= new Schema(
    {
    product_barcode:{
        type:String, //cloudinary url
        required:true
    },
    variation_product_barcode:{
        type:Object, 
        trim: true
    },
    // company_prefix:{
    //     type:String, //cloudinary url
    //     trim: true
    // },  
     product_name:{     
        type:String,
        required:true 
    },
    product_keywords:{
        type:Object,
        trim: true
        
    },
    brand_name:{
        type:String,
        required:true
    },
    ingredients:{
        type:Object,
        required: true,
        
    },
    nutritional_value:{
        type:Object,
        required:true
    },
    product_category:{
        type:String,
        required:true
    },
    product_sub_category:{
        type:String,
        required:true
    },
    product_front_image:{
        type:String,
        // required:true
    },
    product_back_image:{
        type:String
    },
    fruitsVegetablesPercentage:{
        type:Number
    },
    allergen:{
        type:Object,
        trim: true
    },
    serving_size:{
        type:String
    },
    measuring_unit:{
        type:String
    },
    fetchCount: {
        type: Number,
        default: 0
      },
    price: {
        type: Number,
        default: 0
    },
    quantity: {
        type: Number,
        default: 0
    },
    rank: {
        type: Number,
        default: 0
    }
//     product_finalscore:{
//        type:Number,
//        required:true
//    },
//    product_nutriscore:{
//        type:String,
//        required:true
       
//    }


// adding route



    
    },{timestamps:true})


    productschema.pre('save', function(next) {
        this.product_keywords = this.product_keywords.map(keyword => keyword.trim());
        next();
      });


    productschema.plugin(mongooseAggregatePaginate)
 
export const product = mongoose.model("final_product",productschema)

// export const product = mongoose.model("producttt",productschema)

