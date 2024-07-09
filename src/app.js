import dotenv from "dotenv";
import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
dotenv.config({
    path:"./.env"
})

const app = express()
app.use(cors({
    origin: process.env.CORS_ORIGN
}))
         
app.use(express.json({limit:"16kb"}))
app.use(express.urlencoded({extended:true,limit:"16kb"}))
app.use(express.static("public "))

import productrouter from "./routes/product.routes.js";
import userrouter from "./routes/user.routes.js";




app.use("/api/v1/product",productrouter)
app.use("/api/v1/users",userrouter)


export {app}