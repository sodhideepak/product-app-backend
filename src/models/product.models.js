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
        type:string,
        required:true
    },
    nutritional_value:{
        type:string,
        required:true
    },
    product_images:{
        type:string,
        required:true
    },
    product_category:{
        type:string,
        required:true
    },
    compared_to_products:{
        type:string,
       
    }




    
    },{timestamps:true})



videoschema.plugin(mongooseAggregatePaginate)

export const product = mongoose.model("product",productschema)
