// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import {SignJWT, jwtVerify, type JWTPayload} from 'jose';

// Define which paths require authentication
const protectedPaths: string[] = [] // Currently empty, but can be populated as needed

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Check if the path is protected
  const isPathProtected = protectedPaths.some((path) => 
    pathname === path || pathname.startsWith(`${path}/`)
  )
  
  if (isPathProtected) {
    // Get the token from cookies
    const token = request.cookies.get('auth-token')?.value
    
    if (!token) {
      const url = new URL('/login', request.url)
      url.searchParams.set('from', pathname)
      return NextResponse.redirect(url)
    }
    
    try {
      // Verify the token
      await jwtVerify(token, new TextEncoder().encode(process.env.JWT_SECRET || 'default-secret-key'))
    } catch (error) {
      // If token is invalid, redirect to login
      const url = new URL('/login', request.url)
      url.searchParams.set('from', pathname)
      return NextResponse.redirect(url)
    }
  }
  
  return NextResponse.next()
}

// Ensure this covers the dashboard path exactly
export const config = {
  matcher: [
    '/dashboard', 
    '/dashboard/:path*', 
    '/profile/:path*', 
    '/posts/:path*'
  ],
}