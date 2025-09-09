// User registration endpoint with enhanced validation
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";

interface UserRegistrationData {
  name: string;
  email: string;
  password: string;
}

// Validation helper function
const validateRegistrationData = (userData: Partial<UserRegistrationData>) => {
  const requiredFields = ['email', 'password'];
  return requiredFields.every(field => userData[field as keyof UserRegistrationData]);
};

// Password encryption utility
const encryptUserPassword = async (plainTextPassword: string): Promise<string> => {
  const saltRounds = 10;
  return await bcrypt.hash(plainTextPassword, saltRounds);
};

// User existence checker
const checkUserExistence = async (emailAddress: string) => {
  return await prisma.user.findUnique({
    where: { email: emailAddress },
  });
};

export async function POST(request: Request) {
  let userRegistrationData: UserRegistrationData;
  
  try {
    // Extract and parse request payload
    const requestPayload = await request.json();
    userRegistrationData = {
      name: requestPayload.name,
      email: requestPayload.email,
      password: requestPayload.password
    };

    // Perform input validation
    const isDataValid = validateRegistrationData(userRegistrationData);
    if (!isDataValid) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Verify user uniqueness
    const existingUserRecord = await checkUserExistence(userRegistrationData.email);
    if (existingUserRecord) {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 409 }
      );
    }

    // Secure password processing
    const securedPassword = await encryptUserPassword(userRegistrationData.password);

    // Database user creation
    const newUserRecord = await prisma.user.create({
      data: {
        name: userRegistrationData.name,
        email: userRegistrationData.email,
        password: securedPassword,
      },
    });
    
    // Return successful registration response
    const userResponse = {
      message: "User created successfully", 
      user: {
        id: newUserRecord.id,
        name: newUserRecord.name,
        email: newUserRecord.email
      }
    };
    
    return NextResponse.json(userResponse, { status: 201 });
    
  } catch (registrationError) {
    console.error("Registration process failed:", registrationError);
    return NextResponse.json(
      { error: "Error creating user" },
      { status: 500 }
    );
  }
}