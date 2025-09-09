import { NextResponse } from "next/server";
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(request: Request) {
  console.log('🔄 Draft API called');
  
  try {
    // Get token from cookies
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;
    
    console.log('🔐 Auth token present:', !!token);

    if (!token) {
      console.log('❌ No auth token found');
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    try {
      // Verify token
      const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback_secret');
      
      // Added better error handling for the JWT verification
      let payload;
      try {
        const verified = await jwtVerify(token, secret);
        payload = verified.payload;
        console.log('✅ JWT verification successful');
      } catch (jwtError) {
        console.error('❌ JWT verification failed:', jwtError);
        return NextResponse.json(
          { error: 'Invalid or expired authentication token' },
          { status: 401 }
        );
      }

      if (!payload || !payload.id) {
        console.log('❌ Invalid token format');
        return NextResponse.json(
          { error: 'Invalid token format' },
          { status: 401 }
        );
      }

      const userId = payload.id as string;
      console.log('👤 User ID:', userId);
      
      // Get the form data from request
      const formData = await request.formData();
      const title = formData.get('title') as string;
      const content = formData.get('content') as string;
      const writingPhase = formData.get('status') as string;
      const files = formData.getAll('files') as File[];
      
      console.log('📝 Draft data:', { 
        title: title?.substring(0, 50) + '...', 
        contentLength: content?.length,
        writingPhase,
        filesCount: files.length 
      });

      // Validate required fields
      if (!title || !content) {
        console.log('❌ Missing required fields');
        return NextResponse.json(
          { error: 'Title and content are required' },
          { status: 400 }
        );
      }

      // Create the post
      console.log('💾 Creating post in database...');
      const post = await prisma.post.create({
        data: {
          title,
          content,
          status: "draft",
          writingPhase: writingPhase || "Needs Editing",
          excerpt: content.slice(0, 150) + "...",
          authorId: userId,
          wordCount: content.split(/\s+/).length,
        },
      });
      
      console.log('✅ Post created successfully:', post.id);

      // Handle file attachments if any
      if (files.length > 0) {
        console.log('📎 Processing attachments...');
        
        const attachmentPromises = files.map(async (file) => {
          const arrayBuffer = await file.arrayBuffer();
          const buffer = Buffer.from(arrayBuffer);
          
          return prisma.attachment.create({
            data: {
              fileName: file.name,
              fileType: file.type,
              fileSize: file.size,
              fileUrl: 'mongodb-file-url', // In production, use proper file storage
              postId: post.id,
            },
          });
        });

        // Save all attachments
        await Promise.all(attachmentPromises);
        console.log('✅ Attachments saved');
      }

      console.log('🎉 Draft saved successfully');
      return NextResponse.json({ 
        success: true, 
        postId: post.id,
        writingPhase: writingPhase || "Needs Editing",
        message: 'Draft saved successfully'
      });

    } catch (verifyError) {
      console.error('❌ Token verification error:', verifyError);
      return NextResponse.json(
        { error: 'Invalid authentication token' },
        { status: 401 }
      );
    }

  } catch (error) {
    console.error('❌ Error saving draft:', error);
    return NextResponse.json(
      { error: 'Failed to save draft', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}