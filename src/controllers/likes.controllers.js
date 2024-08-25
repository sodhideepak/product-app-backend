import { asynchandler } from "../utils/asynchandler.js";
import { ApiError } from "../utils/ApiError.js";
import { like} from "../models/likes.models.js";
import { posts } from "../models/post.models.js";
import { product } from "../models/product.models.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import mongoose from "mongoose";




const likeDislikeProduct = asynchandler(async (req, res) => {
    const { product_barcode } = req.params;
  
    const post = await product.findOne({
        $or:[ {product_barcode}]
    });
  
    // Check for post existence
    if (!post) { 
      throw new ApiError(404, "Product does not exist");
    }
  
    // See if user has already liked the post
    const isAlreadyLiked = await like.findOne({
        product_id:post._id,
      likedBy: req.user?._id,
    });
  
    if (isAlreadyLiked) {
      // if already liked, dislike it by removing the record from the DB
      await like.findOneAndDelete({
        product_id:post._id,
        likedBy: req.user?._id,
      });
      return res.status(200).json(
        new ApiResponse(
          200,
          {
            isLiked: false,
          },
          "Unliked successfully"
        )
      );
    } else {
      // if not liked, like it by adding the record from the DB
      await like.create({
        product_id:post._id,
        likedBy: req.user?._id,
      });
      return res.status(200).json(
        new ApiResponse(
          200,
          {
            isLiked: true,
          },
          "Liked successfully"
        )
      );
    }
  });
  



  

const likeDislikePost = asynchandler(async (req, res) => {
  const { _id } = req.params;
console.log(_id);

  const post = await posts.findById(_id);

  // Check for post existence
  if (!post) { 
    throw new ApiError(404, "Post does not exist");
  }

  // See if user has already liked the post
  const isAlreadyLiked = await like.findOne({
      post_id:post._id,
    likedBy: req.user?._id,
  });

  if (isAlreadyLiked) {
    // if already liked, dislike it by removing the record from the DB
    await like.findOneAndDelete({
      post_id:post._id,
      likedBy: req.user?._id,
    });
    return res.status(200).json(
      new ApiResponse(
        200,
        {
          isLiked: false,
        },
        "Unliked successfully"
      )
    );
  } else {
    // if not liked, like it by adding the record from the DB
    await like.create({
      post_id:post._id,
      likedBy: req.user?._id,
    });
    return res.status(200).json(
      new ApiResponse(
        200,
        {
          isLiked: true,
        },
        "Liked successfully"
      )
    );
  }
});



  const liked_product = asynchandler(async (req, res) => {
    const  User  = req.user;
    const  Userid  = User._id;
  
    // const comment = await SocialComment.findById(commentId);
  
    // Check for comment existence
    // if (!comment) {
    //   throw new ApiError(404, "Comment does not exist");
    // }
    // console.log(Userid)
    const liked_products = await like.aggregate([
        { $match:
            {likedBy:new mongoose.Types.ObjectId(Userid)} 
        }, // Match products based on the query parameters
        
        { 
            $lookup: {
                from: 'final_products', // Name of the ratings collection
                localField: 'product_id',
                foreignField: '_id', // Adjust the field name if necessary
                as: 'liked_product',
               
              }
        },
        {
          $lookup: {
              from: 'productratings', // Name of the ratings collection
              localField: 'product_id',
              foreignField: 'product_id', // Adjust the field name if necessary
              as: 'ratings'
          }
      },
      {
        $unwind: '$ratings'
      },
      {
            $unwind: '$liked_product'
      },
      {
            $project: {
              _id: 0, // Exclude the _id field from the result
              'liked_product.product_barcode': 1,
              'liked_product.product_name': 1,
              'liked_product.brand_name': 1,
              'liked_product.product_front_image': 1,
              'liked_product.product_category': 1,
              'ratings.product_finalscore':1,
              'ratings.product_nutriscore':1
            }
      }
            
    ]);
  
    
      return res.status(200).json(
        new ApiResponse(
          200,
          {
            liked_products,
          },
          "products fetched sucessfully"
        )
      );
    
  });
  







  const liked_post = asynchandler(async (req, res) => {
    const  User  = req.user;
    const  Userid  = User._id;
  
    // const comment = await SocialComment.findById(commentId);
  
    // Check for comment existence
    // if (!comment) {
    //   throw new ApiError(404, "Comment does not exist");
    // }
    console.log(Userid)
    const liked_posts = await like.aggregate([
        { $match:
            {likedBy:new mongoose.Types.ObjectId(Userid)} 
        }, // Match products based on the query parameters
        
        { 
            $lookup: {
                from: 'posts', // Name of the ratings collection
                localField: 'post_id',
                foreignField: '_id', // Adjust the field name if necessary
                as: 'liked_posts',
               
              }
        },
       
            
    ]);
  
    
      return res.status(200).json(
        new ApiResponse(
          200,
          {
            liked_posts,
          },
          "products fetched sucessfully"
        )
      );
    
  });



  
  export { likeDislikeProduct, liked_product ,
            likeDislikePost ,liked_post
  };