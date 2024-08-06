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

console.log(weeks);



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

  // console.log(condition);

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
      $lookup: {
        from: 'productratings', // Name of the ratings collection
        localField: 'product_id',
        foreignField: 'product_id', // Adjust the field name if necessary
        as: 'ratings'
      }
    },
    { $unwind: '$ratings' },
    { $unwind: '$consumed_products' },
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
      $project: {
        consumed_By: 1,
        consumed_At_date: 1,
        consumed_At_time: 1,
        consumed_At_date_converted:1,
        serving_size:1,
        'consumed_products.product_barcode': 1,
        'consumed_products.product_name': 1,
        'consumed_products.brand_name': 1,
        'consumed_products.nutritional_value': 1,
        'consumed_products.product_front_image': 1,
        'consumed_products.product_category': 1,
        'ratings.product_finalscore': 1,
        'ratings.product_nutriscore': 1,
        isToday: 1,
        isThisWeek: 1,
        isLastWeek:1,
        isThirdLastWeek: 1,
        isFourthLastWeek:1,
        isThisMonth: 1,
      }
    }
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
    default:
      consumedproductdata = products_data; // Return all data if no specific condition is given
      totalproductconsumed = consumedproductdata.length;
  }


  // const sumNutritionalValues = (data, filterFn) => {
  //   return data.filter(filterFn).reduce((acc, item) => {
  //     const nutritionalValue = item.consumed_products.nutritional_value;
      
  //     const sumNestedValues = (obj) => {
  //       return Object.values(obj).reduce((sum, value) => {
  //         if (typeof value === 'object') {
  //           return sum + sumNestedValues(value);
  //         }
  //         return sum + value;
  //       }, 0);
  //     };
  
  //     Object.keys(nutritionalValue).forEach(key => {
  //       if (typeof nutritionalValue[key] === 'object') {
  //         acc[key] = (acc[key] || 0) + sumNestedValues(nutritionalValue[key]);
  //       } else {
  //         acc[key] = (acc[key] || 0) + nutritionalValue[key];
  //       }
  //     });
  //     return acc;
  //   }, {});
  // };





  const sumNutritionalValues = (data, filterFn) => {
    const sumNestedValues = (obj, servingSize) => {
      return Object.values(obj).reduce((sum, value) => {
        if (typeof value === 'object') {
          return sum + sumNestedValues(value, servingSize);
        }
        return sum + (value * servingSize / 100);
      }, 0);
    };
  
    return data.filter(filterFn).reduce((acc, item) => {
      const products = item.consumed_products;
      console.log(products);
  console.log();
      if (Array.isArray(products)) {
        products.forEach(product => {
          const nutritionalValue = product.nutritional_value;
          const servingSize = product.serving_size;
  
          Object.keys(nutritionalValue).forEach(key => {
            if (typeof nutritionalValue[key] === 'object') {
              acc[key] = (acc[key] || 0) + sumNestedValues(nutritionalValue[key], servingSize);
            } else {
              acc[key] = (acc[key] || 0) + (nutritionalValue[key] * servingSize / 100);
            }
          });
        });
      } else {
        console.error('consumed_products is not an array:', products);
      }
  
      return acc;
    }, {});
  };
  
  
  // console.log(sumNutritionalValues);
  
  
console.log("hello",products_data.serving_size);
// console.log(products_data);
// console.log(consumedproductdata);
  let nutritionalvaluesum;
  switch (condition) {
    case 'today':
      nutritionalvaluesum =  sumNutritionalValues(consumedproductdata, item => item.isToday);
      break; 
    case 'currentweek':
      nutritionalvaluesum =  sumNutritionalValues(consumedproductdata, item => item.isThisWeek);
      break;
    case 'lastweek':
      nutritionalvaluesum =  sumNutritionalValues(consumedproductdata, item => item.isLastWeek);
      break;
    case 'thirdlastweek':
      nutritionalvaluesum =  sumNutritionalValues(consumedproductdata, item => item.isThirdLastWeek);
      break;
    case 'fourthlastweek':
      nutritionalvaluesum =  sumNutritionalValues(consumedproductdata, item => item.isFourthLastWeek);
      break;
    default:
      nutritionalvaluesum =  sumNutritionalValues(consumedproductdata, item => item.isThisWeek);
  }



  let response = consumedproductdata.map(item => ({
    _id: item._id,
    consumed_By: item.consumed_By,
    consumed_At_date: item.consumed_At_date,
    consumed_At_time: item.consumed_At_time,
    consumed_products: {
      product_barcode: item.consumed_products.product_barcode,
      product_name: item.consumed_products.product_name,
      brand_name: item.consumed_products.brand_name,
      product_category: item.consumed_products.product_category,
      product_front_image: item.consumed_products.product_front_image
    }

  }));

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
  // console.log(weekData);



consumedproductdata.forEach(product => {
  const consumedDate = moment(product.consumed_At_date_converted).format('YYYY-MM-DD');
  const dayIndex = weekData.findIndex(day => day.date === consumedDate);
  
  if (dayIndex !== -1) {
    weekData[dayIndex].products.push({
      _id: product._id,
      consumed_By: product.consumed_By,
      consumed_At_date: product.consumed_At_date,
      consumed_At_time: product.consumed_At_time,
      serving_size:product.serving_size,
      consumed_products: {
        product_barcode: product.consumed_products.product_barcode,
        product_name: product.consumed_products.product_name,
        brand_name: product.consumed_products.brand_name,
        product_category: product.consumed_products.product_category,
        product_front_image: product.consumed_products.product_front_image
      },
      ratings: product.ratings,

    });
  }
});


// console.log('Week Data:', products_data);
// console.log('Week Data:', products_data.length);

  
    return res.status(200).json(
      new ApiResponse(
        200,
        {
          weekData,nutritionalvaluesum,totalproductconsumed
        },
        "products fetched sucessfully"
      )
    );
  
});










  export { ConsumeProduct, 
           Remove_From_Consumption,
           consumed_products
          };