import { asynchandler } from "../utils/asynchandler.js";
import { ApiError } from "../utils/ApiError.js";
import { like} from "../models/likes.models.js";
import { posts } from "../models/post.models.js";
import { consumption } from "../models/consumption.models.js";
import { product } from "../models/product.models.js";
import { bookmark } from "../models/bookmark.models.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { uploadoncloudinary,deleteFromCloudinary } from "../utils/cloudinary.js";
import { getMongoosePaginationOptions } from "../utils/helper.js";
import aggregatePaginate from "mongoose-aggregate-paginate-v2";
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
        featured_image:"https://res.cloudinary.com/ddvloqbxp/image/upload/v1723571613/nzcepapn0q4ik1rcwfzm.jpg",
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
    }else{
      throw new ApiError(500,"cannot access image")
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
  // console.log("hellllllllll");
  
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
  
  




const bookmarkPost = asynchandler(async (req, res) => {
  const { _id } = req.params;
// console.log(_id);

  const post = await posts.findById(_id);

  // Check for post existence
  if (!post) { 
    throw new ApiError(404, "Post does not exist");
  }

  // See if user has already liked the post
  const isAlreadyLiked = await bookmark.findOne({
      post_id:post._id,
      bookamrked_By: req.user?._id,
  });

  if (isAlreadyLiked) {
    // if already liked, dislike it by removing the record from the DB
    await bookmark.findOneAndDelete({
      post_id:post._id,
      bookamrked_By: req.user?._id,
    });
    return res.status(200).json(
      new ApiResponse(
        200,
        {
          isBookmarked: false,
        },
        "Removed form Bookmark sucessfully"
      )
    );
  } else {
    // if not liked, like it by adding the record from the DB
    await bookmark.create({
      post_id:post._id,
      bookamrked_By: req.user?._id,
    });
    return res.status(200).json(
      new ApiResponse(
        200,
        {
          isBookmarked: true,
        },
        "Bookmarked successfully"
      )
    );
  }
});






const bookmark_post_list = asynchandler(async (req, res) => {
  const  User  = req.user;
  const  Userid  = User._id;

  const { page = 1, limit = 5 } = req.query;

  // const comment = await SocialComment.findById(commentId);

  // Check for comment existence
  // if (!comment) {
  //   throw new ApiError(404, "Comment does not exist");
  // }
  // console.log(Userid)
  const Bookmarked_posts_aggregate = bookmark.aggregate([
      { $match:
          {bookamrked_By:new mongoose.Types.ObjectId(Userid)} 
      }, // Match products based on the query parameters
      
      { 
          $lookup: {
              from: 'posts', // Name of the ratings collection
              localField: 'post_id',
              foreignField: '_id', // Adjust the field name if necessary
              as: 'bookmarked_posts',
             
            }
      },
      {
        $lookup: {
          from: "likes",
          localField: "post_id",
          foreignField: "post_id",
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
            localField: "post_id",
            foreignField: "post_id",  // Ensure this field matches the field in likes collection
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
              isbookmarked: true
            
        }
    },
      {
        $project:{
            likes:0
        }
      },
 
     
          
  ]);


  const Bookmark_posts_data = await bookmark.aggregatePaginate(
    Bookmarked_posts_aggregate,
    getMongoosePaginationOptions({
      page,
      limit,
      customLabels: {
        totalDocs: "totalposts",
        docs: "posts",
      },
    })
  );

  
    return res.status(200).json(
      new ApiResponse(
        200,
        {
          Bookmark_posts_data,
        },
        "posts fetched sucessfully"
      )
    );
  
});





const allposts = asynchandler(async (req,res)=>{

  const { page = 1, limit = 5 } = req.query;
  // console.log(req.user?._id  );
  
    
  const post_aggregation = posts.aggregate([
       // Match products based on the query parameters
      {
          $lookup: {
            from: "likes",
            localField: "_id",
            foreignField: "post_id",
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
              foreignField: "post_id",  // Ensure this field matches the field in likes collection
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
        $lookup: {
            from: "bookmarks",
            localField: "_id",
            foreignField: "post_id",  // Ensure this field matches the field in likes collection
            as: "isbookmarked",
            pipeline: [
                {
                    $match: {
                      bookamrked_By: new mongoose.Types.ObjectId(req.user?._id),
                    },
                },
            ],
        },
      },
      {
          $addFields: {
              likesCount: { $size: "$likes" },
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
              isbookmarked: {
                  $cond: {
                    if: {
                      $gte: [
                        {
                          // if the isLiked key has document in it
                          $size: "$isbookmarked",
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
          $project:{
              likes:0
          }
        },
   
      

  ])


  const posts_data = await posts.aggregatePaginate(
    post_aggregation,
    getMongoosePaginationOptions({
      page,
      limit,
      customLabels: {
        totalDocs: "totalposts",
        docs: "posts",
      },
    })
  );


  return res
  .status(200)
  .json(
      new ApiResponse(
          200,
          
          posts_data
          ,
          "products fetched sucessfully")
  )

})







  export { createpost, 
           updatefeatureimage,
           remove_post,
           allposts,
           bookmarkPost,
           bookmark_post_list
          };