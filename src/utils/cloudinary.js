import { v2 as cloudinary } from 'cloudinary';
import { response } from 'express';
import fs from "fs";

//  cloudinary configuration function which is used to uplad file on server
cloudinary.config({ 
    cloud_name: process.env.Cloudinary_Cloud_Name, 
    api_key: process.env.Cloudinary_API_Key, 
    api_secret: process.env.Cloudinary_API_Secret,
    secure: true
  });


  const uploadoncloudinary = async (localfilepath)=>{
    try{
        if(!localfilepath) return null
        cloudinary.uploader.upload(localfilepath,
           { resourse_type:"auto"})

           const response =await cloudinary.uploader.upload(localfilepath,
            { resourse_type:"auto"})

            fs.unlinkSync(localfilepath) 

        // console.log("file is uploaded on cloudinary", response.url); 
        //this will return url of the uploaded file which is used on frontend in order to access the file
        return response;
    }
    catch(error){
        fs.unlinkSync(localfilepath)  //remove the locally saved file when the operation is got failed 
    }
  }


  
export {uploadoncloudinary}