import mongoose, { Schema } from "mongoose";




const consumptionschema= new mongoose.Schema({
    product_id:{
        type: Schema.Types.ObjectId,
        ref: "product_data",   
    },
    consumed_By: {
        type: Schema.Types.ObjectId,
        ref: "user"
    },
    consumed_At_day: {
        type: Date,
    },
    consumed_At_time: {
        type: String,
        
    },
    consumed_At:{ 
        type: Date, 
        default: Date.now 
    }
    

}
)


export const consumption = mongoose.model("consumption", consumptionschema)     