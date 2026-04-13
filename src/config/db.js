import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

export const connectDb = async () => {
    try {
        await mongoose.connect(process.env.URI, {
            dbName: "comp3133_101490785_Assigment2"
        })
        console.log("Connected to database")
    } catch(err){
        console.log("Failed to connect to database: ", err)
    }
}