import { asynchandler } from "../utils/asynchandler.js";
import { ApiError } from "../utils/ApiError.js";
import { product } from "../models/product.models.js";
import { user } from "../models/user.models.js";
import { productrating } from "../models/productrating.models.js";
// import bcrypt from "bcrypt";
// import  json  from "express";
import mongoose from "mongoose";
import  Jwt  from "jsonwebtoken";

import { uploadoncloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";



function calculateNutriScore(kcal, carbs, fats, protein, sodium,fruitsVegetablesPercentage,fiber) {
    // Convert kcal to kJ (1 kcal = 4.184 kJ)
    // let energy = kcal * 4.184;
    let energy = kcal * 0;

    // Define thresholds for negative points
    const negativePoints = {
        energy: [
            { threshold: 335, points: 0 },
            { threshold: 670, points: 1 },
            { threshold: 1005, points: 2 },
            { threshold: 1340, points: 3 },
            { threshold: 1675, points: 4 },
            { threshold: 2010, points: 5 },
            { threshold: 2345, points: 6 },
            { threshold: 2680, points: 7 },
            { threshold: 3015, points: 8 },
            { threshold: 3350, points: 9 },
            { threshold: Infinity, points: 10 }
        ],
        sugars: [
            { threshold: 4.5, points: 0 },
            { threshold: 9, points: 1 },
            { threshold: 13.5, points: 2 },
            { threshold: 18, points: 3 },
            { threshold: 22.5, points: 4 },
            { threshold: 27, points: 5 },
            { threshold: 31, points: 6 },
            { threshold: 36, points: 7 },
            { threshold: 40, points: 8 },
            { threshold: 45, points: 9 },
            { threshold: Infinity, points: 10 }
        ],
        saturatedFat: [
            { threshold: 1, points: 0 },
            { threshold: 2, points: 1 },
            { threshold: 3, points: 2 },
            { threshold: 4, points: 3 },
            { threshold: 5, points: 4 },
            { threshold: 6, points: 5 },
            { threshold: 7, points: 6 },
            { threshold: 8, points: 7 },
            { threshold: 9, points: 8 },
            { threshold: 10, points: 9 },
            { threshold: Infinity, points: 10 }
        ],
        sodium: [
            { threshold: 90, points: 0 },
            { threshold: 180, points: 1 },
            { threshold: 270, points: 2 },
            { threshold: 360, points: 3 },
            { threshold: 450, points: 4 },
            { threshold: 540, points: 5 },
            { threshold: 630, points: 6 },
            { threshold: 720, points: 7 },
            { threshold: 810, points: 8 },
            { threshold: 900, points: 9 },
            { threshold: Infinity, points: 10 }
        ]
    };

    // Define thresholds for positive points
    const positivePoints = {
        fruitsVegetables: [
            { threshold: 40, points: 0 },
            { threshold: 60, points: 1 },
            { threshold: 80, points: 2 },
            { threshold: Infinity, points: 3 }
        ],
        fiber: [
            { threshold: 0.9, points: 0 },
            { threshold: 1.9, points: 1 },
            { threshold: 2.8, points: 2 },
            { threshold: 3.7, points: 3 },
            { threshold: 4.7, points: 4 },
            { threshold: Infinity, points: 5 }
        ],
        protein: [
            { threshold: 1.6, points: 0 },
            { threshold: 3.2, points: 1 },
            { threshold: 4.8, points: 2 },
            { threshold: 6.4, points: 3 },
            { threshold: 8, points: 4 },
            { threshold: Infinity, points: 5 }
        ]
    };
// console.log(thresholds)
// console.log(thresholds.length)
    // Calculate negative points
    function getPoints(value, thresholds) {
        
        for (let i = 0; i < thresholds.length; i++) {
            if (value <= thresholds[i].threshold) {
                // console.log(thresholds[i].points);
                return thresholds[i].points;
            }
        }
    }

    let negativeScore = getPoints(energy, negativePoints.energy) +
                        getPoints(carbs, negativePoints.sugars) +
                        getPoints(fats, negativePoints.saturatedFat) +
                        getPoints(sodium, negativePoints.sodium);

    // For the example, let's assume 0% fruits/vegetables and fiber as we don't have those values
    // let fruitsVegetablesPercentage = 19.5;
    // let fiber = 0;

    let positiveScore = getPoints(fruitsVegetablesPercentage, positivePoints.fruitsVegetables) +
                        getPoints(fiber, positivePoints.fiber) +
                        getPoints(protein, positivePoints.protein);

    // Calculate final score
    let finalScore = negativeScore - positiveScore;

    // Determine Nutri-Score
    let nutriScore;
    if (finalScore <= -1) {
        nutriScore = 'A';
    } else if (finalScore <= 2) {
        nutriScore = 'B';
    } else if (finalScore <= 10) {
        nutriScore = 'C';
    } else if (finalScore <= 18) {
        nutriScore = 'D';
    } else {
        nutriScore = 'E';
    }

    return { finalScore, nutriScore };
}



const registerproduct = asynchandler(async (req,res)=>{
   



    const {
        product_barcode,
        product_name,
        product_keywords,
        brand_name,
        ingredients,
        nutritional_value,
        product_category,
        fruitsVegetablesPercentage,
        dietry_fiber
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

    // console.log("before register",nutritional_value[1].per_100ml.kcal)

    // const {finalScore,
    //     nutriScore
    //       }= calculateNutriScore(
    //         nutritional_value[1].per_100ml.kcal,
    //         nutritional_value[1].per_100ml.carbs,   
    //         nutritional_value[1].per_100ml.fats,  
    //         nutritional_value[1].per_100ml.protine,   
    //         nutritional_value[1].per_100ml.sodium,
    //         fruitsVegetablesPercentage,
    //         dietry_fiber
    //       )



    const Product=await product.create({
        product_barcode,
        product_name:product_name.trim(),
        product_category:product_category.trim(),
        product_keywords:product_keywords || [],
        brand_name:brand_name.trim(),
        ingredients,
        nutritional_value,
        fruitsVegetablesPercentage:fruitsVegetablesPercentage||0,
        dietry_fiber:dietry_fiber||0,
        // product_finalscore:finalScore,
        // product_nutriscore:nutriScore,
        product_front_image:"",
        product_back_image:""


    })
  

    const createdproduct =await product.findById( Product._id);    

    // console.log
    if (!createdproduct) {
        throw new ApiError(500,"something went wrong while registering the product")
    }


    const {finalScore,
        nutriScore
          }= calculateNutriScore(
            createdproduct.nutritional_value[1].per_100ml.kcal,
            createdproduct.nutritional_value[1].per_100ml.carbs,   
            createdproduct.nutritional_value[1].per_100ml.fats,  
            createdproduct.nutritional_value[1].per_100ml.protine,   
            createdproduct.nutritional_value[1].per_100ml.sodium,
            createdproduct.fruitsVegetablesPercentage,
            createdproduct.dietry_fiber
          )

    // console.log( createdproduct.fruitsVegetablesPercentage)
    // console.log(createdproduct.dietry_fiber)
    // console.log(finalScore)
    // console.log(nutriScore)




    const rating=await productrating.create({
    
        product_id:createdproduct._id,
        product_finalscore:finalScore,
        product_nutriscore:nutriScore


      
    })



    return res.status(201).json(
        new ApiResponse(200,{createdproduct,rating},"product registered sucessfully")
        // new ApiResponse(200,{createdproduct,rating},"product registered sucessfully")
    )

})


const showproduct = asynchandler(async (req,res)=>{

    // console.log(req.params)
    const {product_barcode}= req.params

    if (!product_barcode) {
        throw new ApiError(400,"barcode is required")     
    }

    const fetched_product= await product.findOne({
        $or:[ {product_barcode}]
    })

   
    // if (!product_data) {
    //     throw new ApiError(400, "product does not exist")
        
    // }



    // const fetched_poduct =await product.findById( product_data._id)

//     console.log(req.cookies?.accesstoken)
//     console.log(req.header("Authorization")?.replace("Bearer ","")
// )   

// const token=req.cookies?.accesstoken ||  req.header("Authorization")?.replace("Bearer ","")
// let User
// if(token){
// const decodedtoken= Jwt.verify(token,process.env.Access_Token_Secret)

//      User = await user.findById(decodedtoken?._id).select("-password -refreshtoken")

// }else{
//      User=null
// }
    


    // console.log(req.user)
    const product_data = await product.aggregate([
        { $match: fetched_product }, // Match products based on the query parameters
        {
            $lookup: {
                from: 'productratings', // Name of the ratings collection
                localField: '_id',
                foreignField: 'product_id', // Adjust the field name if necessary
                as: 'ratings'
            }
        },
        {
            $unwind: {
              path: '$ratings',
              preserveNullAndEmptyArrays: true // To include products without ratings
            }
        },
        {
            $lookup: {
              from: "likes",
              localField: "_id",
              foreignField: "product_id",
              as: "likes",
            },
        },
        {
            $lookup: {
                from: "likes",
                localField: "_id",
                foreignField: "product_id",  // Ensure this field matches the field in likes collection
                as: "isliked",
                pipeline: [
                    {
                        $match: {
                            likedBy: new mongoose.Types.ObjectId(req.user?._id),
                        },
                    },
                ],
            },
        },
        {
            $addFields: {
                likesCount: { $size: "$likes" },
                ratings:  "$ratings" ,
                isliked: {
                    $cond: {
                      if: {
                        $gte: [
                          {
                            // if the isLiked key has document in it
                            $size: "$isliked",
                          },
                          1,
                        ],
                      },
                      then: true,
                      else: false,
                    },
                  },
                
               
 
            }
        },
        {
            $project:{
                likes:0,
                // ratings_id:0
            }
        }

    ]);


    await product.findByIdAndUpdate(
        fetched_product._id,
        { $inc: { fetchCount: 1 } },
        { new: true } // Return the updated document
      );

    // console.log(fetched_poduct.nutritional_value[1].per_100ml.kcal )

    // const fruitpercent=98.99
    // const fiber=0

    // const {finalScore,
    //     nutriScore
    //       }= calculateNutriScore(
    //         fetched_poduct.nutritional_value[1].per_100ml.kcal,
    //         fetched_poduct.nutritional_value[1].per_100ml.carbs,   
    //         fetched_poduct.nutritional_value[1].per_100ml.fats,  
    //         fetched_poduct.nutritional_value[1].per_100ml.protine,   
    //         fetched_poduct.nutritional_value[1].per_100ml.sodium,
    //         fruitpercent,
    //         fiber
    //       )

    // console.log(finalScore)
    // console.log(nutriScore)

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



const searchproduct = asynchandler(async (req,res)=>{

    
    console.log(req.query )

    // const product_data = await product.find( req.query )


    const product_data = await product.aggregate([
        { $match: req.query }, // Match products based on the query parameters
        {
            $lookup: {
                from: 'productratings', // Name of the ratings collection
                localField: '_id',
                foreignField: 'product_id', // Adjust the field name if necessary
                as: 'ratings'
            }
        }
    ]);

    if (!product_data) {
        throw new ApiError(400, "product does not exist")
        
    }


    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            
                product_data
            ,
            "product fetched sucessfully")
    )

})


const most_scanned = asynchandler(async (req,res)=>{
    
    
    const products = await product.aggregate([
        // Match products based on the query parameters
       {
           $lookup: {
               from: 'productratings', // Name of the ratings collection
               localField: '_id',
               foreignField: 'product_id', // Adjust the field name if necessary
               as: 'ratings'
           }
       },
       {
        $unwind: '$ratings'
         },
       {
           $lookup: {
             from: "likes",
             localField: "_id",
             foreignField: "product_id",
             as: "likes",
           },
       },
       {
           $project: {
             _id: 1,
             likesCount: 1,
             ratings: 1,
             likesCount: { $size: "$likes" },
             product_barcode: 1,
             product_name:1,
             brand_name:1,
             product_category:1,
             product_front_image:1,
             fetchCount:1,
             product_finalscore: "$ratings.product_finalscore",
             product_nutriscore: "$ratings.product_nutriscore"
            //  product_finalscore: '$ratings.product_finalscore'
           }
         },
         {
        $project:{
            ratings:0
        }
        },
         {
           $sort: {
               fetchCount: -1 // Sort by ratings in descending order (highest first)
           }
         },
       

   ])
 
 
  


    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            
            products
            ,
            "products fetched sucessfully")
    )

})



const allproducts = asynchandler(async (req,res)=>{

    
    
    const products = await product.aggregate([
         // Match products based on the query parameters
        {
            $lookup: {
                from: 'productratings', // Name of the ratings collection
                localField: '_id',
                foreignField: 'product_id', // Adjust the field name if necessary
                as: 'ratings'
            }
        },
        {
            $unwind: '$ratings'
        },
        {
            $lookup: {
              from: "likes",
              localField: "_id",
              foreignField: "product_id",
              as: "likes",
            },
        },
        {
            $project: {
              likesCount: { $size: "$likes" },  
              _id: 1,
              likesCount: 1,
              ratings: 1,
              product_barcode: 1,
              product_name:1,
              brand_name:1,
              product_category:1,
              product_front_image:1,
              fetchCount:1,
              product_finalscore: "$ratings.product_finalscore",
              product_nutriscore: "$ratings.product_nutriscore"

            }
          },
          {
            $project:{
                ratings:0
            }
          },
        //   {
        //     $sort: {
        //         fetchCount: -1 // Sort by ratings in descending order (highest first)
        //     }
        //   }
        

    ])
  
  

  


    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            
            products
            ,
            "products fetched sucessfully")
    )

})



const alternateproducts = asynchandler(async (req,res)=>{

   
       const product_data = await product.aggregate([
        { $match: req.body },
         // Match products based on the query parameters
        {
            $lookup: {
                from: 'productratings', // Name of the ratings collection
                localField: '_id',
                foreignField: 'product_id', // Adjust the field name if necessary
                as: 'ratings'
            }
        },
        {
            $unwind: '$ratings'
        },
        {
            $lookup: {
              from: "likes",
              localField: "_id",
              foreignField: "product_id",
              as: "likes",
            },
        },
        {
            $addFields: {
                likesCount: { $size: "$likes" },
                ratings:  "$ratings" ,
            }
        },
        {
            $project: {
              _id: 1,
              likesCount: { $size: "$likes" },
              product_barcode: 1,
              product_name:1,
              brand_name:1,
              product_category:1,
              product_front_image:1,
              fetchCount:1,
              product_finalscore: "$ratings.product_finalscore",
              product_nutriscore: "$ratings.product_nutriscore"



            }
          },
          {
            $project:{
                ratings:0
            }
          },
          {
            $sort: {
              ratings: 1 // Sort by ratings in descending order (highest first)
            }
          }
        

    ])
   
  


    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            
            product_data
            ,
            "products fetched sucessfully")
    )

})


const updateproductimages = asynchandler(async(req,res)=>{
    const {product_barcode}=req.body


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


const update_product_rating = asynchandler(async(req,res)=>{

    // const password=req.query



    const products = await product.find();
    console.log(products)
    for (const productt of products) {
      // Calculate the new rating
    //   const newRating = calculateNewRating(product.nutritionalInfo);

    
    const {finalScore,
        nutriScore
          }= calculateNutriScore(
            productt.nutritional_value[1].per_100ml.kcal,
            productt.nutritional_value[1].per_100ml.carbs,   
            productt.nutritional_value[1].per_100ml.fats,  
            productt.nutritional_value[1].per_100ml.protine,   
            productt.nutritional_value[1].per_100ml.sodium,
            productt.fruitsVegetablesPercentage,
            productt.dietry_fiber
          )

    
      // Update the product rating in the ProductRating collection
      await productrating.updateOne(
        { product_id: productt._id },
        { $set: { product_finalscore:finalScore,
            product_nutriscore:nutriScore
         } }
      );
    }

    const product_data = await product.aggregate([
        // { $match: fetched_product },
        {
            $lookup: {
                from: 'productratings', // Name of the ratings collection
                localField: '_id',
                foreignField: 'product_id', // Adjust the field name if necessary
                as: 'ratings'
            }
        }
    ]);
     
    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            {
                product_data
            },
            "ratings updated sucessfully")
    )



})

 

const categories = asynchandler(async (req,res)=>{


      const categories = await product.distinct("product_category");

      const categories_count = categories.length
  
    
    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            {
                categories,categories_count
            },
            "product fetched sucessfully")
    )

})




export {
    registerproduct,
    showproduct,
    // updateproductfrontimage,
    // updateproductbackimage,
    updateproductimages,
    searchproduct,
    most_scanned,
    allproducts,
    update_product_rating,
    alternateproducts,
    categories
  
}