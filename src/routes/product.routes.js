import { Router } from "express";
import {
    registerproduct,
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

router.route("/register").post(
    upload.fields([
        {
        name:"product_images",
        maxCount:1
        }  
    ]),
    registerproduct)

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