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
    searchingredient,
    product_ranking,
    update_ingredient,
    checkbarcode,
    displayemptyingredient
    
  
     } from "../controllers/product.controller.js";

import { createpost, 
         updatefeatureimage,
         remove_post,
         allposts ,
         bookmarkPost,
         bookmark_post_list


} from "../controllers/post.controller.js";
import { 
    liked_post,
    liked_product,
    likeDislikePost

 } from "../controllers/likes.controllers.js";
import { ConsumeProduct,Remove_From_Consumption } from "../controllers/consumption.controllers.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT,getLoggedInUserOrIgnore } from "../middlewares/auth.middleware.js";


const router =Router()

router.route("/create_post").post(createpost)


router.route("/remove_post").post(remove_post)


router.route("/all_posts").get(getLoggedInUserOrIgnore,allposts)



router.route("/updatefeatureimage").post( upload.fields([
    {
        name:"featured_image",
        maxCount:1
    }
]),
updatefeatureimage)




router.route("/likeDislikePost/:_id").post(verifyJWT,likeDislikePost)




router.route("/liked_post").get(verifyJWT,liked_post)




router.route("/bookmarkPost/:_id").post(verifyJWT,bookmarkPost)




router.route("/bookmark_post_list").get(verifyJWT,bookmark_post_list)



router.route("/checkbarcode/:product_barcode").get(checkbarcode)


router.route("/showproduct/:product_barcode").get(getLoggedInUserOrIgnore,showproduct)
// router.route("/showproduct").get(showproduct)


router.route("/most_scanned").get(getLoggedInUserOrIgnore,most_scanned)


router.route("/allproducts").get(getLoggedInUserOrIgnore,allproducts)


router.route("/alternateproducts/:category").get(getLoggedInUserOrIgnore,alternateproducts)


router.route("/categories").get(categories)


// router.route("/showproductt/:product_barcode").get(getLoggedInUserOrIgnore,showproduct)



router.route("/searchproduct").get(getLoggedInUserOrIgnore,searchproduct)




router.route("/searchingredient").get(searchingredient)



router.route("/product_ranking").get(product_ranking)



router.route("/ConsumeProduct/:product_barcode").post(verifyJWT,ConsumeProduct)

router.route("/RemoveConsumeProduct/:_id").post(verifyJWT,Remove_From_Consumption)







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








export default router 