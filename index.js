import express from "express";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();
import connectDB from "./Src/db/index.js";
import userRouter from "./Src/routes/user.route.js";
import postRouter from "./Src/routes/post.route.js";
import cookieParser from "cookie-parser";
const app = express()
const port = process.env.PORT || 5000
app.use(cors({
    origin:"http://localhost:5173",
    credentials:true
}))
app.use(cookieParser())
app.use(express.json())

app.use("/api/user",userRouter)
app.use("/api/post",postRouter)

app.get("/", (req, res) => {
    res.send("Hello World!")
})



connectDB()
.then(()=>{
    app.listen(port, () => {
        console.log(`Example app listening on port ${port}`)
    })
})
.catch((error)=>{
    console.error("Error connecting to MongoDB:", error);
})
