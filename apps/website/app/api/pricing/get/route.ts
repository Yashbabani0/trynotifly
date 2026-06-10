import { connectMongoDB } from "@/lib/mongodb";
import mongoose from "mongoose";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await connectMongoDB();

    const plans = await mongoose.connection
      .collection("Plans")
      .find({})
      .sort({ sortOrder: 1 })
      .toArray();

    return NextResponse.json({
      success: true,
      plans,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch pricing plans",
      },
      { status: 500 },
    );
  }
}
