// Blog Post Management Service
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { verifyJWT } from '@/lib/jwt';

const dbClient = new PrismaClient();

// Authentication and Authorization Service
class AuthService {
  static async extractUserFromRequest(request: Request) {
    const cookieHeader = request.headers.get('cookie');
    
    if (!cookieHeader) {
      throw new Error('No authentication cookies found');
    }

    const cookieMap = this.parseCookieHeader(cookieHeader);
    const authToken = cookieMap['auth-token'];
    
    if (!authToken) {
      throw new Error('Authentication token not found');
    }

    const tokenVerification = await verifyJWT(authToken);
    
    if (!tokenVerification?.payload?.id) {
      throw new Error('Invalid authentication token');
    }

    return tokenVerification.payload.id as string;
  }

  private static parseCookieHeader(cookieHeader: string) {
    return cookieHeader.split(';').reduce((cookieMap, cookieString) => {
      const [key, value] = cookieString.trim().split('=');
      if (key && value) {
        cookieMap[key] = value;
      }
      return cookieMap;
    }, {} as Record<string, string>);
  }
}

// Search and Filter Service
class PostFilterService {
  static buildDateFilterCondition(dateFilter: string) {
    const currentTime = Date.now();
    
    switch (dateFilter) {
      case 'last-week':
        return {
          createdAt: {
            gte: new Date(currentTime - 7 * 24 * 60 * 60 * 1000)
          }
        };
      case 'last-month':
        return {
          createdAt: {
            gte: new Date(currentTime - 30 * 24 * 60 * 60 * 1000)
          }
        };
      default:
        return {};
    }
  }

  static buildStatusFilterCondition(statusFilter: string) {
    return statusFilter === 'all' ? {} : { status: statusFilter };
  }

  static buildSearchConditions(searchQuery: string) {
    if (!searchQuery.trim()) {
      return {};
    }

    return {
      OR: [
        {
          title: {
            contains: searchQuery,
            mode: 'insensitive' as const
          }
        },
        {
          content: {
            contains: searchQuery,
            mode: 'insensitive' as const
          }
        },
        {
          excerpt: {
            contains: searchQuery,
            mode: 'insensitive' as const
          }
        }
      ]
    };
  }
}

// Post Data Processing Service
class PostDataProcessor {
  static formatPostsForResponse(rawPosts: any[]) {
    return rawPosts.map(postData => ({
      id: postData.id,
      title: postData.title,
      excerpt: postData.excerpt || this.generateExcerpt(postData.content),
      status: postData.status,
      date: postData.createdAt.toISOString(),
      tags: postData.collections.map((collection: any) => collection.name)
    }));
  }

  private static generateExcerpt(content: string): string {
    const maxLength = 150;
    return content.length > maxLength 
      ? content.substring(0, maxLength) + '...' 
      : content;
  }
}

// Post Retrieval Service
class PostRetrievalService {
  static async fetchUserPosts(userId: string, searchParams: URLSearchParams) {
    const searchQuery = searchParams.get('query') || '';
    const statusFilter = searchParams.get('status') || 'all';
    const dateFilter = searchParams.get('dateFilter') || 'all';

    const queryConditions = {
      authorId: userId,
      ...PostFilterService.buildStatusFilterCondition(statusFilter),
      ...PostFilterService.buildDateFilterCondition(dateFilter),
      ...PostFilterService.buildSearchConditions(searchQuery)
    };

    const databaseQuery = {
      where: queryConditions,
      include: {
        collections: {
          select: {
            name: true
          }
        }
      },
      orderBy: {
        updatedAt: 'desc' as const
      }
    };

    return await dbClient.post.findMany(databaseQuery);
  }
}

export async function GET(request: Request) {
  try {
    // Parse request parameters
    const requestUrl = new URL(request.url);
    const searchParameters = requestUrl.searchParams;

    // Authenticate and extract user ID
    const authenticatedUserId = await AuthService.extractUserFromRequest(request);

    // Retrieve user's posts with applied filters
    const userPosts = await PostRetrievalService.fetchUserPosts(authenticatedUserId, searchParameters);

    // Process and format posts for client response
    const formattedPostsData = PostDataProcessor.formatPostsForResponse(userPosts);

    return NextResponse.json(formattedPostsData);
    
  } catch (retrievalError) {
    console.error('Post retrieval failed:', retrievalError);
    
    const isAuthError = retrievalError instanceof Error && 
      (retrievalError.message.includes('authentication') || 
       retrievalError.message.includes('token') || 
       retrievalError.message.includes('cookies'));

    const statusCode = isAuthError ? 401 : 500;
    const errorMessage = isAuthError ? 'Unauthorized' : 'Internal server error';

    return NextResponse.json({ error: errorMessage }, { status: statusCode });
  }
}