import { asynchandler } from "../utils/asynchandler.js";
import { ApiError } from "../utils/ApiError.js";
import { product } from "../models/product.models.js";
import { user } from "../models/user.models.js";
import { productrating } from "../models/productrating.models.js";
import { ingredient } from "../models/ingredient.models.js";
import mongoose from "mongoose";
import { uploadoncloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
// import { log } from "winston";
// import { log } from "winston";
       

    
function calculateNutriScore(kcal, carbs, fats, protein, sodium,fruitsVegetablesPercentage,fiber,category_to_check) {
    // Convert kcal to kJ (1 kcal = 4.184 kJ)
    let energy = kcal ;
    // console.log(category_to_check);
    // let energy = kcal * 0; 
    let negativePoints;
    let category = ['beverage','diary','juice'];
    if (category.includes(category_to_check)) {
        // console.log("in the beverage");
        
        
         negativePoints = {
        
            energy: [
                { threshold: 0, points: 0 },
                { threshold: 7.2, points: 1 },
                { threshold: 14.3, points: 2 },
                { threshold: 21.5, points: 3 },
                { threshold: 28.5, points: 4 },
                { threshold: 35.9, points: 5 },
                { threshold: 43.0, points: 6 },
                { threshold: 50.2, points: 7 },
                { threshold: 57.4, points: 8 },
                { threshold: 64.5, points: 9 },
                { threshold: Infinity, points: 10 }
            ],
            sugars: [
                { threshold: 0, points: 0 },
                { threshold: 1.5, points: 1 },
                { threshold: 3.0, points: 2 },
                { threshold: 4.5, points: 3 },
                { threshold: 6.0, points: 4 },
                { threshold: 7.5, points: 5 },
                { threshold: 9.0, points: 6 },
                { threshold: 10.5, points: 7 },
                { threshold: 12, points: 8 },
                { threshold: 13.5, points: 9 },
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
    } else {
        // console.log("nonbeverage");
        
         negativePoints = {
        
            energy: [
                { threshold: 80, points: 0 },
                { threshold: 160, points: 1 },
                { threshold: 240, points: 2 },
                { threshold: 320, points: 3 },
                { threshold: 400, points: 4 },
                { threshold: 480, points: 5 },
                { threshold: 560, points: 6 },
                { threshold: 640, points: 7 },
                { threshold: 720, points: 8 },
                { threshold: 800, points: 9 },
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
    }

    // Define thresholds for negative points
    // const negativePoints = {

    //     energy: [
    //         { threshold: 80, points: 0 },
    //         { threshold: 160, points: 1 },
    //         { threshold: 240, points: 2 },
    //         { threshold: 320, points: 3 },
    //         { threshold: 400, points: 4 },
    //         { threshold: 480, points: 5 },
    //         { threshold: 560, points: 6 },
    //         { threshold: 640, points: 7 },
    //         { threshold: 720, points: 8 },
    //         { threshold: 800, points: 9 },
    //         { threshold: Infinity, points: 10 }
    //     ],
    //     sugars: [
    //         { threshold: 4.5, points: 0 },
    //         { threshold: 9, points: 1 },
    //         { threshold: 13.5, points: 2 },
    //         { threshold: 18, points: 3 },
    //         { threshold: 22.5, points: 4 },
    //         { threshold: 27, points: 5 },
    //         { threshold: 31, points: 6 },
    //         { threshold: 36, points: 7 },
    //         { threshold: 40, points: 8 },
    //         { threshold: 45, points: 9 },
    //         { threshold: Infinity, points: 10 }
    //     ],
    //     saturatedFat: [
    //         { threshold: 1, points: 0 },
    //         { threshold: 2, points: 1 },
    //         { threshold: 3, points: 2 },
    //         { threshold: 4, points: 3 },
    //         { threshold: 5, points: 4 },
    //         { threshold: 6, points: 5 },
    //         { threshold: 7, points: 6 },
    //         { threshold: 8, points: 7 },
    //         { threshold: 9, points: 8 },
    //         { threshold: 10, points: 9 },
    //         { threshold: Infinity, points: 10 }
    //     ],
    //     sodium: [
    //         { threshold: 90, points: 0 },
    //         { threshold: 180, points: 1 },
    //         { threshold: 270, points: 2 },
    //         { threshold: 360, points: 3 },
    //         { threshold: 450, points: 4 },
    //         { threshold: 540, points: 5 },
    //         { threshold: 630, points: 6 },
    //         { threshold: 720, points: 7 },
    //         { threshold: 810, points: 8 },
    //         { threshold: 900, points: 9 },
    //         { threshold: Infinity, points: 10 }
    //     ]
    // };

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

// console.log(getPoints(energy, negativePoints.energy), 
// getPoints(carbs, negativePoints.sugars) ,
// getPoints(fats, negativePoints.saturatedFat), 
// getPoints(sodium, negativePoints.sodium))



    let negativeScore = getPoints(energy, negativePoints.energy) +
                        getPoints(carbs, negativePoints.sugars) +
                        getPoints(fats, negativePoints.saturatedFat) +
                        getPoints(sodium, negativePoints.sodium);

    // For the example, let's assume 0% fruits/vegetables and fiber as we don't have those values
    // let fruitsVegetablesPercentage = 19.5;
    // let fiber = 0;

    // console.log("1",fruitsVegetablesPercentage);
    // console.log("2",fiber);
    // console.log("3",protein); 

    let positiveScore = getPoints(fruitsVegetablesPercentage, positivePoints.fruitsVegetables) +
                        getPoints(fiber, positivePoints.fiber) +
                        getPoints(protein, positivePoints.protein);

    // Calculate final score    
    // console.log(negativeScore);
    // console.log(positiveScore);
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



function capitalizeFirstLetter(str) {
    return str
      .split(' ') // Split the string into an array of words
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()) // Capitalize the first letter of each word
      .join(' '); // Join the words back into a single string
  }
  



function calculate_ml_NutriScore(kcal, sugars, saturatedFat, sodium, fruitsVegetablesPercentage, fiber, protein) {
    // Define thresholds for negative points (A, B, C, D)
    const negativePoints = {
        energy: [
            { threshold: 0, points: 0 },
            { threshold: 7.2, points: 1 },
            { threshold: 14.3, points: 2 },
            { threshold: 21.5, points: 3 },
            { threshold: 28.5, points: 4 },
            { threshold: 35.9, points: 5 },
            { threshold: 43.0, points: 6 },
            { threshold: 50.2, points: 7 },
            { threshold: 57.4, points: 8 },
            { threshold: 64.5, points: 9 },
            { threshold: Infinity, points: 10 }
        ],
        sugars: [
            { threshold: 0, points: 0 },
            { threshold: 1.5, points: 1 },
            { threshold: 3.0, points: 2 },
            { threshold: 4.5, points: 3 },
            { threshold: 6.0, points: 4 },
            { threshold: 7.5, points: 5 },
            { threshold: 9.0, points: 6 },
            { threshold: 10.5, points: 7 },
            { threshold: 12, points: 8 },
            { threshold: 13.5, points: 9 },
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

    // Define thresholds for positive points (E, F, G)
    const positivePoints = {
        fruitsVegetables: [
            { threshold: 40, points: 0 },
            { threshold: 60, points: 2 },
            { threshold: 80, points: 4 },
            { threshold: Infinity, points: 5 }
        ],
        fiber: [
            { threshold: 0.7, points: 0 },
            { threshold: 1.4, points: 1 },
            { threshold: 2.1, points: 2 },
            { threshold: 2.8, points: 3 },
            { threshold: 3.5, points: 4 },
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

    // Helper function to get points based on thresholds
    function getPoints(value, thresholds) {
        for (let i = 0; i < thresholds.length; i++) {
            if (value <= thresholds[i].threshold) {
                return thresholds[i].points;
            }
        }
    }

    // Calculate negative points
    let negativeScore = getPoints(kcal, negativePoints.energy) +
                        getPoints(sugars, negativePoints.sugars) +
                        getPoints(saturatedFat, negativePoints.saturatedFat) +
                        getPoints(sodium, negativePoints.sodium);

    // Calculate positive points
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








const update_product = asynchandler(async (req,res)=>{
   



    const {
        product_barcode,
        product_name,
        product_keywords,
        brand_name,
        ingredients,
        nutritional_value,
        product_category,
        price,
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

    if (!existedproduct) {
        throw new ApiError(409,"product is not registered")
    }


  

    const createdproduct =await product.findById( Product._id);    

    // console.log
    if (!createdproduct) {
        throw new ApiError(500,"something went wrong while registering the product")
    }


    // console.log( createdproduct.nutritional_value.energy,
    //     createdproduct.nutritional_value.carbohydrates.total_sugar,   
    //     createdproduct.nutritional_value.total_fat.saturates_fats,  
    //     createdproduct.nutritional_value.protein,   
    //     createdproduct.nutritional_value.sodium,
    //     createdproduct.fruitsVegetablesPercentage,
    //     createdproduct.nutritional_value.carbohydrates.dietry_fibre
    //   );


    const {finalScore,
        nutriScore
          }= calculateNutriScore(
            createdproduct.nutritional_value.energy,
            createdproduct.nutritional_value.carbohydrates.total_sugar,   
            createdproduct.nutritional_value.total_fat.saturates_fats,  
            createdproduct.nutritional_value.protein,   
            createdproduct.nutritional_value.sodium,
            createdproduct.fruitsVegetablesPercentage,
            createdproduct.nutritional_value.carbohydrates.dietry_fibre
          )




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






const registerproduct = asynchandler(async (req,res)=>{
   



    const {
        product_barcode,
        product_name,
        product_keywords,
        brand_name,
        ingredients,
        nutritional_value,
        product_category,
        product_sub_category,
        price,
        measuring_unit,
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

    const updatedingredients=ingredients.map(keyword => keyword.trim().toLowerCase());

    const Product=await product.create({
        product_barcode:product_barcode.trim(),
        product_name:product_name.trim(),
        product_category:product_category.trim(),
        product_sub_category:product_sub_category.trim(),
        product_keywords:product_keywords || [],
        brand_name:brand_name.trim(),
        price:price,
        ingredients:updatedingredients,
        nutritional_value,
        measuring_unit,
        fruitsVegetablesPercentage:fruitsVegetablesPercentage||0,
        dietry_fiber:dietry_fiber||0,
        // product_finalscore:finalScore,
        // product_nutriscore:nutriScore,
        product_front_image:"https://res.cloudinary.com/ddvloqbxp/image/upload/v1722503720/qqj7pkvbtaxsdurfen7c.png",
        product_back_image:"https://res.cloudinary.com/ddvloqbxp/image/upload/v1722503720/qqj7pkvbtaxsdurfen7c.png"


    })
  

    const createdproduct =await product.findById( Product._id);    

    // console.log
    if (!createdproduct) {
        throw new ApiError(500,"something went wrong while registering the product")
    }


    // console.log( createdproduct.nutritional_value.energy,
    //     createdproduct.nutritional_value.carbohydrates.total_sugar,   
    //     createdproduct.nutritional_value.total_fat.saturates_fats,  
    //     createdproduct.nutritional_value.protein,   
    //     createdproduct.nutritional_value.sodium,
    //     createdproduct.fruitsVegetablesPercentage,
    //     createdproduct.nutritional_value.carbohydrates.dietry_fibre
    //   );


    const {finalScore,
        nutriScore
          }= calculateNutriScore(
            createdproduct.nutritional_value.energy,
            createdproduct.nutritional_value.total_carbohydrates,   
            createdproduct.nutritional_value.fats.saturates_fats,  
            createdproduct.nutritional_value.protein,   
            createdproduct.nutritional_value.sodium,
            createdproduct.fruitsVegetablesPercentage,
            createdproduct.nutritional_value.carbohydrates.dietry_fibre
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







const updateproduct = asynchandler(async (req,res)=>{
   


    const products = await product.find({});

        // Iterate over each product and update the ingredients
    for (let product of products) {
        const updatedIngredients = [...new Set(
            product.ingredients.map(ingredient => ingredient.trim().toLowerCase())
        )];
    // Assign the unique ingredients back to the product
        product.ingredients = updatedIngredients;
 
        // console.log(updatedIngredients);
        
            // Save the updated product back to the database
            await product.save();
    }





    return res.status(201).json(
        new ApiResponse(200,{},"product updated sucessfully")
        // new ApiResponse(200,{createdproduct,rating},"product registered sucessfully")
    )

})





const checkbarcode = asynchandler(async (req,res)=>{

    // console.log(req.params)
    const {product_barcode}= req.params

    if (!product_barcode) {
        throw new ApiError(400,"barcode is required")     
    }

    const fetched_product= await product.findOne({
        $or:[ {product_barcode}]
    })
    let product_data;
    
    // console.log(fetched_product)
    if (!fetched_product) {
        product_data=Boolean(0)
    }else{
        product_data=Boolean(1)
    }
    

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            {
                product_data
            },
            "product fetched sucessfully")
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

    // console.log(fetched_product.ingredients);
    
    // console.log(fetched_product)
    if (!fetched_product) {
        throw new ApiError(400, "product does not exist")
        
    }
    

    const response = await product.aggregate([
        { $match: { _id: fetched_product._id }}, // Match products based on the query parameters
        { $unwind: {
            path: '$ingredients'
          } },
        {
            $lookup: {
              from: "ingredients",
              localField: "ingredients",
              foreignField: "keywords",
              as: "ingredientDetails"
            }
        },
        { $unwind:  {
            path: '$ingredientDetails',
            preserveNullAndEmptyArrays: true // To include products without ratings
          } },
         
        {
            $group: {
              _id: "$_id",
              product: { $first: "$$ROOT" }, 
              ingredients: { $push: "$ingredients" },
              ingredientDetails: { $push: "$ingredientDetails" },
          
            }
        },
        {
            $addFields: {
                'product.ingredients': {
                    $map: {
                        input: "$ingredients",
                        as: "ingredient",
                        in: {
                            $mergeObjects: [
                                { name: "$$ingredient" },
                                {
                                    $let: {
                                        vars: {
                                            matchingDetail: {
                                                $arrayElemAt: [
                                                    {
                                                        $filter: {
                                                            input: "$ingredientDetails",
                                                            as: "detail",
                                                            cond: {
                                                                $in: ["$$ingredient", "$$detail.keywords"]
                                                            }
                                                        }
                                                    },
                                                    0
                                                ]
                                            }
                                        },
                                        in: {
                                            $mergeObjects: [
                                                "$$matchingDetail",
                                                { name: "$$ingredient" }
                                            ]
                                        }
                                    }
                                }
                            ]
                        }
                    }
                }
            }
        },
        {
            $replaceRoot: { newRoot: "$product" } // Replace root with the merged product document
        },   
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
                ingredientDetails: 0 ,
                'ingredients._id':0,
                'nutritional_value.k': 0


            }
        }

    ]);


    await product.findByIdAndUpdate(
        fetched_product._id,
        { $inc: { fetchCount: 1 } },
        { new: true } // Return the updated document
      );

      var product_data = response.length > 0 ? response[0] : null;
       
    //   product_data=product_data.nutritional_value.toObject();
    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            {
                product_data
            },
            "product fetched sucessfully")
    )

})



const searchproduct = asynchandler(async (req,res)=>{

    
    // console.log(req.query )

    // const product_data = await product.find( req.query )

    const query = req.query
    // console.log(query);

    // const search = typeof query.search === 'string' && query.search.trim() !== '' ? query.search.trim() : null;
    // // console.log(search);
    //     // Match conditions for regex search on product name and keywords
    //     const matchConditions = search ? {
    //         // product_name: { $regex: search, $nin: product.map(p => p.product_name) }
    //         $or: [
    //             { product_name: { $regex: search, $options: 'i' } },
    //             // { product_keywords: { $regex: search, $options: 'i' } }
    //         ]
    //     } : {};
    // const product_data = await product.aggregate([
    //     {
    //         $match: matchConditions
    //     },
    //     {
    //         $lookup: {
    //             from: 'productratings', // Name of the ratings collection
    //             localField: '_id',
    //             foreignField: 'product_id', // Adjust the field name if necessary
    //             as: 'ratings'
    //         }
    //     },
    //     {
    //         $unwind: '$ratings'
    //     },
    //     {
    //         $lookup: {
    //             from: 'likes',
    //             localField: '_id',
    //             foreignField: 'product_id',
    //             as: 'likes'
    //         }
    //     },
    //     {
    //         $addFields: {
    //             likesCount: { $size: "$likes" }
    //         }
    //     },
    //     {
    //         $lookup: {
    //             from: "likes",
    //             localField: "_id",
    //             foreignField: "product_id",  // Ensure this field matches the field in likes collection
    //             as: "isliked",
    //             pipeline: [
    //                 {
    //                     $match: {
    //                         likedBy: new mongoose.Types.ObjectId(req.user?._id),
    //                     },
    //                 },
    //             ],
    //         },
    //     },
    //     {
    //         $addFields: {
    //             likesCount: { $size: "$likes" },
    //             ratings:  "$ratings" ,
    //             isliked: {
    //                 $cond: {
    //                   if: {
    //                     $gte: [
    //                       {
    //                         // if the isLiked key has document in it
    //                         $size: "$isliked",
    //                       },
    //                       1,
    //                     ],
    //                   }, 
    //                   then: true,
    //                   else: false,
    //                 },
    //               },
                 
    //         }
    //     },
    //     {
    //         $project: {
    //           likesCount: { $size: "$likes" },  
    //           isliked:1,
    //           _id: 1,
    //           likesCount: 1,
    //           ratings: 1,
    //           product_barcode: 1,
    //           product_name:1,
    //           brand_name:1,
    //           price:1,
    //           ingredients:1,
    //           rank:1,
    //           product_category:1,
    //           product_front_image:1,
    //           fetchCount:1,
    //           product_finalscore: "$ratings.product_finalscore",
    //           product_nutriscore: "$ratings.product_nutriscore"

    //         }
    //       },
    //       {
    //         $project:{
    //             ratings:0
    //         }
    //       },
    //       {
    //         $sort:{
    //             product_name:1
    //         }
    //       }
    // ]);



    const search = typeof query.search === 'string' && query.search.trim() !== '' ? query.search.trim() : null;

const product_data = await product.aggregate([
    {
        $match: search ? {
            $or: [
                { product_name: { $regex: new RegExp('^' + search, 'i') } },
                { product_keywords: { $regex: new RegExp(search, 'i') } } // You can remove ^ if you want to match anywhere in the keywords
            ]
        } : {}
    },
    {
        $lookup: {
            from: 'productratings',
            localField: '_id',
            foreignField: 'product_id',
            as: 'ratings'
        }
    },
    {
        $unwind: '$ratings'
    },
    {
        $lookup: {
            from: 'likes',
            localField: '_id',
            foreignField: 'product_id',
            as: 'likes'
        }
    },
    {
        $addFields: {
            likesCount: { $size: "$likes" }
        }
    },
    {
        $lookup: {
            from: "likes",
            localField: "_id",
            foreignField: "product_id",
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
            isliked: {
                $cond: {
                    if: { $gte: [{ $size: "$isliked" }, 1] },
                    then: true,
                    else: false,
                },
            },
            product_finalscore: "$ratings.product_finalscore",
            product_nutriscore: "$ratings.product_nutriscore",
        }
    },
    {
        $project: {
            _id: 1,
            product_barcode:1,
            likesCount: 1,
            isliked: 1,
            product_name: 1,
            brand_name: 1,
            price: 1,
            ingredients: 1,
            rank: 1,
            product_category: 1,
            product_front_image: 1,
            fetchCount: 1,
            product_finalscore: 1,
            product_nutriscore: 1
        }
    },
    {
        $sort: {
            product_name: 1 // Sorting alphabetically
        }
    }
]);

// Fetch additional products that contain the search string but don't start with it
if (search) {
    const additionalProducts = await product.aggregate([
        {
            $match: {
                product_name: { 
                    $regex: search, 
                    $nin: product_data.map(p => p.product_name) 
                }
            }
        },
        {
            $lookup: {
                from: 'productratings',
                localField: '_id',
                foreignField: 'product_id',
                as: 'ratings'
            }
        },
        {
            $unwind: '$ratings'
        },
        {
            $lookup: {
                from: 'likes',
                localField: '_id',
                foreignField: 'product_id',
                as: 'likes'
            }
        },
        {
            $addFields: {
                likesCount: { $size: "$likes" }
            }
        },
        {
            $lookup: {
                from: "likes",
                localField: "_id",
                foreignField: "product_id",
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
                isliked: {
                    $cond: {
                        if: { $gte: [{ $size: "$isliked" }, 1] },
                        then: true,
                        else: false,
                    },
                },
                product_finalscore: "$ratings.product_finalscore",
                product_nutriscore: "$ratings.product_nutriscore",
            }
        },
        {
            $project: {
                _id: 1,
                product_barcode:1,
                likesCount: 1,
                isliked: 1,
                product_name: 1,
                brand_name: 1,
                price: 1,
                ingredients: 1,
                rank: 1,
                product_category: 1,
                product_front_image: 1,
                fetchCount: 1,
                product_finalscore: 1,
                product_nutriscore: 1
            }
        },
        {
            $sort: {
                product_name: 1 // Sorting alphabetically
            }
        }
    ]);

    product_data.push(...additionalProducts); // Combine both sets of products
}






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
           $project: {
             _id: 1,
             likesCount: 1,
             isliked:1,
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




const product_ranking = asynchandler(async (req,res)=>{
    
    
    const categories = await product.distinct("product_sub_category");
// console.log(categories);

    // console.log(categories);
  // Iterate through each category and rank the top 20 products 

for (const category of categories) {
    const topProducts = await product.aggregate([
        { $match: { product_sub_category: category}  },
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
        { $sort: { 'ratings.product_finalscore': 1 } },
        // { $limit: 20 }
      ]);
    
    // console.log(topProducts)
      // Assign ranks
       for (let i = 0; i < topProducts.length; i++) {
        topProducts[i].rank = i + 1;
        await product.updateOne({ _id: topProducts[i]._id }, { $set: { rank: topProducts[i].rank } });
      }
      };
         
    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            
            {}
            ,
            "products ranking updated sucessfully")
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
            $addFields: {
                likesCount: { $size: "$likes" }
            }
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
            $project: {
              likesCount: { $size: "$likes" },  
              isliked:1,
              _id: 1,
              likesCount: 1,
              ratings: 1,
              product_barcode: 1,
              product_name:1,
              brand_name:1,
              rank:1,
              product_category:1,
              product_sub_category:1,
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

    const {category}= req.params
    // console.log(category);
       const product_data = await product.aggregate([
        { $match: {product_category:category} },
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
            $project: {
              _id: 1,
              isliked:1,
              likesCount: { $size: "$likes" }, 
              product_barcode: 1,
              product_name:1,
              brand_name:1,
              product_category:1,
              product_front_image:1,
              rank:1,
              price:1,
              ingredients:1,
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
                rank: 1 // Sort by ratings in descending order (highest first)
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
    console.log(product_barcode)
    console.log(req.files)

    // console.log("product_front_image",req.files.product_back_image);
    // console.log("product_front_image",req.files.product_front_image);
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

          productbackimage.url = productbackimage.url.replace(/^http:/, 'https:');

          Product_data.product_back_image=productbackimage.url || Product_data.product_images.product_back_image
    }
    
    if(req.files.product_front_image!=undefined){
    
         productfrontimagelocalpath =req.files?.product_front_image[0]?.path ;

         productfrontimage =await uploadoncloudinary(productfrontimagelocalpath);

         productfrontimage.url = productfrontimage.url.replace(/^http:/, 'https:');

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
    // console.log(products)
    for (const productt of products) {




      // Calculate the new rating
    //   const newRating = calculateNewRating(product.nutritionalInfo);
// console.log(products);
// console.log(products[0].nutritional_value.energy);

    // console.log(productt.product_category);
    
    const {finalScore,
        nutriScore
          }= calculateNutriScore(
            productt.nutritional_value.energy,
            productt.nutritional_value.total_carbohydrates,   
            productt.nutritional_value.fats.saturates_fats,  
            productt.nutritional_value.protein,   
            productt.nutritional_value.sodium,
            productt.fruitsVegetablesPercentage,
            productt.nutritional_value.carbohydrates.dietry_fibre,
            productt.product_category
          )



        //   const {finalScore,
        //     nutriScore
        //       }= calculateNutriScore(
        //         14.5,
        //         5,   
        //         4,  
        //         4,   
        //         451,
        //         20,
        //         5,
        //         "lays"
        //       )

    
    //   Update the product rating in the ProductRating collection
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
            //     finalScore,
            // nutriScore
            },
            "ratings updated sucessfully")
    )



})

 


const update_product_info = asynchandler(async(req,res)=>{

    const {product_barcode,
           product_category,
           product_sub_category,}=req.body


           const fetched_product= await product.findOne({
            $or:[ {product_barcode}]
        })
    

        fetched_product.product_category=capitalizeFirstLetter(product_category);
        fetched_product.product_sub_category=capitalizeFirstLetter(product_sub_category);
  


        await fetched_product.save();
        
        const updated_product= await product.findOne({
            $or:[ {product_barcode}]
        })
   
   
    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            {
                updated_product
            //     finalScore,
            // nutriScore
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



const sub_categories = asynchandler(async (req, res) => {

    // Extract the main category from the request body
    const { main_category } = req.params;

    // Ensure the main_category is provided
    if (!main_category) {
        throw new ApiError(409,"Main category is required") 
    }
    // Fetch the distinct subcategories that belong to the provided main category
    const subcategories = await product.distinct("product_sub_category", {
        product_category: { $regex: new RegExp(`^${main_category}$`, "i") }
    });
    // Count the number of subcategories
    const subcategories_count = subcategories.length;

    // Return the response with the subcategories, their count, and the main category
    return res.status(200).json(
        new ApiResponse(
            200,
            {
                main_category,
                subcategories,
                subcategories_count
            },
            "Subcategories fetched successfully"
        )
    );
});


const registeringredient = asynchandler(async (req,res)=>{
   



    var {
        name,
        keywords,
        purpose,
        ingredients,
        description
    }= req.body
    

    const ingredientname=name.trim().toLowerCase();
    keywords=keywords.map(keyword => keyword.trim().toLowerCase());
    ingredients=ingredients.map(ingredient => ingredient.trim().toLowerCase());


    const existedproduct = await ingredient.findOne({
        $or: [
            { name: ingredientname }, // Match directly with the name field
            { keywords: ingredientname } // Check if the inputName exists in the keywords array
        ]
    })

    if (existedproduct) {
        throw new ApiError(409,"ingredient already registered")
    }
 
    



    const ingredients_data=await ingredient.create({
        name:ingredientname,
        keywords,
        purpose,
        ingredients,
        description

    })
  

    const result =await ingredient.findById( ingredients_data._id);    

    // console.log
    if (!result) {
        throw new ApiError(500,"something went wrong while registering the product")
    }


  

    return res.status(201).json(
        new ApiResponse(200,{result},"product registered sucessfully")
        // new ApiResponse(200,{createdproduct,rating},"product registered sucessfully")
    )

})




const update_ingredient = asynchandler(async (req,res)=>{
   



    var {
        name,
        keywords,
        purpose,
        ingredients,
        description
    }= req.body
    
    name=name.trim().toLowerCase();

    const ingredient_data = await ingredient.findOne(
        {
            $or:[{name}]
        }
    )

    if (!ingredient_data) {
        throw new ApiError(409,"ingredient not registered")
    }

    

    if (name) ingredient_data.name = name;
    if (purpose) ingredient_data.purpose = purpose;
    if (ingredients) ingredient_data.ingredients = ingredients;
    if (description) ingredient_data.description = description;

    // Merge new keywords with existing ones
    if (keywords && keywords.length > 0) {
        ingredient_data.keywords = [...new Set([...ingredient_data.keywords, ...keywords])];
    }


    await ingredient_data.save();

    
  

    const result =await ingredient.findById( ingredient_data._id);    

    // console.log
    if (!result) {
        throw new ApiError(500,"something went wrong while updating the ingredienrt")
    }


  

    return res.status(201).json(
        new ApiResponse(200,{result},"ingredient updated sucessfully")
        // new ApiResponse(200,{createdproduct,rating},"product registered sucessfully")
    )

})




const deleteingredient = asynchandler(async (req,res)=>{
   



    const {
        id
    }= req.body
    

    const result =await ingredient.findByIdAndDelete( id);    

  

  

    return res.status(201).json(
        new ApiResponse(200,{},"product deleted sucessfully")
        // new ApiResponse(200,{createdproduct,rating},"product registered sucessfully")
    )

})










const searchingredient = asynchandler(async (req,res)=>{

    
    console.log(req.query )


    const response = await ingredient.find(req.query)

    if (response.length==0) {
        throw new ApiError(400, "ingredient does not exist")
        
    }

console.log(response.length);

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            
            response
            ,
            "product fetched sucessfully")
    )

})







const displayemptyingredient = asynchandler(async (req,res)=>{

     

    const response = await product.aggregate([
          { $unwind: {
            path: '$ingredients'
          } },
        {
            $lookup: {
              from: "ingredients",
              localField: "ingredients",
              foreignField: "keywords",
              as: "ingredientDetails"
            }
        },
        { $unwind:  {
            path: '$ingredientDetails',
            preserveNullAndEmptyArrays: true // To include products without ratings
          } },
         
        {
            $group: {
              _id: "$_id",
              product: { $first: "$$ROOT" }, 
              ingredients: { $push: "$ingredients" },
              ingredientDetails: { $push: "$ingredientDetails" },
          
            }
        },
        {
            $project:{
             
                // products_count: 1 ,
                ingredients:1,
                ingredientDetails:1
                // 'nutritional_value.k': 0


            }
        },



    ]);

    const uniqueIngredientsCount = await product.aggregate([
        // Unwind the ingredients array to get individual ingredients
        { $unwind: '$ingredients' },
        // Group by ingredient name to get unique ingredients
        { $group: { _id: '$ingredients' } },
        // Count the number of unique ingredients
        { $count: 'uniqueIngredientsCount' }
    ]);

    


    const uniqueUnmatchedIngredients = new Set();

    // Iterate over each product
    response.forEach(product => {
      const ingredients = product.ingredients || [];
      const ingredientDetails = product.ingredientDetails || [];

      // Iterate over ingredients in the product
      ingredients.forEach(ingredient => {
        let isMatched = false;

        // Check if the ingredient matches any of the keywords in ingredientDetails
        for (const detail of ingredientDetails) {
          const keywords = detail.keywords || [];
          if (keywords.includes(ingredient)) {
            isMatched = true;
            break;
          }
        }

        // If the ingredient does not match any keyword, add it to the set
        if (!isMatched) {
          uniqueUnmatchedIngredients.add(ingredient);
        }
      });
    });

    // Convert the set to an array and return it
    const uniqueIngredientsArray = Array.from(uniqueUnmatchedIngredients);


    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            {all_products_count:uniqueIngredientsCount[0].uniqueIngredientsCount,
            products_not_registered_count:uniqueIngredientsArray.length,
            products_not_registered:uniqueIngredientsArray
            }
            ,
            "product fetched sucessfully")
    )

})







const products_count = asynchandler(async (req,res)=>{

    
    const products = await product.countDocuments({});


    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            
            {total_products:products}
            ,
            "product fetched sucessfully")
    )

})




export {
    registerproduct,
    showproduct,
    updateproductimages,
    updateproduct,
    searchproduct,
    most_scanned,
    allproducts,
    update_product_rating,
    alternateproducts,
    categories,
    sub_categories,
    registeringredient,
    searchingredient,
    product_ranking,
    update_ingredient,
    checkbarcode,
    displayemptyingredient,
    deleteingredient,
    products_count,
    update_product_info
  
}