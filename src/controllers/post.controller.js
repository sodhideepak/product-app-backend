import { asynchandler } from "../utils/asynchandler.js";
import { ApiError } from "../utils/ApiError.js";
import { like} from "../models/likes.models.js";
import { posts } from "../models/post.models.js";
import { consumption } from "../models/consumption.models.js";
import { product } from "../models/product.models.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { uploadoncloudinary,deleteFromCloudinary } from "../utils/cloudinary.js";
import mongoose from "mongoose";
import moment from "moment-timezone";




function getCurrentISTDateTime() {
  // Get the current timestamp
  const timestamp = Date.now();

  // Create a new Date object from the timestamp
  const date = new Date(timestamp);

  // Function to convert to IST
  function toIST(date) {
      // Convert date to UTC
      const utcDate = new Date(date.getTime() + date.getTimezoneOffset() * 60000);

      // Create IST date
      const istDate = new Date(utcDate.getTime() + (5.5 * 60 * 60000));

      return istDate;
  }

  // Get IST date
  const istDate = toIST(date);

  // Format the IST date to get the separate date and time
  const optionsDate = { year: 'numeric', month: '2-digit', day: '2-digit' };
  const optionsTime = { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true };

  const formattedISTDate = istDate.toLocaleDateString('en-IN', optionsDate);
  const formattedISTTime = istDate.toLocaleTimeString('en-IN', optionsTime);

  // Return the formatted date and time
  return {
      current_date: formattedISTDate,
      current_time: formattedISTTime
  };
}


// const {current_date,current_time} = getCurrentISTDateTime();
      
// console.log(current_time);
// console.log(current_date);




const createpost = asynchandler(async(req, res) => {
    const {
     title,
     content,
     tags,
    //  author

    }= req.body
  
    // console.log(req.body);
    
    // console.log(title);
    // console.log("eeeelllooo");
    
    if ([title, content].some((field) => {
      console.log('Checking field:', field);
      return field?.trim() === ""||undefined;
    })) {
      throw new ApiError(400, "All fields are required");
    }
    
  

    const {current_date,current_time} = getCurrentISTDateTime();

// console.log(current_date,current_time);


      

  
    const post_data=await posts.create({  
        title,
        content,
        tags,
        author:"heetox",
        featured_image:"",
        created_At_date:current_date,
        created_At_time:current_time,
    })




      return res.status(200).json(
        new ApiResponse(
          200,
          {
            post_data,
          },
          "Post Created Sucessfully"
        )
      );
    
  });




const updatefeatureimage= asynchandler(async(req,res)=>{
    const {_id}=req.body
    // console.log(_id)
    // console.log(req.files)

    let Post_data = await posts.findById(_id)
  

    // console.log(Product_data)

    if (!Post_data) {
        throw new ApiError(400,"invalid post")

        
    }  
    if (Post_data.featured_image!="") {
      await deleteFromCloudinary(Post_data.featured_image)
      // console.log("helo");
      
    }  


    let featureimagelocalpath ;
    let featureimage;
    
 
    if(req.files.featured_image!=undefined){
    
         featureimagelocalpath =req.files?.featured_image[0]?.path;

          featureimage =await uploadoncloudinary(featureimagelocalpath);

          featureimage.url = featureimage.url.replace(/^http:/, 'https:');

          Post_data.featured_image=featureimage.url
    }
  
    
    
    await Post_data.save({validateBeforeSave:false})


    

    // const product_images=Product_data.product_images

    return res
    .status(200)
    .json(new ApiResponse(200,{Post_data},"feature image updated sucessfully"))
})




const remove_post = asynchandler(async(req, res) => {
  const {_id} = req.body;
  // console.log(req.body);
  // console.log(_id);
  

  const Post_data = await posts.findById(_id)
//  console.log("sssseeeeeeeeess",Post_data);
 
 if (Post_data.featured_image!="") {
  await deleteFromCloudinary(Post_data.featured_image)
  console.log("hellllllllll");
  
 }


  const deletedPost = await posts.findByIdAndDelete(_id);

        if (!deletedPost) {
            return res.status(404).json({ message: 'post not found' });
        }

  


    return res.status(200).json(
      new ApiResponse(
        200,
        {},
        "Post Removed Sucessfully"
      )
    );
  
});
  
  





const allposts = asynchandler(async (req,res)=>{

    
    
  const posts = await product.aggregate([
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







  export { createpost, 
           updatefeatureimage,
           remove_post,
           allposts
          };