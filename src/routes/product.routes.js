import { Router } from "express";
import {
    registerproduct,
    showproduct,
    // updateproductfrontimage,
    // updateproductbackimage,
    updateproductimages,
    update_product_rating,
    searchproduct,
    most_scanned
    
    // loginuser,
    // logout,
    // refreshAccessToken,
    // changeCurrentPassword,
    // getCurrentuser,
    // updateAccountDetails,
    // updateUserAvatar,
    // updateUsercoverImage,
    // getUserChannelProfile,
    // getWatchHistory
     } from "../controllers/product.controller.js";
import { 
    likeDislikeProduct,
    liked_product

 } from "../controllers/likes.controllers.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT,getLoggedInUserOrIgnore } from "../middlewares/auth.middleware.js";


const router =Router()

router.route("/register").post(registerproduct)


router.route("/showproduct/:product_barcode").get(getLoggedInUserOrIgnore,showproduct)

router.route("/most_scanned").get(most_scanned)


// router.route("/showproductt/:product_barcode").get(getLoggedInUserOrIgnore,showproduct)



router.route("/searchproduct").get(searchproduct)



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