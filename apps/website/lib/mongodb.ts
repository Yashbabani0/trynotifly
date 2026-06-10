import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI!;
const DB_NAME = process.env.MONGODB_DB ?? "Plans";

let isConnected = false;

export async function connectMongoDB() {
  if (isConnected) return;

  await mongoose.connect(MONGODB_URI, {
    dbName: DB_NAME,
  });

  isConnected = true;

  console.log("MongoDB connected");
}
