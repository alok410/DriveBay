const express = require("express");

const dotenv = require("dotenv")  
dotenv.config()
const cookieParser = require("cookie-parser")
const UserRoutes = require("./routes/user.routes")
const app = express()
const connect = require("./db/db")
connect()


app.use(express.json())
app.use(express.urlencoded({extended:true}))
app.use(cookieParser())
app.use("/",UserRoutes)
module.exports = app