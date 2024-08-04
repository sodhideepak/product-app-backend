import mongoose, { Schema } from "mongoose";




const postschema= new mongoose.Schema({
    content:{
        type: String,
        require:true,   
    },
    author: {
        type: String,
        require:true
    },
    createdAt:{
        type:Date,
        require:true
    }
    
    

},{timestamps:true}
)


export const posts = mongoose.model("posts", postschema)     