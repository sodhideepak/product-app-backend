import { Router } from "express";
import {
    registeruser,
    send_otp,
    loginuser,
    logout,
    delete_account,
    verifyemail,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentuser,
    updateAccountDetails,
    updateUserAvatar,
    removeUserAvatar,
    // updateUsercoverImage,
    // getUserChannelProfile,
    // getWatchHistory,
    forgotpassword,
    resetpassword,
    contactformenquiry,
    bookingformenquiry
     } from "../controllers/user.controller.js";
import { consumed_products,consumed_products_day,getMonthlyReport } from "../controllers/consumption.controllers.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";


const router =Router()

router.route("/register").post( registeruser)

router.route("/sendotp").post(send_otp)

router.route("/verifyemail").post(verifyemail)

router.route("/login").post(loginuser)

router.route("/logout" ).post(verifyJWT,logout)

router.route("/delete_account" ).delete(delete_account)

router.route("/refresh-token" ).post(refreshAccessToken)

router.route("/change-password" ).post(verifyJWT,changeCurrentPassword)

router.route("/current-user" ).get(verifyJWT,getCurrentuser)

router.route("/update-account" ).patch(verifyJWT,updateAccountDetails)

router.route("/avatar" ).patch(verifyJWT,upload.single("avatar"),updateUserAvatar)

router.route("/removeavatar" ).patch(verifyJWT,removeUserAvatar)

// router.route("/coverimage" ).patch(verifyJWT,upload.single("coverimage"),updateUsercoverImage)

// router.route("/channel-profile").get(verifyJWT,getUserChannelProfile)

// router.route("/history").get(verifyJWT,getWatchHistory)

router.route("/forgotpassword").post(forgotpassword)

router.route("/resetpassword").post(resetpassword)






// contact and booking form 
router.route("/contactenquiry").post(contactformenquiry)


router.route("/bookingenquiry").post(bookingformenquiry)







router.route("/consumedproducts/:condition").get(verifyJWT,consumed_products)



router.route("/consumed_products_day").get(verifyJWT,consumed_products_day)



router.route("/getMonthlyReport/:condition").get(verifyJWT,getMonthlyReport)


export default router 