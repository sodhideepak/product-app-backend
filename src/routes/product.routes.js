import { Router } from "express";
import {
    registerproduct,
    showproduct,
    // updateproductfrontimage,
    // updateproductbackimage,
    updateproductimages,
    searchproduct
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
import { upload } from "../middlewares/multer.middleware.js";
// import { verifyJWT } from "../middlewares/auth.middleware.js";


const router =Router()

router.route("/register").post(registerproduct)

router.route("/showproduct").post(showproduct)

router.route("/searchproduct").post(searchproduct)


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

// router.route("/login").post(loginuser)

// router.route("/logout" ).post(verifyJWT,logout)

// router.route("/refresh-token" ).post(refreshAccessToken)

// router.route("/change-password" ).post(verifyJWT,changeCurrentPassword)

// router.route("/current-user" ).post(verifyJWT,getCurrentuser)

// router.route("/update-account" ).patch(verifyJWT,updateAccountDetails)

// router.route("/avatar" ).patch(verifyJWT,upload.single("avatar"),updateUserAvatar)

// router.route("/coverimage" ).patch(verifyJWT,upload.single("coverimage"),updateUsercoverImage)

// router.route("/c/:username").get(verifyJWT,getUserChannelProfile)

// router.route("/history").get(verifyJWT,getWatchHistory)


export default router 