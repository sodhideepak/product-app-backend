import { asynchandler } from "../utils/asynchandler.js";
import { ApiError } from "../utils/ApiError.js";
import { product } from "../models/user.models.js";
// import bcrypt from "bcrypt";
import mongoose from "mongoose";
import { uploadoncloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken"

const generateAccessAndRefreshTokens=async(userid)=>{
    try {
        const User = await user.findById(userid)
        console.log(User);
        const accesstoken = User.generateAccessToken()
        const refreshtoken = User.generateRefreshToken()
        // console.log(refreshtoken);
        User.refreshToken=refreshtoken
        // console.log("1 :",User.refreshtoken);
        // console.log("2 :",refreshtoken);
        await User.save({ validateBeforeSave: false })


        return{accesstoken,refreshtoken}
    
    } catch (error) {
        throw new ApiError(500,"something went wrong while generating access and refresh token")
    }
}

const registerproduct = asynchandler(async (req,res)=>{
    // get user details
    // validate the data
    // check if user already exist
    // check for images/avatar
    // upload to cloudinary
    // create user object in db
    // remove refresh token field for input
    // check for user creation
    // return res
    const {
        product_barcode,
        product_name,
        product_common_names,
        brand_name,
        ingredients,
        nutritional_value,
        product_images,
        product_category,
        compared_to_products
    
    }= req.body
    // console.log("email =",email);
    

    if([ product_barcode,
        product_name,
        brand_name,
        ingredients,
        nutritional_value,
        product_images,
        product_category,].some((field)=> field?.trim()==="")) {
        throw new ApiError(400,"all fields are required")
    }
    const existedproduct = await user.findOne(
        {
            $or:[{product_barcode}]
        }
    )

    if (existedproduct) {
        throw new ApiError(409,"product already registered")
    }

    const productimagelocalpath =req.files?.avatar[0]?.path;
    // const coverimagelocalpath =req.files?.coverimage[0]?.path;


    // let productimagelocalpath;
    // if (req.files && Array.isArray(req.files.product_images) || req.files.product_images.lenght > 0) {
    //     productimagelocalpath = req.files.product_images[0].path
    // }
    //  console.log("1",Array.isArray(req.files.coverimage));
    //  console.log("2",req.files);
    //  console.log("3",req.files.coverimage.lenght > 0);
    // console.log("coverimage :",coverimageLocalPath);
    // console.log(avatarlocalpath);
    if (!productimagelocalpath) {
        throw new ApiError(400,"avatar is required")
    }
    
    // const avatar =await uploadoncloudinary(avatarlocalpath);
    const productimage =await uploadoncloudinary(productimagelocalpath);

    if (!productimage) {
        throw new ApiError(400,"Product Image file is required")
    }

    const Product=await user.create({
        product_barcode,
        product_name,
        product_common_names:product_common_names||"",
        brand_name,
        ingredients,
        nutritional_value,
        product_images:productimage.url,
        product_category,
        compared_to_products:compared_to_products ||""

    })
    // console.log( user.findById(await user._id).select("-password -refreshToken"));
    const createdproduct =await product.findById( Product._id);    

    if (!createdproduct) {
        throw new ApiError(500,"something went wrong while registering the product")
    }

    return res.status(201).json(
        new ApiResponse(200,createdproduct,"product registered sucessfully")
    )

})



export {
    registerproduct,
    loginuser
}