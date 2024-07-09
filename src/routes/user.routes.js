import { Router } from "express";
import {
    registeruser,
    send_otp,
    loginuser,
    logout,
    verifyemail,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentuser,
    updateAccountDetails,
    // updateUserAvatar,
    // updateUsercoverImage,
    getUserChannelProfile,
    // getWatchHistory,
    forgotpassword,
    resetpassword
     } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";


const router =Router()

router.route("/register").post(
    // upload.fields([
    //     {
    //     name:"avatar",
    //     maxCount:1
    //     },
    //     {
    //     name:"coverimage",
    //     maxCount:1
        
    //     }
    // ]),
    registeruser)

router.route("/sendotp").post(send_otp)

router.route("/verifyemail").post(verifyemail)

router.route("/login").post(loginuser)

router.route("/logout" ).post(verifyJWT,logout)

router.route("/refresh-token" ).post(refreshAccessToken)

router.route("/change-password" ).post(verifyJWT,changeCurrentPassword)

router.route("/current-user" ).get(verifyJWT,getCurrentuser)

router.route("/update-account" ).patch(verifyJWT,updateAccountDetails)

// router.route("/avatar" ).patch(verifyJWT,upload.single("avatar"),updateUserAvatar)

// router.route("/coverimage" ).patch(verifyJWT,upload.single("coverimage"),updateUsercoverImage)

router.route("/channel-profile").get(verifyJWT,getUserChannelProfile)

// router.route("/history").get(verifyJWT,getWatchHistory)

router.route("/forgotpassword").post(forgotpassword)

router.route("/resetpassword").post(resetpassword)


export default router 