// require('dotenv').config({path:'./env'})
import dotenv from "dotenv";
import mongoose from "mongoose";
import { DB_NAME } from "../constant.js";
dotenv.config({
    path:"./.env"
})


//  function to connect mongodb database 
mongoose.set("strictQuery", false);
const  connectdb = async()=>{
    try{
        const connectioninstance =await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
        console.log(`mongodb connected :dbhost:${connectioninstance.connection.host} `); // to check databse is sucessfully connected and in return we get database connection host

       
    } 
    catch(error){ 
        console.log("mongodb connection error",error); //to check error which is occoured while connecting
        process.exit(1)
    }

}

export default connectdb