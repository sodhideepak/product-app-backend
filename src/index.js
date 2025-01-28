import dotenv from "dotenv";
import connectdb from "./db/index.js";
import { app } from "./app.js";


dotenv.config({
    path:"./env"
})


connectdb()
// app.listen
// console.log(app())
.then(()=>{

    app.listen( process.env.PORT || 8000 , ()=>{
                console.log(`server is running on port ${process.env.PORT}`);
            })
    // app.listen(8000);
    // console.log("chalo");
    // console.log(process.env.PORT)
    // try {
    //     app.listen( process.env.PORT || 8000 , ()=>{
    //         console.log(`server is running on port ${process.env.PORT}`);
    //     })
    //     // console.log("hdnnhhdkl")
    // } catch (error) {
        
    //     console.log("here is the code")
    //     console.log(error)
    // }
})   