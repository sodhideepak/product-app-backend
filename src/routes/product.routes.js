import { Router } from "express";
import {
    registerproduct,
    showproduct,
    // updateproductfrontimage,
    // updateproductbackimage,
    updateproductimages,
    update_product_rating,
    searchproduct,
    most_scanned,
    allproducts,
    categories,
    alternateproducts,
    registeringredient,
    searchingredient
    
  
     } from "../controllers/product.controller.js";
import { 
    likeDislikeProduct,
    liked_product

 } from "../controllers/likes.controllers.js";
import { ConsumeProduct,Remove_From_Consumption } from "../controllers/consumption.controllers.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT,getLoggedInUserOrIgnore } from "../middlewares/auth.middleware.js";


const router =Router()

router.route("/register").post(registerproduct)


router.route("/register_ingredient").post(registeringredient)


router.route("/showproduct/:product_barcode").get(getLoggedInUserOrIgnore,showproduct)
// router.route("/showproduct").get(showproduct)


router.route("/most_scanned").get(most_scanned)


router.route("/allproducts").get(allproducts)


router.route("/alternateproducts").get(alternateproducts)


router.route("/categories").get(categories)


// router.route("/showproductt/:product_barcode").get(getLoggedInUserOrIgnore,showproduct)



router.route("/searchproduct").get(searchproduct)




router.route("/searchingredient").get(searchingredient)



router.route("/ConsumeProduct/:product_barcode").post(verifyJWT,ConsumeProduct)

router.route("/RemoveConsumeProduct/:_id").post(verifyJWT,Remove_From_Consumption)




router.route("/like-product/:product_barcode").post(verifyJWT,likeDislikeProduct)


router.route("/liked_product").get(verifyJWT,liked_product)


router.route("/update_product_rating").post(update_product_rating)


// router.route("/updateproductfrontimage").post( upload.fields([
//     {
//     name:"product_front_image",
//     maxCount:1
//     } 
// ]),
// updateproductfrontimage)


// router.route("/updateproductbackimage").post( upload.fields([
//         {
//         name:"product_back_image",
//         maxCount:1
//         } 
//     ]),
//     updateproductbackimage)


router.route("/updateproductimages").post( upload.fields([
        {
            name:"product_back_image",
            maxCount:1
        },
        {
            name:"product_front_image",
            maxCount:1
        }  
    ]),
    updateproductimages)






export default router 