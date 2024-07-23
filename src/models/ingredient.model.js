import mongoose, { Schema } from "mongoose";



const ingredientschema= new mongoose.Schema({
    name:{
        type: String,
    },
    keywords:{
        type: Object,
    },
    purpose:{
        type: String,
    },
    ingredients:{
        type: Object,
    },
    description:{
        type: String,
    }
    }, { versionKey: false }
)


export const ingredient = mongoose.model("ingredient", ingredientschema)     