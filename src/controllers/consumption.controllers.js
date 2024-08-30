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
          
            data
          ,
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
        from: 'final_products', // Name of the products collection
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
    // case 'today':
    //   consumedproductdata = products_data.filter(item => item.isToday);
    //   totalproductconsumed = consumedproductdata.length;
    //   break;
    // case 'yesterday':
    //   consumedproductdata = products_data.filter(item => item.isYesterday);
    //   totalproductconsumed = consumedproductdata.length;
    //   break;
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
    // case 'month':
    //   consumedproductdata = products_data.filter(item => item.isThisMonth);
    //   totalproductconsumed = consumedproductdata.length;
    //   break;
    default :
    consumedproductdata = products_data.filter(item => item.isThisWeek);
    totalproductconsumed = consumedproductdata.length;
    break;
  }




let totalNutritionalValue = {
  energy: 0,
  protein: 0,
  total_carbohydrates: 0,
  dietry_fibre: 0,
  total_sugar:0,
  total_fats: 0,
  saturates_fats:0,
  trans_fats:0,
  unsaturated_fats:0,
  sodium: 0,
  cholestrol: 0,
  vitamin_A: 0,
  vitamin_B: 0,
  vitamin_C: 0,
  vitamin_D: 0,
  vitamin_E: 0,
  calcium: 0,
  potassium: 0,
  iron: 0,
  zinc: 0,
  phosphorous: 0,
  magnessium: 0

  // Add more nutritional fields as needed
};

// console.log(consumedproductdata);
// console.log(consumedproductdata[0].consumed_products[0]);


consumedproductdata.forEach(product => {

  // console.log(product);
  // console.log(product.consumed_products[0]);
  
  const consumedProduct = product.consumed_products[0]; // Access the first element
  // console.log(consumedProduct);
  
  const servingSize = product.serving_size || 100; // Default to 100 if serving size is not available

  // Calculate adjusted nutritional values based on the serving size
  const nutritionalValue = consumedProduct.nutritional_value;
  const factor = servingSize / 100; // Factor to adjust nutritional values

  // Accumulate total nutritional values
  totalNutritionalValue.energy += (nutritionalValue.energy || 0) * factor;
  totalNutritionalValue.protein += (nutritionalValue.protein || 0) * factor;
  totalNutritionalValue.total_carbohydrates += (nutritionalValue.total_carbohydrates || 0) * factor;
  totalNutritionalValue.dietry_fibre += (nutritionalValue.carbohydrates.dietry_fibre || 0) * factor;
  totalNutritionalValue.total_sugar += (nutritionalValue.carbohydrates.total_sugar || 0) * factor;
  totalNutritionalValue.total_fats += (nutritionalValue.total_fats || 0) * factor;
  totalNutritionalValue.saturates_fats += (nutritionalValue.fats.saturates_fats || 0) * factor;
  totalNutritionalValue.trans_fats += (nutritionalValue.fats.trans_fats || 0) * factor;
  totalNutritionalValue.unsaturated_fats += (nutritionalValue.fats.unsaturated_fats || 0) * factor;
  totalNutritionalValue.sodium += (nutritionalValue.sodium || 0) * factor;
  totalNutritionalValue.cholestrol += (nutritionalValue.cholestrol || 0) * factor;
  totalNutritionalValue.vitamin_A += (nutritionalValue.micro_nutrients.vitamin_A || 0) * factor;
  totalNutritionalValue.vitamin_B += (nutritionalValue.micro_nutrients.vitamin_B || 0) * factor;
  totalNutritionalValue.vitamin_C += (nutritionalValue.micro_nutrients.vitamin_C || 0) * factor;
  totalNutritionalValue.vitamin_D += (nutritionalValue.micro_nutrients.vitamin_D || 0) * factor;
  totalNutritionalValue.vitamin_E += (nutritionalValue.micro_nutrients.vitamin_E || 0) * factor;
  totalNutritionalValue.calcium += (nutritionalValue.micro_nutrients.calcium || 0) * factor;
  totalNutritionalValue.potassium += (nutritionalValue.micro_nutrients.potassium || 0) * factor;
  totalNutritionalValue.iron += (nutritionalValue.micro_nutrients.iron || 0) * factor;
  totalNutritionalValue.zinc += (nutritionalValue.micro_nutrients.zinc || 0) * factor;
  totalNutritionalValue.phosphorous += (nutritionalValue.micro_nutrients.phosphorous || 0) * factor;
  totalNutritionalValue.magnessium += (nutritionalValue.micro_nutrients.magnessium || 0) * factor;
  // Continue adding and adjusting other nutritional fields as needed
  
});






  const initializeWeekData = (condition) => {
    const daysOfWeek = [];
    // console.log(condition);
  
    switch (condition) {
      case 'currentweek':
        for (let i = 0; i < 7; i++) {
          daysOfWeek.push({
            date: moment().startOf('week').add(i, 'days').format('DD/MM/YYYY'),
            products: []
          });
        }
        break;
      case 'lastweek':
        for (let i = 0; i < 7; i++) {
          daysOfWeek.push({
            date: moment().subtract(1, 'weeks').startOf('week').add(i, 'days').format('DD/MM/YYYY'),
            products: []
          });
        }
        break;
      case 'thirdlastweek':
        for (let i = 0; i < 7; i++) {
          daysOfWeek.push({
            date: moment().subtract(2, 'weeks').startOf('week').add(i, 'days').format('DD/MM/YYYY'),
            products: []
          });
        }
        break;
        case 'fourthlastweek':
          for (let i = 0; i < 7; i++) {
            daysOfWeek.push({
              date: moment().subtract(3, 'weeks').startOf('week').add(i, 'days').format('DD/MM/YYYY'),
              products: []
            });
          }
          break;
      default:
        for (let i = 0; i < 7; i++) {
          daysOfWeek.push({
            date: moment().startOf('week').add(i, 'days').format('DD/MM/YYYY'),
            products: []
          });
        }
        break;
    }
  
    return daysOfWeek;
  };
  


  const weekData = initializeWeekData(condition);
 



consumedproductdata.forEach(product => {
  const consumedDate = moment(product.consumed_At_date_converted).format('DD/MM/YYYY');
  const dayIndex = weekData.findIndex(day => day.date === consumedDate);

  if (dayIndex !== -1) {
    const consumedProduct = product.consumed_products[0]; // Access the first element
    const servingSize = product.serving_size || 100; // Default to 100 if serving size is not available


    weekData[dayIndex].products.push({
      _id: product._id,
      consumed_By:product.consumed_By,
      consumed_At_date:product.consumed_At_date,
      consumed_At_time:product.consumed_At_time,
      serving_size: servingSize,
      consumed_products: {
        product_barcode: consumedProduct.product_barcode,
        product_name: consumedProduct.product_name,
        brand_name: consumedProduct.brand_name,
        product_category:consumedProduct.product_category,
        product_front_image: consumedProduct.product_front_image
      },
    });
  }
});


function getWeekDataconditions(condition) {
  // Define the list of weeks in order
  const weeks = ["fourthlastweek", "thirdlastweek", "lastweek", "currentweek"];

  // Ensure the current week is in the list
  if (!weeks.includes(condition)) {
      return { error: "Invalid week name" };
  }

  // Find the index of the current week
  const currentIndex = weeks.indexOf(condition);
  console.log(currentIndex);
  
  const currentWeek = weeks[currentIndex]

  // Determine if there are previous and next weeks
  const hasPreviousWeek = currentIndex > 0;
  const hasNextWeek = currentIndex < weeks.length - 1;

  // Get the previous and next week names if they exist
  const previousWeek = hasPreviousWeek ? weeks[currentIndex - 1] : null;
  const nextWeek = hasNextWeek ? weeks[currentIndex + 1] : null;

  // Return the result as an object
  return {
      hasNextWeek: hasNextWeek,
      hasPreviousWeek: hasPreviousWeek,
      currentWeek: currentWeek,
      nextWeek: nextWeek || "None",
      previousWeek: previousWeek || "None"
  };
}

// Example usage
const weekDatacondition = getWeekDataconditions(condition);
// console.log(weekData);




function getWeekRange(weekLabel = 'thisweek') {
  const now = new Date();
  
  let weekOffset;
  switch (weekLabel.toLowerCase()) {
      case 'lastweek':
          weekOffset = -1;
          break;
      case 'thirdlastweek':
          weekOffset = -2;
          break;
      case 'fourthlastweek':
          weekOffset = -3;
          break;
      default:
          weekOffset = 0;
          break;
  }

  const currentDayOfWeek = now.getDay();
    
    // Calculate the start of the week (Sunday)
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - currentDayOfWeek + (weekOffset * 7));
    
    // Calculate the end of the week (Saturday)
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    
    // Format the start and end dates as day and month
    const options = { day: 'numeric', month: 'long' };
    const startDate = startOfWeek.toLocaleDateString('en-GB', options).split(' ');
    const endDate = endOfWeek.toLocaleDateString('en-GB', options).split(' ');

    // If the month is the same for both start and end dates
    if (startDate[1] === endDate[1]) {
        return `${startDate[0]}-${endDate[0]} ${startDate[1]}`;
    } else {
        return `${startDate[0]} ${startDate[1]} - ${endDate[0]} ${endDate[1]}`;
    }
}



const date_range= getWeekRange(condition)




  
    return res.status(200).json(
      new ApiResponse(
        200,
        {
          weekData,
          totalNutritionalValue,
          totalproductconsumed,
          weekDatacondition,
          date_range
        },
        "products fetched sucessfully"
      )
    );
  
});












 
const consumed_products_day = asynchandler(async (req, res) => {
  const  User  = req.user;
  const  Userid  = User._id;
// console.log(Userid);

  const { date } = req.query;
  // console.log(date);
  
  const dateObject = moment(date, "YYYY-MM-DD").toDate();

  // console.log(date);
  // console.log(dateObject);
  
  

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
  //             from: 'final_products', // Name of the ratings collection
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
        from: 'final_products',
        localField: 'product_id',
        foreignField: '_id',
        as: 'consumed_products'
      }
    },
    {
      $unwind: "$consumed_products"
    },
    {
      $project: {
        consumed_By: 1,
        consumed_At_date: 1,
        consumed_At_time: 1,
        serving_size:1,
        "consumed_products.product_barcode": 1,
        "consumed_products.product_name": 1,
        "consumed_products.brand_name": 1,
        "consumed_products.product_category": 1,
        "consumed_products.product_front_image": 1,
        "consumed_products.nutritional_value":1,
        // consumed_products: {
        //   product_barcode: 1,
        //   product_name: 1,
        //   brand_name: 1,
        //   product_category: 1,
        //   product_front_image: 1,
        //   nutritional_value:1
        // }
      }
    },
   
  ]);



  // console.log("hellllooo",products_data);
  





  
let totalNutritionalValue = {
  energy: 0,
  protein: 0,
  total_carbohydrates: 0,
  dietry_fibre: 0,
  total_sugar:0,
  total_fats: 0,
  saturates_fats:0,
  trans_fats:0,
  unsaturated_fats:0,
  sodium: 0,
  cholestrol: 0,
  vitamin_A: 0,
  vitamin_B: 0,
  vitamin_C: 0,
  vitamin_D: 0,
  vitamin_E: 0,
  calcium: 0,
  potassium: 0,
  iron: 0,
  zinc: 0,
  phosphorous: 0,
  magnessium: 0

  // Add more nutritional fields as needed
};

// console.log(consumedproductdata);
// console.log(consumedproductdata[0].consumed_products[0]);


products_data.forEach(product => {

  // console.log(product);
  // console.log(product.consumed_products[0]);
  
  const consumedProduct = product.consumed_products; // Access the first element
  // console.log(consumedProduct);
  
  const servingSize = product.serving_size || 100; // Default to 100 if serving size is not available

  // Calculate adjusted nutritional values based on the serving size
  const nutritionalValue = consumedProduct.nutritional_value;
  console.log(nutritionalValue);
  
  const factor = servingSize / 100; // Factor to adjust nutritional values

  // Accumulate total nutritional values
  totalNutritionalValue.energy += (nutritionalValue.energy || 0) * factor;
  totalNutritionalValue.protein += (nutritionalValue.protein || 0) * factor;
  totalNutritionalValue.total_carbohydrates += (nutritionalValue.total_carbohydrates || 0) * factor;
  totalNutritionalValue.dietry_fibre += (nutritionalValue.carbohydrates.dietry_fibre || 0) * factor;
  totalNutritionalValue.total_sugar += (nutritionalValue.carbohydrates.total_sugar || 0) * factor;
  totalNutritionalValue.total_fats += (nutritionalValue.total_fats || 0) * factor;
  totalNutritionalValue.saturates_fats += (nutritionalValue.fats.saturates_fats || 0) * factor;
  totalNutritionalValue.trans_fats += (nutritionalValue.fats.trans_fats || 0) * factor;
  totalNutritionalValue.unsaturated_fats += (nutritionalValue.fats.unsaturated_fats || 0) * factor;
  totalNutritionalValue.sodium += (nutritionalValue.sodium || 0) * factor;
  totalNutritionalValue.cholestrol += (nutritionalValue.cholestrol || 0) * factor;
  totalNutritionalValue.vitamin_A += (nutritionalValue.micro_nutrients.vitamin_A || 0) * factor;
  totalNutritionalValue.vitamin_B += (nutritionalValue.micro_nutrients.vitamin_B || 0) * factor;
  totalNutritionalValue.vitamin_C += (nutritionalValue.micro_nutrients.vitamin_C || 0) * factor;
  totalNutritionalValue.vitamin_D += (nutritionalValue.micro_nutrients.vitamin_D || 0) * factor;
  totalNutritionalValue.vitamin_E += (nutritionalValue.micro_nutrients.vitamin_E || 0) * factor;
  totalNutritionalValue.calcium += (nutritionalValue.micro_nutrients.calcium || 0) * factor;
  totalNutritionalValue.potassium += (nutritionalValue.micro_nutrients.potassium || 0) * factor;
  totalNutritionalValue.iron += (nutritionalValue.micro_nutrients.iron || 0) * factor;
  totalNutritionalValue.zinc += (nutritionalValue.micro_nutrients.zinc || 0) * factor;
  totalNutritionalValue.phosphorous += (nutritionalValue.micro_nutrients.phosphorous || 0) * factor;
  totalNutritionalValue.magnessium += (nutritionalValue.micro_nutrients.magnessium || 0) * factor;
  // Continue adding and adjusting other nutritional fields as needed
  
});
  


const sanitized_data = products_data.map(product => {
  
      delete product.consumed_products.nutritional_value;
 
  return product;
});


  
  
    return res.status(200).json(
      new ApiResponse(
        200,
        {
          // products_data,
          sanitized_data,
          totalNutritionalValue
          
        },
        "products fetched sucessfully"
      )
    );
  
});







const getMonthlyReport = async (req, res) => {
  
    const Userid = req.user._id;
    // const Userid= User._id
// console.log(Userid);

    const{condition}=req.params
    // console.log(condition);
    
  
    const products_data = await consumption.aggregate([
      { $match: { consumed_By: new mongoose.Types.ObjectId(Userid) } }, // Match products based on the query parameters
      
      { 
        $lookup: {
          from: 'final_products', // Name of the products collection
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
    case 'thismonth':
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
    dietry_fibre: 0,
    total_sugar:0,
    total_fats: 0,
    saturates_fats:0,
    trans_fats:0,
    unsaturated_fats:0,
    sodium: 0,
    cholestrol: 0,
    vitamin_A: 0,
    vitamin_B: 0,
    vitamin_C: 0,
    vitamin_D: 0,
    vitamin_E: 0,
    calcium: 0,
    potassium: 0,
    iron: 0,
    zinc: 0,
    phosphorous: 0,
    magnessium: 0
  
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
    totalNutritionalValue.dietry_fibre += (nutritionalValue.carbohydrates.dietry_fibre || 0) * factor;
    totalNutritionalValue.total_sugar += (nutritionalValue.carbohydrates.total_sugar || 0) * factor;
    totalNutritionalValue.total_fats += (nutritionalValue.total_fats || 0) * factor;
    totalNutritionalValue.saturates_fats += (nutritionalValue.fats.saturates_fats || 0) * factor;
    totalNutritionalValue.trans_fats += (nutritionalValue.fats.trans_fats || 0) * factor;
    totalNutritionalValue.unsaturated_fats += (nutritionalValue.fats.unsaturated_fats || 0) * factor;
    totalNutritionalValue.sodium += (nutritionalValue.sodium || 0) * factor;
    totalNutritionalValue.cholestrol += (nutritionalValue.cholestrol || 0) * factor;
    totalNutritionalValue.vitamin_A += (nutritionalValue.micro_nutrients.vitamin_A || 0) * factor;
    totalNutritionalValue.vitamin_B += (nutritionalValue.micro_nutrients.vitamin_B || 0) * factor;
    totalNutritionalValue.vitamin_C += (nutritionalValue.micro_nutrients.vitamin_C || 0) * factor;
    totalNutritionalValue.vitamin_D += (nutritionalValue.micro_nutrients.vitamin_D || 0) * factor;
    totalNutritionalValue.vitamin_E += (nutritionalValue.micro_nutrients.vitamin_E || 0) * factor;
    totalNutritionalValue.calcium += (nutritionalValue.micro_nutrients.calcium || 0) * factor;
    totalNutritionalValue.potassium += (nutritionalValue.micro_nutrients.potassium || 0) * factor;
    totalNutritionalValue.iron += (nutritionalValue.micro_nutrients.iron || 0) * factor;
    totalNutritionalValue.zinc += (nutritionalValue.micro_nutrients.zinc || 0) * factor;
    totalNutritionalValue.phosphorous += (nutritionalValue.micro_nutrients.phosphorous || 0) * factor;
    totalNutritionalValue.magnessium += (nutritionalValue.micro_nutrients.magnessium || 0) * factor;
  
    // Continue adding and adjusting other nutritional fields as needed
   
  });
  
  // console.log(products_data);
  

  function getMonthRange(input) {
    // Calculate the month offset based on the input
    let monthOffset;
    switch (input) {
        case 'currentmonth':
            monthOffset = 0;
            break;
        case 'lastmonth':
            monthOffset = -1;
            break;
        case 'thirdlastmonth':
            monthOffset = -2;
            break;
        case 'fourthlastmonth':
            monthOffset = -3;
            break;
       
    }
     
    // Get the current date
    const today = new Date();

    // Calculate the target month and year
    const targetDate = new Date(today.getFullYear(), today.getMonth() + monthOffset, 1);

    // Get the first and last day of the target month
    const firstDay = new Date(targetDate.getFullYear(), targetDate.getMonth(), 1);
    const lastDay = new Date(targetDate.getFullYear(), targetDate.getMonth() + 1, 0);

    const firstDayString = firstDay.getDate().toString().padStart(2, '0');
    const lastDayString = lastDay.getDate().toString().padStart(2, '0');
    const monthString = firstDay.toLocaleString('default', { month: 'long' });

    // Return an object with additional data
    return `${firstDayString}-${lastDayString} ${monthString}`
    // return {
    //     range: `${firstDayString}-${lastDayString} ${monthString}`,
    //     // monthName: monthString,
    // };
}




function getMonthDataConditions(condition) {
  // Define the list of months in order
  const months = ["fourthlastmonth", "thirdlastmonth", "lastmonth", "currentmonth"];

  // Ensure the current month is in the list
  if (!months.includes(condition.toLowerCase())) {
      return { error: "Invalid month name" };
  }

  // Find the index of the current month
  const currentIndex = months.indexOf(condition.toLowerCase());
  
  const currentMonth = months[currentIndex];

  // Determine if there are previous and next months
  const hasPreviousMonth = currentIndex > 0;
  const hasNextMonth = currentIndex < months.length - 1;

  // Get the previous and next month names if they exist
  const previousMonth = hasPreviousMonth ? months[currentIndex - 1] : null;
  const nextMonth = hasNextMonth ? months[currentIndex + 1] : null;

  // Return the result as an object
  return {
      hasNextMonth: hasNextMonth,
      hasPreviousMonth: hasPreviousMonth,
      currentMonth: currentMonth,
      nextMonth: nextMonth || "None",
      previousMonth: previousMonth || "None"
  };
}

// Example usage






const month_condition=getMonthDataConditions(condition)
const month_range=getMonthRange(condition)


    return res.status(200).json(
      new ApiResponse(
        200,
        {
          totalproductconsumed,
          totalNutritionalValue,
          month_range,
          month_condition
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