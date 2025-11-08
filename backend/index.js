import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./database/connectDB.js";
import cookieParser from "cookie-parser";

// Setting up .env
if (process.env.NODE_ENV !== "production") {
    dotenv.config({});
}

// Configuring App
const app = express();
const port = process.env.PORT || 5005;

// Database Connection
connectDB();

// CORS Setup
const corsOptions = {
    origin: "http://localhost:5173",
    credentials: true
}
app.use(cors(corsOptions));

// Default Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// REST API's


// App Entry Point
app.listen(port, () => {
    console.log(`Server running at port ${port}`);
});

