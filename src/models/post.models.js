// import mongoose, { Schema } from "mongoose";
import mongoose,{Schema} from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";



const postschema= new mongoose.Schema({
    title:{
        type: String,
        require:true,   
    },
    content:{
        type: String,
        require:true,   
    },
    featured_image:{
        type: String,
        require:true,   
    },
    tags:{
        type: Object 
    },
    author:{
        type: String,
        require:true
    },
    created_At_date:{
        type:String,
        require:true
    },
    created_At_time:{
        type:String,
        require:true
    }
    
    

}
,{timestamps:true}
)

postschema.plugin(mongooseAggregatePaginate);


export const posts = mongoose.model("posts", postschema)     