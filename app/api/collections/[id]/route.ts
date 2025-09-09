// app/api/collections/[id]/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyJWT } from '@/lib/jwt';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Get token from cookies
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
    
    const result = await verifyJWT(token);
    if (!result?.payload?.id) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }
    
    const userId = result.payload.id as string;
    const collectionId = params.id;

    // Fetch the collection with its posts
    const collection = await prisma.collection.findFirst({
      where: {
        id: collectionId,
        userId, // Ensure user can only access their own collections
      },
      include: {
        posts: {
          select: {
            id: true,
            title: true,
            content: true,
            excerpt: true,
            status: true,
            writingPhase: true,
            wordCount: true,
            likes: true,
            createdAt: true,
            updatedAt: true,
          }
        }
      }
    });

    if (!collection) {
      return NextResponse.json({ error: 'Collection not found' }, { status: 404 });
    }

    // Transform the data to make it easier to work with on the frontend
    const transformedCollection = {
      ...collection,
      posts: collection.posts.map(post => ({
        id: post.id,
        title: post.title,
        content: post.content,
        excerpt: post.excerpt,
        status: post.status,
        writingPhase: post.writingPhase,
        wordCount: post.wordCount,
        likes: post.likes,
        createdAt: post.createdAt,
        updatedAt: post.updatedAt,
        isDraft: post.status === 'draft',
        topic: post.writingPhase, // Using writingPhase as topic for now
        addedAt: post.createdAt, // For now, using post creation date
      }))
    };

    return NextResponse.json(transformedCollection);
  } catch (error) {
    console.error('Error fetching collection:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Get token from cookies
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
    
    const result = await verifyJWT(token);
    if (!result?.payload?.id) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }
    
    const userId = result.payload.id as string;
    const collectionId = params.id;
    
    const { name, description } = await request.json();
    
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json({ error: 'Collection name is required' }, { status: 400 });
    }

    // Update the collection
    const updatedCollection = await prisma.collection.update({
      where: {
        id: collectionId,
        userId, // Ensure user can only update their own collections
      },
      data: {
        name: name.trim(),
        description: description?.trim() || null,
      },
    });

    return NextResponse.json(updatedCollection);
  } catch (error: any) {
    console.error('Error updating collection:', error);
    
    // Handle Prisma not found error
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Collection not found' }, { status: 404 });
    }
    
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
