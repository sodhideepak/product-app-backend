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


  const deleteFromCloudinary = async (imageUrl) => {
    // Extract public ID from the URL
    const publicId = imageUrl.split('/').pop().split('.')[0];

    const response = await cloudinary.uploader.destroy(publicId, (error, result) => {
        if (error) {
            throw new ApiError(500, "Error deleting old avatar from Cloudinary");
        }
        // return response;
    });

    return response;
};

  
export {uploadoncloudinary,deleteFromCloudinary}