import mongoose from "mongoose";

export async function connectDB(){

    try{

        console.log("🔄 Connecting to MongoDB...");

        await mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 30000
        });

        console.log("✅ MongoDB Connected");

    }catch(error){

        console.log("❌ MongoDB Connection Failed:", error.message);

        process.exit(1);
    }

}