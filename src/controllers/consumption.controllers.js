import { asynchandler } from "../utils/asynchandler.js";
import { ApiError } from "../utils/ApiError.js";
import { like} from "../models/likes.model.js";
import { consumption } from "../models/consumption.model.js";
import { product } from "../models/product.models.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import mongoose from "mongoose";
import moment from "moment-timezone";


function getISTTime() {
    const now = moment();
    const istTime = now.tz('Asia/Kolkata');
    return istTime;
  }
 


const ConsumeProduct = asynchandler(async (req, res) => {
    const { product_barcode } = req.params;
  
    const product_data = await product.findOne({
        $or:[ {product_barcode}]
    });
  
    // Check for post existence
    if (!product_data) { 
      throw new ApiError(404, "Product does not exist");
    }

    let options = {
        timeZone: 'Asia/Kolkata',
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric',
      };
      

      
const formatter = new Intl.DateTimeFormat([], options);
console.log(formatter.format(new Date()));
console.log(new Date().toUTCString());
    //   const formatter = new Intl.DateTimeFormat([], options);
    //   console.log(formatter.format(new Date()));
      


    // Assuming input time is in GMT
const gmtTime = new Date(); // Replace with your GMT time

// Calculate IST time (GMT + 5 hours 30 minutes)
const istTime = new Date(gmtTime.getTime() + 19800 * 1000);

console.log("GMT Time:", gmtTime.toUTCString());
console.log("IST Time:", istTime.toUTCString());


const istDay = istTime.getUTCDate(); // Day of the month (1-31)
const istMonth = new Date(istTime.getTime()); // Month (0-11, where 0 is January)
const istDayName = istTime.toLocaleString('en-US', { weekday: 'long' }); // Full day name (e.g., "Monday")

// Extract time components
const istHours = istTime.getUTCHours(); // Hours (0-23)
const istMinutes = istTime.getUTCMinutes(); // Minutes (0-59)
const istSeconds = istTime.getUTCSeconds(); // Seconds (0-59)

console.log("IST Day:", istDay);
console.log("IST Monthffffffffffffffffffff:", istMonth.toUTCString()); // Note: Adjust for 0-based index
console.log("IST Date :", `${istDayName} ${istDay} ${istMonth}`);
console.log("IST Time (HH:MM:SS):", `${istHours}:${istMinutes}:${istSeconds}`);
    // const istTime = getISTTime();
    const consumed_At_day = istTime.startOf('day').toDate();
    // console.log(consumed_At_day)
    const consumed_At_time = istTime.format('HH:mm:ss'); 
    // console.log(consumed_At_time)
 
  
    // const data=await consumption.create({  
    //     product_id:product_data._id,
    //     consumed_By:req.user._id,
    //     consumed_At_day,
    //     consumed_At_time,
    //     consumedAt: istTime.toDate()

    // })




      return res.status(200).json(
        new ApiResponse(
          200,
          {
            data,
          },
          "Product Added to Consumpton Sucessfully"
        )
      );
    
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
                from: 'producttts', // Name of the ratings collection
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
  
  export { ConsumeProduct, liked_product };