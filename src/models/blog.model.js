import mongoose, { Schema } from "mongoose";




const blogschema= new mongoose.Schema({
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


export const blog = mongoose.model("blog", blogschema)     