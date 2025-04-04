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
    sub_categories,
    alternateproducts,
    sub_products_list,
    registeringredient,
    updateproduct,
    searchingredient,
    product_ranking,
    update_ingredient,
    checkbarcode,
    displayemptyingredient,
    products_count,
    deleteingredient,
    update_product_info
    
  
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


router.route("/update_ingredient").post(update_ingredient)


router.route("/checkbarcode/:product_barcode").get(checkbarcode)


router.route("/showproduct/:product_barcode").get(getLoggedInUserOrIgnore,showproduct)
// router.route("/showproduct").get(showproduct)


router.route("/most_scanned").get(getLoggedInUserOrIgnore,most_scanned)


router.route("/allproducts").get(getLoggedInUserOrIgnore,allproducts)


router.route("/alternateproducts/:category").get(getLoggedInUserOrIgnore,alternateproducts)


router.route("/subalternateproducts/:sub_category").get(getLoggedInUserOrIgnore,sub_products_list)



router.route("/categories").get(categories)



router.route("/subcategories/:main_category").get(sub_categories)

// router.route("/showproductt/:product_barcode").get(getLoggedInUserOrIgnore,showproduct)



router.route("/searchproduct").get(getLoggedInUserOrIgnore,searchproduct)




router.route("/update_product_info").post(update_product_info)



router.route("/searchingredient").get(searchingredient)


router.route("/updateproduct").get(updateproduct)


router.route("/deleteingredient").get(deleteingredient)




router.route("/product_ranking").post(product_ranking)



router.route("/ConsumeProduct/:product_barcode").post(verifyJWT,ConsumeProduct)

router.route("/RemoveConsumeProduct/:_id").post(verifyJWT,Remove_From_Consumption)




router.route("/like-product/:product_barcode").post(verifyJWT,likeDislikeProduct)


router.route("/liked_product").get(verifyJWT,liked_product)


router.route("/update_product_rating").post(update_product_rating)


router.route("/products_count").get(products_count)



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





router.route("/displayemptyingredient").get(displayemptyingredient)






export default router 