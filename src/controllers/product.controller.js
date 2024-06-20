import { asynchandler } from "../utils/asynchandler.js";
import { ApiError } from "../utils/ApiError.js";
import { product } from "../models/product.models.js";
// import bcrypt from "bcrypt";
// import  json  from "express";
import mongoose from "mongoose";
import { uploadoncloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken"





const registerproduct = asynchandler(async (req,res)=>{
   



    const {
        product_barcode,
        product_name,
        product_keywords,
        brand_name,
        ingredients,
        nutritional_value,
        product_category,
    }= req.body
    // console.log("email =",email);
    

    // if( !product_barcode||
    //     !product_name||
    //     !brand_name||
    //     !ingredients||
    //     !nutritional_value||
    //     !product_category) {
    //     throw new ApiError(400,"all fields are required")
    // }
    const existedproduct = await product.findOne(
        {
            $or:[{product_barcode}]
        }
    )

    if (existedproduct) {
        throw new ApiError(409,"product already registered")
    }

    const Product=await product.create({
        product_barcode,
        product_name,
        product_keywords:product_keywords || [],
        brand_name,
        ingredients,
        nutritional_value,
        product_front_image:"",
        product_back_image:"",
        product_category
    })
  

    const createdproduct =await product.findById( Product._id);    

    // console.log
    if (!createdproduct) {
        throw new ApiError(500,"something went wrong while registering the product")
    }

    return res.status(201).json(
        new ApiResponse(200,createdproduct,"product registered sucessfully")
    )

})


const showproduct = asynchandler(async (req,res)=>{

    // req body get data
    // check username / email
    // find the user 
    // check password
    // generate refresh and acess tokens
    // send cookie

    const {product_barcode}= req.body
    // console.log(req.body)
  

    // console.log("email =",product_barcode);
    // console.log("email =",hello);
    
    // console.log(email,username,password);
    if (!product_barcode) {
        throw new ApiError(400,"barcode is required")     
    }

    const product_data = await product.findOne({
        $or:[ {product_barcode}]
    })

    if (!product_data) {
        throw new ApiError(400, "product does not exist")
        
    }



    const fetched_poduct =await product.findById( product_data._id)


    console.log(fetched_poduct.nutritional_value[0].per_serve.kal )


    // console.log(await product.findById( product_data._id))
    
    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            {
                productdata:fetched_poduct
            },
            "product fetched sucessfully")
    )

})



const searchproduct = asynchandler(async (req,res)=>{

    // req body get data
    // check username / email
    // find the user 
    // check password
    // generate refresh and acess tokens
    // send cookie

    // const {product_name}= req.query
    // console.log(req.query)
  

    // console.log("email =",product_barcode);
    // console.log("email =",hello);
    
    // console.log(email,username,password);
    // if (!product_name) {
    //     throw new ApiError(400,"product name is required")     
    // }

    const product_data = await product.find(req.query)

    if (!product_data) {
        throw new ApiError(400, "product does not exist")
        
    }



    // const fetched_poduct =await product.findById( product_data._id)


    // console.log(fetched_poduct.nutritional_value[0].per_serve.kal )


    // console.log(await product.findById( product_data._id))
    
    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            {
                productdata:product_data
            },
            "product fetched sucessfully")
    )

})


const updateproductimages = asynchandler(async(req,res)=>{
    const {product_barcode,product_back_image,product_front_image}=req.body


    console.log("product_front_image",req.files.product_back_image);
    console.log("product_front_image",req.files.product_front_image);
    // console.log("product_front_image",product_back_image);


    let Product_data = await product.findOne({product_barcode})
  

    // console.log(Product_data)

    if (!Product_data) {
        throw new ApiError(400,"invalid barcode")

        
    }  

    let productbackimagelocalpath ;
    let productfrontimagelocalpath ;
    let productbackimage;
    let productfrontimage;
 
    if(req.files.product_back_image!=undefined){
    
          productbackimagelocalpath =req.files?.product_back_image[0]?.path;

          productbackimage =await uploadoncloudinary(productbackimagelocalpath);

          Product_data.product_back_image=productbackimage.url || Product_data.product_images.product_back_image
    }
    
    if(req.files.product_front_image!=undefined){
    
         productfrontimagelocalpath =req.files?.product_front_image[0]?.path ;

         productfrontimage =await uploadoncloudinary(productfrontimagelocalpath);

         Product_data.product_front_image=productfrontimage.url || Product_data.product_images.product_front_image
        }



    // let productbackimagelocalpath;
    // if (req.files && Array.isArray(req.files.product_back_image) || req.files.product_back_image.lenght > 0) {
    //     productbackimagelocalpath = req.files.product_back_image[0].path
    // }


       
        //    const  productbackimage =await uploadoncloudinary(productbackimagelocalpath);
        //    const  productfrontimage =await uploadoncloudinary(productfrontimagelocalpath);

       
        //  const productbackimage =await uploadoncloudinary(productbackimagelocalpath);
        // console.log(productimage);     // const avatar =await uploadoncloudinary(avatarlocalpath);

   

    // if (!productimage) {
    //     throw new ApiError(400,"Product Image file is required")
    // }
        // console.log(productfrontimage.url)
        // console.log(productbackimage.url)

    // Product_data.product_images.product_front_image=productfrontimage.url 
    // Product_data.product_images.product_back_image=productbackimage.url || Product_data.product_images.product_back_image
    // Product_data.product_images.product_front_image=productfrontimage.url || Product_data.product_images.product_front_image
    
    // Product_data.product_back_image=productbackimage.url || Product_data.product_images.product_back_image
    // Product_data.product_front_image=productfrontimage.url || Product_data.product_images.product_front_image
    
    
    
    await Product_data.save({validateBeforeSave:false})


    

    // const product_images=Product_data.product_images

    return res
    .status(200)
    .json(new ApiResponse(200,{Product_data},"image updated sucessfully"))
})










export {
    registerproduct,
    showproduct,
    // updateproductfrontimage,
    // updateproductbackimage,
    updateproductimages,
    searchproduct
  
}