import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

export async function connectToDb() {
    try {
        await mongoose.connect(process.env.ATLAS_URI, {
          dbName: process.env.DB_NAME,
        });
        console.log("Connection to DB established!");
    } catch (error) {
        console.error(error);
    };
};