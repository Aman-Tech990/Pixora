import express from "express";
import dotenv from "dotenv";
import connectDB from "./database/connectDB.js";

if (process.env.NODE_ENV !== "production") {
    dotenv.config({});
}

const app = express();
const port = process.env.PORT || 5005;

connectDB();



app.listen(port, () => {
    console.log(`Server running at port ${port}`);
});

