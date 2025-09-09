// Authentication endpoint for user session management
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcrypt';
import { SignJWT } from 'jose';

interface LoginCredentials {
  email: string;
  password: string;
}

// User authentication service
class AuthenticationService {
  static async verifyUserCredentials(credentials: LoginCredentials) {
    const { email, password } = credentials;
    
    // Retrieve user from database
    const userRecord = await prisma.user.findUnique({
      where: { email }
    });

    if (!userRecord) {
      console.log('User not found:', email);
      return null;
    }

    console.log('Found user:', email);
    console.log('Stored password hash:', userRecord.password.substring(0, 20) + '...');
    console.log('Input password:', password);

    // Validate password against stored hash
    const isPasswordValid = await bcrypt.compare(password, userRecord.password);
    console.log('Password validation result:', isPasswordValid);
    
    return isPasswordValid ? userRecord : null;
  }

  static async generateAuthToken(userData: any) {
    const secretKey = process.env.JWT_SECRET || 'fallback_secret';
    
    const tokenPayload = {
      id: userData.id,
      email: userData.email,
      role: userData.role
    };

    return await new SignJWT(tokenPayload)
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('7d')
      .sign(new TextEncoder().encode(secretKey));
  }

  static createAuthResponse(userInfo: any, authToken: string) {
    const responsePayload = {
      user: {
        id: userInfo.id,
        email: userInfo.email,
        name: userInfo.name,
        role: userInfo.role
      },
      success: true 
    };

    const response = NextResponse.json(responsePayload);
    
    // Configure secure authentication cookie
    const cookieOptions = {
      name: 'auth-token',
      value: authToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7, // 7 days expiration
      path: '/'
    };
    
    response.cookies.set(cookieOptions);
    return response;
  }
}

export async function POST(request: Request) {
  try {
    // Parse authentication request
    const requestBody = await request.json();
    const loginCredentials: LoginCredentials = {
      email: requestBody.email,
      password: requestBody.password
    };

    // Authenticate user credentials
    const authenticatedUser = await AuthenticationService.verifyUserCredentials(loginCredentials);

    if (!authenticatedUser) {
      return NextResponse.json(
        { error: 'Invalid password' },
        { status: 401 }
      );
    }

    // Generate secure authentication token
    const authenticationToken = await AuthenticationService.generateAuthToken(authenticatedUser);

    // Create authenticated response with secure cookie
    return AuthenticationService.createAuthResponse(authenticatedUser, authenticationToken);

  } catch (authenticationError) {
    console.error('Authentication process failed:', authenticationError);
    
    // Return more specific error information for debugging
    const errorMessage = authenticationError instanceof Error 
      ? authenticationError.message 
      : 'Internal server error';
      
    return NextResponse.json(
      { 
        error: 'Authentication failed',
        details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
      },
      { status: 500 }
    );
  }
}