import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { jwtVerify } from 'jose';

// Create a fresh Prisma client for each request to avoid caching issues
function createPrismaClient() {
  return new PrismaClient();
}

export async function GET(request: Request) {
  console.log('🔍 Draft fetch API called');
  
  try {
    // Get the URL parameters
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query') || '';
    const writingPhase = searchParams.get('writingPhase') || 'all';
    
    console.log('📋 Search parameters:', { query, writingPhase });
    
    // Get the token from cookies
    const cookieHeader = request.headers.get('cookie');
    const cookies = cookieHeader?.split(';').reduce((acc, cookie) => {
      const [key, value] = cookie.trim().split('=');
      acc[key] = value;
      return acc;
    }, {} as Record<string, string>) || {};
    
    const token = cookies['auth-token'];
    
    if (!token) {
      console.log('❌ No auth token found');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Verify and decode the JWT
    let result;
    try {
      const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback_secret');
      result = await jwtVerify(token, secret);
    } catch (jwtError) {
      console.log('❌ JWT verification failed:', jwtError);
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }
    
    if (!result || !result.payload) {
      console.log('❌ Invalid token');
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }
    
    const userId = result.payload.id as string;
    console.log('👤 User ID:', userId);

    // Prepare writing phase filter
    let phaseCondition = {};
    if (writingPhase !== 'all') {
      phaseCondition = {
        writingPhase: writingPhase
      };
    }
    
    // Prepare search condition - only add search if query is not empty
    let searchCondition = {};
    if (query.trim()) {
      searchCondition = {
        OR: [
          {
            title: {
              contains: query,
              mode: 'insensitive'
            }
          },
          {
            content: {
              contains: query,
              mode: 'insensitive'
            }
          },
          {
            excerpt: {
              contains: query,
              mode: 'insensitive'
            }
          }
        ]
      };
    }
    
    console.log('🔎 Query conditions:', { phaseCondition, searchCondition });
    
    // Create a fresh Prisma client to avoid caching issues
    const prisma = createPrismaClient();
    
    try {
      // Query the database
      const drafts = await prisma.post.findMany({
        where: {
          authorId: userId,
          status: "draft",
          ...phaseCondition,
          ...searchCondition
        },
        select: {
          id: true,
          title: true,
          excerpt: true,
          writingPhase: true,
          createdAt: true,
          wordCount: true,
          updatedAt: true,
          content: true, // Include content for excerpt generation if needed
        },
        orderBy: {
          updatedAt: 'desc'
        }
      });

      console.log(`📊 Found ${drafts.length} drafts`);

      // Format the results and generate excerpt if missing
      const formattedDrafts = drafts.map((draft: any) => ({
        id: draft.id,
        title: draft.title,
        excerpt: draft.excerpt || (draft.content ? draft.content.slice(0, 150) + '...' : 'No content available'),
        writingPhase: draft.writingPhase || 'Needs Editing',
        date: draft.updatedAt.toISOString(),
        wordCount: draft.wordCount || (draft.content ? draft.content.split(/\s+/).length : 0)
      }));
      
      console.log('✅ Returning formatted drafts');
      return NextResponse.json(formattedDrafts);
      
    } finally {
      await prisma.$disconnect();
    }
    
  } catch (error) {
    console.error('❌ Error fetching drafts:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    // Get the token from cookies
    const cookieHeader = request.headers.get('cookie');
    const cookies = cookieHeader?.split(';').reduce((acc, cookie) => {
      const [key, value] = cookie.trim().split('=');
      acc[key] = value;
      return acc;
    }, {} as Record<string, string>) || {};
    
    const token = cookies['auth-token'];
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Verify and decode the JWT
    let result;
    try {
      const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback_secret');
      result = await jwtVerify(token, secret);
    } catch (jwtError) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }
    
    if (!result || !result.payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }
    
    const userId = result.payload.id as string;

    // Get the post ID from the URL
    const { searchParams } = new URL(request.url);
    const postId = searchParams.get('id');

    if (!postId) {
      return NextResponse.json(
        { error: "Post ID is required" },
        { status: 400 }
      );
    }

    // Create a fresh Prisma client
    const prisma = createPrismaClient();
    
    try {
      // Verify the post belongs to the user
      const post = await prisma.post.findUnique({
        where: {
          id: postId,
        },
        select: {
          authorId: true
        }
      });

      if (!post) {
        return NextResponse.json(
          { error: "Post not found" },
          { status: 404 }
        );
      }

      if (post.authorId !== userId) {
        return NextResponse.json(
          { error: "Not authorized to delete this post" },
          { status: 403 }
        );
      }

      // Delete the post
      await prisma.post.delete({
        where: {
          id: postId
        }
      });

      return new NextResponse(null, { status: 204 });
      
    } finally {
      await prisma.$disconnect();
    }
    
  } catch (error) {
    console.error("Error deleting draft:", error);
    return NextResponse.json(
      { error: "Failed to delete draft" },
      { status: 500 }
    );
  }
}