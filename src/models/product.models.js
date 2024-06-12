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
    product_common_names:{
        type:String,
        
    },
    brand_name:{
        type:String,
        required:true
    },
    ingredients:{
        type:String,
        required:true
    },
    nutritional_value:{
        type:String,
        required:true
    },
    product_images:{
        type:String,
        // required:true
    },
    product_category:{
        type:String,
        required:true
    },
    compared_to_products:{
        type:String
       
    }




    
    },{timestamps:true})



    productschema.plugin(mongooseAggregatePaginate)

export const product = mongoose.model("product",productschema)
