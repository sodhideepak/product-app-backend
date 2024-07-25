import { asynchandler } from "../utils/asynchandler.js";
import { ApiError } from "../utils/ApiError.js";
import { like} from "../models/likes.model.js";
import { consumption } from "../models/consumption.model.js";
import { product } from "../models/product.models.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import mongoose from "mongoose";




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


const {current_date,current_time} = getCurrentISTDateTime();
      
console.log(current_time);
console.log(current_date);



// function formatDateToLongString(dateString) {
//   // Split the input date string
//   const [day, month, year] = dateString.split('/').map(Number);

//   // Create a new Date object
//   const date = new Date(year, month - 1, day);

//   // Format options for long day and month names
//   const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };

//   // Format the date to a long string
//   const formattedDate = new Intl.DateTimeFormat('en-IN', options).format(date);

//   return formattedDate;
// }



// Example usage
// const inputDate = "04/07/2024";
// const longFormattedDate = formatDateToLongString(inputDate);
// console.log(longFormattedDate); // Example: Thursday, July 25, 2024




const ConsumeProduct = asynchandler(async (req, res) => {
    const { product_barcode } = req.params;
  
    const product_data = await product.findOne({
        $or:[ {product_barcode}]
    });
  
    // Check for post existence
    if (!product_data) { 
      throw new ApiError(404, "Product does not exist");
    }


    const {current_date,current_time} = getCurrentISTDateTime();
      
  

  
    const data=await consumption.create({  
        product_id:product_data._id,
        consumed_By:req.user._id,
        consumed_At_date:current_date,
        consumed_At_time:current_time,
    })




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




  
const Remove_From_Consumption = asynchandler(async (req, res) => {
  const { _id } = req.params;

  const deletedProduct = await consumption.findByIdAndDelete(_id);

        if (!deletedProduct) {
            return res.status(404).json({ message: 'Product not found in Consumption' });
        }

  


    return res.status(200).json(
      new ApiResponse(
        200,
        {},
        "Product Removed from Consumpton Sucessfully"
      )
    );
  
});
  
  



 
const consumed_products = asynchandler(async (req, res) => {
  const  User  = req.user;
  const  Userid  = User._id;

  console.log(Userid);
  // const comment = await SocialComment.findById(commentId);

  // Check for comment existence
  // if (!comment) {
  //   throw new ApiError(404, "Comment does not exist");
  // }
  // console.log(Userid)
  const products_data = await consumption.aggregate([
      { $match:
          {consumed_By:new mongoose.Types.ObjectId(Userid)} 
      }, // Match products based on the query parameters
      
      { 
          $lookup: {
              from: 'producttts', // Name of the ratings collection
              localField: 'product_id',
              foreignField: '_id', // Adjust the field name if necessary
              as: 'consumed_products',
             
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
      $unwind: '$consumed_products'
    },
    {
          $project: {
            consumed_By: 1, // Exclude the _id field from the result
            consumed_At_date: 1, // Exclude the _id field from the result
            consumed_At_time: 1, // Exclude the _id field from the result
            'consumed_products.product_barcode': 1,
            'consumed_products.product_name': 1,
            'consumed_products.brand_name': 1,
            'consumed_products.product_front_image': 1,
            'consumed_products.product_category': 1,
            'ratings.product_finalscore':1,
            'ratings.product_nutriscore':1
          }
    }
          
  ]);


  
    return res.status(200).json(
      new ApiResponse(
        200,
        {
          products_data,
        },
        "products fetched sucessfully"
      )
    );
  
});










  export { ConsumeProduct, 
           Remove_From_Consumption,
           consumed_products
          };