import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./src/db/index.js";
import userRouter from "./src/routes/user.routes.js";
import guarantorRouter from "./src/routes/guarantor.routes.js";
import loanRouter from "./src/routes/loan.routes.js";
import cookieParser from "cookie-parser";

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const port = process.env.PORT || 5000;

// CORS configuration
app.use(cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173", // Use env variable for client URL
    credentials: true
}));

// Middleware
app.use(cookieParser());
app.use(express.json());

// Routes
app.use("/api/v1/", userRouter);
app.use("/api/v1/", loanRouter);
app.use("/api/v1/", guarantorRouter); // Add guarantor routes here


// Test route
app.get("/", (req, res) => {
    res.send("Hello World!");
});

// MongoDB connection and server start
const startServer = async () => {
  try {
    await connectDB(); // Ensure you have the correct DB connection logic in the connectDB file
    app.listen(port, () => {
        console.log(`Server is running on port ${port}`);
    });
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
  }
};

// Start the server
startServer();
