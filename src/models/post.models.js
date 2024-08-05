import mongoose, { Schema } from "mongoose";




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
        type: String 
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
    
    

},{timestamps:true}
)


export const posts = mongoose.model("posts", postschema)     