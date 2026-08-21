import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/db/mongoose/connection";
import models from "@/db/mongoose/models";
import bcrypt from "bcryptjs";
import { X_API_KEY } from "@/common/constants/environmentVariables";

export async function POST(request: NextRequest) {
  try {
    // Auth guard: only allow requests with a valid X-API-Key header
    const apiKey = request.headers.get("x-api-key");
    if (!apiKey || apiKey !== X_API_KEY) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectDB();

    const { email, password, name } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: "Email and password are required" },
        { status: 400 }
      );
    }

    // Check if admin already exists
    const existingAdmin = await models.Admins.findOne({ 
      userName: email
    });

    if (existingAdmin) {
      return NextResponse.json({
        success: false,
        message: "Admin already exists with this email"
      }, { status: 400 });
    }

    // Hash password with bcrypt before storing
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create admin user
    const admin = new models.Admins({
      userName: email,
      password: hashedPassword,
      status: "active",
      isSuperAdmin: true,
      createdBy: "system",
      updatedBy: "system"
    });

    const savedAdmin = await admin.save();

    return NextResponse.json({
      success: true,
      message: "Admin user created successfully",
      data: {
        id: savedAdmin._id,
        userName: savedAdmin.userName,
        status: savedAdmin.status,
        isSuperAdmin: savedAdmin.isSuperAdmin
      }
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}