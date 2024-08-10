import { asynchandler } from "../utils/asynchandler.js";
import { ApiError } from "../utils/ApiError.js";
import { like} from "../models/likes.models.js";
import { consumption } from "../models/consumption.models.js";
import { product } from "../models/product.models.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import mongoose from "mongoose";
import moment from "moment-timezone";





// const moment = require('moment');

// function getWeeksInCurrentMonth() {
//   const today = moment();
//   const currentMonth = today.month();
//   const firstDayOfMonth = today.clone().startOf('month');
//   const lastDayOfMonth = today.clone().endOf('month');

//   const weeks = [];
//   let currentWeekStart = firstDayOfMonth.clone().startOf('week');

//   while (currentWeekStart.isBefore(lastDayOfMonth)) {
//     const currentWeekEnd = currentWeekStart.clone().endOf('week');

//     // Exclude dates from the previous month
//     if (currentWeekStart.month() === currentMonth) {
//       weeks.push({
//         start: currentWeekStart.format('YYYY-MM-DD'),
//         end: currentWeekEnd.format('YYYY-MM-DD'),
//       });
//     }

//     currentWeekStart.add(1, 'week');
//   }

//   return weeks;
// }

// // Example usage:
// const weeksInCurrentMonth = getWeeksInCurrentMonth();
// console.log(weeksInCurrentMonth);

const weeks = [];
for (let week = 0; week < 4; week++) {
  const daysOfWeek = [];
  for (let i = 0; i < 7; i++) {
    daysOfWeek.push({
      date: moment().startOf('week').subtract(week, 'weeks').add(i, 'days').format('YYYY-MM-DD'),
      products: []
    });
  }
  weeks.push({
    week: week === 0 ? 'Current Week' : `Week ${week}`,
    days: daysOfWeek
  });
}

// console.log(weeks);



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

    const {serving_size}= req.body;
  
    const product_data = await product.findOne({
        $or:[ {product_barcode}]
    });
  
    // Check for post existence
    if (!product_data) { 
      throw new ApiError(404, "Product does not exist");
    }


    const {current_date,current_time} = getCurrentISTDateTime();
      

  // const current_date = "27/07/2024"
  // const current_time = "12:30:19 am"

  
    const data=await consumption.create({  
        product_id:product_data._id,
        consumed_By:req.user._id,
        consumed_At_date:current_date,
        // consumed_At_date:"10/07/2024",
        consumed_At_time:current_time,
        serving_size
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

  const { condition } = req.params;



  const products_data = await consumption.aggregate([
    { $match: { consumed_By: new mongoose.Types.ObjectId(Userid) } }, // Match products based on the query parameters
    
    { 
      $lookup: {
        from: 'producttts', // Name of the products collection
        localField: 'product_id',
        foreignField: '_id', // Adjust the field name if necessary
        as: 'consumed_products'
      }
    },
    {
      $addFields: {
        consumed_At_date_converted: {
          $dateFromString: {
            dateString: '$consumed_At_date',
            format: '%d/%m/%Y', // Adjust format according to your date string format
            onError: new Date(0) // Default value in case of conversion error
          }
        }
      }
    },
    {
      $addFields: {
        isToday: {
          $eq: [{ $dateToString: { format: "%Y-%m-%d", date: "$consumed_At_date_converted" } }, moment().format("YYYY-MM-DD")]
        },
        isThisWeek: {
          $and: [
            { $gte: ["$consumed_At_date_converted", moment().startOf('week').toDate()] },
            { $lte: ["$consumed_At_date_converted", moment().endOf('week').toDate()] }
          ]
        },
        isLastWeek: {
          $and: [
            { $gte: ["$consumed_At_date_converted", moment().subtract(1, 'weeks').startOf('week').toDate()] },
            { $lte: ["$consumed_At_date_converted", moment().subtract(1, 'weeks').endOf('week').toDate()] }
          ]
        },
        isThirdLastWeek: {
          $and: [
            { $gte: ["$consumed_At_date_converted", moment().subtract(2, 'weeks').startOf('week').toDate()] },
            { $lte: ["$consumed_At_date_converted", moment().subtract(2, 'weeks').endOf('week').toDate()] }
          ]
        },
        isFourthLastWeek: {
          $and: [
            { $gte: ["$consumed_At_date_converted", moment().subtract(3, 'weeks').startOf('week').toDate()] },
            { $lte: ["$consumed_At_date_converted", moment().subtract(3, 'weeks').endOf('week').toDate()] }
          ]
        },
        isThisMonth: {
          $and: [
            { $gte: ["$consumed_At_date_converted", moment().startOf('month').toDate()] },
            { $lte: ["$consumed_At_date_converted", moment().endOf('month').toDate()] }
          ]
        }
      }
    },
    {
      $addFields: {
        productsCount: { $size: "$consumed_products" }
      }
    },
  
  ]);
  
  // Assuming request has a field "condition" that states 'today', 'yesterday', or 'week'
  let consumedproductdata;
  let totalproductconsumed;
  switch (condition) {
    case 'today':
      consumedproductdata = products_data.filter(item => item.isToday);
      totalproductconsumed = consumedproductdata.length;
      break;
    case 'yesterday':
      consumedproductdata = products_data.filter(item => item.isYesterday);
      totalproductconsumed = consumedproductdata.length;
      break;
    case 'currentweek':
      consumedproductdata = products_data.filter(item => item.isThisWeek);
      totalproductconsumed = consumedproductdata.length;
      break;
    case 'lastweek':
      consumedproductdata = products_data.filter(item => item.isLastWeek);
      totalproductconsumed = consumedproductdata.length;
      break;
    case 'thirdlastweek':
      consumedproductdata = products_data.filter(item => item.isThirdLastWeek);
      totalproductconsumed = consumedproductdata.length;
      break;
    case 'fourthlastweek':
      consumedproductdata = products_data.filter(item => item.isFourthLastWeek);
      totalproductconsumed = consumedproductdata.length;
      break;
    case 'month':
      consumedproductdata = products_data.filter(item => item.isThisMonth);
      totalproductconsumed = consumedproductdata.length;
      break;
    default :
    consumedproductdata = products_data.filter(item => item.isThisWeek);
    totalproductconsumed = consumedproductdata.length;
    break;
  }




let totalNutritionalValue = {
  energy: 0,
  protein: 0,
  total_carbohydrates: 0,
  total_fats: 0,
  sodium: 0,
  cholestrol: 0
  // Add more nutritional fields as needed
};


consumedproductdata.forEach(product => {

  const consumedProduct = product.consumed_products[0]; // Access the first element
  const servingSize = product.serving_size || 100; // Default to 100 if serving size is not available

  // Calculate adjusted nutritional values based on the serving size
  const nutritionalValue = consumedProduct.nutritional_value;
  const factor = servingSize / 100; // Factor to adjust nutritional values

  // Accumulate total nutritional values
  totalNutritionalValue.energy += (nutritionalValue.energy || 0) * factor;
  totalNutritionalValue.protein += (nutritionalValue.protein || 0) * factor;
  totalNutritionalValue.total_carbohydrates += (nutritionalValue.total_carbohydrates || 0) * factor;
  totalNutritionalValue.total_fats += (nutritionalValue.total_fats || 0) * factor;
  totalNutritionalValue.sodium += (nutritionalValue.sodium || 0) * factor;
  totalNutritionalValue.cholestrol += (nutritionalValue.cholestrol || 0) * factor;
  // Continue adding and adjusting other nutritional fields as needed
 
});


 

  const initializeWeekData = (condition) => {
    const daysOfWeek = [];
    // console.log(condition);
  
    switch (condition) {
      case 'currentWeek':
        for (let i = 0; i < 7; i++) {
          daysOfWeek.push({
            date: moment().startOf('week').add(i, 'days').format('YYYY-MM-DD'),
            products: []
          });
        }
        break;
      case 'lastweek':
        for (let i = 0; i < 7; i++) {
          daysOfWeek.push({
            date: moment().subtract(1, 'weeks').startOf('week').add(i, 'days').format('YYYY-MM-DD'),
            products: []
          });
        }
        break;
      case 'thirdlastweek':
        for (let i = 0; i < 7; i++) {
          daysOfWeek.push({
            date: moment().subtract(2, 'weeks').startOf('week').add(i, 'days').format('YYYY-MM-DD'),
            products: []
          });
        }
        break;
        case 'fourthlastweek':
          for (let i = 0; i < 7; i++) {
            daysOfWeek.push({
              date: moment().subtract(3, 'weeks').startOf('week').add(i, 'days').format('YYYY-MM-DD'),
              products: []
            });
          }
          break;
      default:
        for (let i = 0; i < 7; i++) {
          daysOfWeek.push({
            date: moment().startOf('week').add(i, 'days').format('YYYY-MM-DD'),
            products: []
          });
        }
        break;
    }
  
    return daysOfWeek;
  };
  


  const weekData = initializeWeekData(condition);
 








consumedproductdata.forEach(product => {
  const consumedDate = moment(product.consumed_At_date_converted).format('YYYY-MM-DD');
  const dayIndex = weekData.findIndex(day => day.date === consumedDate);

  if (dayIndex !== -1) {
    const consumedProduct = product.consumed_products[0]; // Access the first element
    const servingSize = product.serving_size || 100; // Default to 100 if serving size is not available

    // Initialize total nutritional values object if it doesn't exist
    if (!weekData[dayIndex].totalNutritionalValue) {
      weekData[dayIndex].totalNutritionalValue = {
        energy: 0,
        protein: 0,
        total_carbohydrates: 0,
        total_fats: 0,
        sodium: 0,
        cholestrol: 0
        // Add more nutritional fields as needed
      };
    }

    // Calculate adjusted nutritional values based on the serving size
    const nutritionalValue = consumedProduct.nutritional_value;
    const factor = servingSize / 100; // Factor to adjust nutritional values

    weekData[dayIndex].totalNutritionalValue.energy += (nutritionalValue.energy || 0) * factor;
    weekData[dayIndex].totalNutritionalValue.protein += (nutritionalValue.protein || 0) * factor;
    weekData[dayIndex].totalNutritionalValue.total_carbohydrates += (nutritionalValue.total_carbohydrates || 0) * factor;
    weekData[dayIndex].totalNutritionalValue.total_fats += (nutritionalValue.total_fats || 0) * factor;
    weekData[dayIndex].totalNutritionalValue.sodium += (nutritionalValue.sodium || 0) * factor;
    weekData[dayIndex].totalNutritionalValue.cholestrol += (nutritionalValue.cholestrol || 0) * factor;
    // Continue adding and adjusting other nutritional fields as needed

    // Add product details to the week's data
    weekData[dayIndex].products.push({
      _id: product._id,
      serving: servingSize,
      consumed_product: {
        product_barcode: consumedProduct.product_barcode,
        product_name: consumedProduct.product_name,
      },
    });
  }
});




  
    return res.status(200).json(
      new ApiResponse(
        200,
        {
          weekData,
          totalNutritionalValue,totalproductconsumed
        },
        "products fetched sucessfully"
      )
    );
  
});












 
const consumed_products_day = asynchandler(async (req, res) => {
  const  User  = req.user;
  const  Userid  = User._id;
console.log(Userid);

  const { date } = req.query;
  const dateObject = moment(date, "YYYY-MM-DD").toDate();

  console.log(date);
  console.log(dateObject);
  
  

  // console.log(Userid);

  // console.log( moment().startOf('month').toDate(),
  //  moment().endOf('month').toDate());
  // const comment = await SocialComment.findById(commentId);

  // Check for comment existence
  // if (!comment) {
  //   throw new ApiError(404, "Comment does not exist");
  // }
  // console.log(Userid)
  // const products_data = await consumption.aggregate([
  //     { $match:
  //         {consumed_By:new mongoose.Types.ObjectId(Userid)} 
  //     }, // Match products based on the query parameters
      
  //     { 
  //         $lookup: {
  //             from: 'producttts', // Name of the ratings collection
  //             localField: 'product_id',
  //             foreignField: '_id', // Adjust the field name if necessary
  //             as: 'consumed_products',
             
  //           }
  //     },
  //     {
  //       $lookup: {
  //           from: 'productratings', // Name of the ratings collection
  //           localField: 'product_id',
  //           foreignField: 'product_id', // Adjust the field name if necessary
  //           as: 'ratings'
  //       }
  //   },
  //   {
  //     $unwind: '$ratings'
  //   },
  //   {
  //     $unwind: '$consumed_products'
  //   },
  //   {
  //         $project: {
  //           consumed_By: 1, // Exclude the _id field from the result
  //           consumed_At_date: 1, // Exclude the _id field from the result
  //           consumed_At_time: 1, // Exclude the _id field from the result
  //           'consumed_products.product_barcode': 1,
  //           'consumed_products.product_name': 1,
  //           'consumed_products.brand_name': 1,
  //           'consumed_products.product_front_image': 1,
  //           'consumed_products.product_category': 1,
  //           'ratings.product_finalscore':1,
  //           'ratings.product_nutriscore':1
  //         }
  //   }
          
  // ]);


  const products_data = await consumption.aggregate([
    {
      $match: {
        consumed_By: new mongoose.Types.ObjectId(Userid),
        consumed_At_date: date, // Directly match the string date
      }
    },
    {
      $lookup: {
        from: 'producttts',
        localField: 'product_id',
        foreignField: '_id',
        as: 'consumed_products'
      }
    },
    {
      $project: {
        consumed_By: 1,
        consumed_At_date: 1,
        consumed_At_time: 1,
        serving_size:1,
        consumed_products: {
          product_barcode: 1,
          product_name: 1,
          brand_name: 1,
          product_category: 1,
          product_front_image: 1
        }
      }
    }
  ]);
  
  
    return res.status(200).json(
      new ApiResponse(
        200,
        {
          products_data
        },
        "products fetched sucessfully"
      )
    );
  
});







const getMonthlyReport = async (req, res) => {
  
    const Userid = req.user._id;
    // const Userid= User._id
console.log(Userid);

    const{condition}=req.params
    console.log(condition);
    
  
    const products_data = await consumption.aggregate([
      { $match: { consumed_By: new mongoose.Types.ObjectId(Userid) } }, // Match products based on the query parameters
      
      { 
        $lookup: {
          from: 'producttts', // Name of the products collection
          localField: 'product_id',
          foreignField: '_id', // Adjust the field name if necessary
          as: 'consumed_products'
        }
      },
      {
        $addFields: {
          consumed_At_date_converted: {
            $dateFromString: {
              dateString: '$consumed_At_date',
              format: '%d/%m/%Y', // Adjust format according to your date string format
              onError: new Date(0) // Default value in case of conversion error
            }
          }
        }
      },
      {
        $addFields: {
          isThisMonth: {
            $and: [
              { $gte: ["$consumed_At_date_converted", moment().startOf('month').toDate()] },
              { $lte: ["$consumed_At_date_converted", moment().endOf('month').toDate()] }
            ]
          },
          isLastMonth: {
            $and: [
              { $gte: ["$consumed_At_date_converted", moment().subtract(1, 'month').startOf('month').toDate()] },
              { $lte: ["$consumed_At_date_converted", moment().subtract(1, 'month').endOf('month').toDate()] }
            ]
          },
          isThirdLastMonth: {
            $and: [
              { $gte: ["$consumed_At_date_converted", moment().subtract(2, 'month').startOf('month').toDate()] },
              { $lte: ["$consumed_At_date_converted", moment().subtract(2, 'month').endOf('month').toDate()] }
            ]
          },
          isFourthLastMonth: {
            $and: [
              { $gte: ["$consumed_At_date_converted", moment().subtract(3, 'month').startOf('month').toDate()] },
              { $lte: ["$consumed_At_date_converted", moment().subtract(3, 'month').endOf('month').toDate()] }
            ]
          },
        }
      },
      {
        $addFields: {
          productsCount: { $size: "$consumed_products" }
        }
      },
    
    ]);
    


     // Assuming request has a field "condition" that states 'today', 'yesterday', or 'week'
  let consumedproductdata;
  let totalproductconsumed;
  switch (condition) {
    case 'month':
      consumedproductdata = products_data.filter(item => item.isThisMonth);
      totalproductconsumed = consumedproductdata.length;
      break;
    case 'lastmonth':
      consumedproductdata = products_data.filter(item => item.isLastMonth);
      totalproductconsumed = consumedproductdata.length;
      break;
    case 'thirdlastmonth':
      consumedproductdata = products_data.filter(item => item.isThirdLastMonth);
      totalproductconsumed = consumedproductdata.length;
      break;
    case 'fourthlastmonth':
      consumedproductdata = products_data.filter(item => item.isFourthLastMonth);
      totalproductconsumed = consumedproductdata.length;
      break;
    default:
      consumedproductdata = products_data.filter(item => item.isThisMonth);
      totalproductconsumed = consumedproductdata.length;
      break;
  }


  let totalNutritionalValue = {
    energy: 0,
    protein: 0,
    total_carbohydrates: 0,
    total_fats: 0,
    sodium: 0,
    cholestrol: 0
    // Add more nutritional fields as needed
  };

  consumedproductdata.forEach(product => {

    const consumedProduct = product.consumed_products[0]; // Access the first element
    const servingSize = product.serving_size || 100; // Default to 100 if serving size is not available
  
    // Calculate adjusted nutritional values based on the serving size
    const nutritionalValue = consumedProduct.nutritional_value;
    const factor = servingSize / 100; // Factor to adjust nutritional values
  
    // Accumulate total nutritional values
    totalNutritionalValue.energy += (nutritionalValue.energy || 0) * factor;
    totalNutritionalValue.protein += (nutritionalValue.protein || 0) * factor;
    totalNutritionalValue.total_carbohydrates += (nutritionalValue.total_carbohydrates || 0) * factor;
    totalNutritionalValue.total_fats += (nutritionalValue.total_fats || 0) * factor;
    totalNutritionalValue.sodium += (nutritionalValue.sodium || 0) * factor;
    totalNutritionalValue.cholestrol += (nutritionalValue.cholestrol || 0) * factor;
    // Continue adding and adjusting other nutritional fields as needed
   
  });
  
  console.log(products_data);
  




    return res.status(200).json(
      new ApiResponse(
        200,
        {
          totalproductconsumed,totalNutritionalValue
        },
        "products fetched sucessfully"
      )
    );
  }


  export { ConsumeProduct, 
           Remove_From_Consumption,
           consumed_products,
           consumed_products_day,
           getMonthlyReport
          };