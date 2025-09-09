import { NextResponse } from "next/server";
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(request: Request) {
  console.log('🚀 Publish API called');
  
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
      const { payload } = await jwtVerify(
        token,
        new TextEncoder().encode(process.env.JWT_SECRET || '')
      );

      console.log('✅ JWT verification successful');

      if (!payload || typeof payload !== 'object' || !('id' in payload)) {
        console.log('❌ Invalid token format');
        return NextResponse.json(
          { error: 'Invalid token' },
          { status: 401 }
        );
      }

      const userId = payload.id as string;
      console.log('👤 User ID:', userId);
      
      // Get the form data from request
      const formData = await request.formData();
      const title = formData.get('title') as string;
      const content = formData.get('content') as string;
      const files = formData.getAll('files') as File[];

      console.log('📝 Publish data:', { 
        title: title?.substring(0, 50) + '...', 
        contentLength: content?.length,
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

      // Create the published post
      console.log('💾 Creating published post in database...');
      const post = await prisma.post.create({
        data: {
          title,
          content,
          status: "published",
          writingPhase: "Published",
          excerpt: content.slice(0, 150) + "...",
          authorId: userId,
          wordCount: content.split(/\s+/).length,
        },
      });
      
      console.log('✅ Published post created successfully:', post.id);

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

      console.log('🎉 Post published successfully');
      return NextResponse.json({ 
        success: true, 
        postId: post.id,
        writingPhase: "Published",
        message: 'Post published successfully'
      });

    } catch (verifyError) {
      console.error('❌ Token verification error:', verifyError);
      return NextResponse.json(
        { error: 'Invalid authentication token' },
        { status: 401 }
      );
    }

  } catch (error) {
    console.error('❌ Error publishing post:', error);
    return NextResponse.json(
      { error: 'Failed to publish post', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}