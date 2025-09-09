'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Calendar, Edit, FileText, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';

interface Post {
  id: string;
  title: string;
  content: string;
  topic: string;
  createdAt: string;
  updatedAt: string;
  isDraft: boolean;
  addedAt: string;
}

interface Collection {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  posts: Post[];
}

export default function CollectionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [collection, setCollection] = useState<Collection | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const collectionId = params.id as string;

  useEffect(() => {
    if (collectionId) {
      fetchCollection();
    }
  }, [collectionId]);

  const fetchCollection = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/collections/${collectionId}`);
      
      if (response.status === 401) {
        router.push('/login');
        return;
      }
      
      if (response.status === 404) {
        toast({
          title: 'Collection not found',
          description: 'The collection you are looking for does not exist.',
          variant: 'destructive',
        });
        router.push('/collections');
        return;
      }
      
      if (!response.ok) {
        throw new Error('Failed to fetch collection');
      }
      
      const data = await response.json();
      setCollection(data);
    } catch (error) {
      console.error('Error fetching collection:', error);
      toast({
        title: 'Error',
        description: 'Failed to load collection. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const truncateContent = (content: string, maxLength: number = 200) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Skeleton className="h-8 w-32 mb-4" />
          <Skeleton className="h-10 w-64 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!collection) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Collection not found</h1>
          <Button asChild>
            <Link href="/collections">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Collections
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <Button variant="ghost" asChild className="mb-4">
          <Link href="/collections">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Collections
          </Link>
        </Button>
        
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">{collection.name}</h1>
            {collection.description && (
              <p className="text-muted-foreground mb-4">{collection.description}</p>
            )}
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>{collection.posts.length} posts</span>
              <span>Created {formatDate(collection.createdAt)}</span>
              <span>Updated {formatDate(collection.updatedAt)}</span>
            </div>
          </div>
          
          <Button variant="outline" asChild>
            <Link href={`/collections/${collection.id}/edit`}>
              <Edit className="mr-2 h-4 w-4" />
              Edit Collection
            </Link>
          </Button>
        </div>
      </div>

      {/* Posts */}
      {collection.posts.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-12">
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No posts in this collection</h3>
            <p className="text-muted-foreground text-center mb-6">
              Add posts to this collection from your drafts or dashboard.
            </p>
            <div className="flex gap-2">
              <Button asChild>
                <Link href="/dashboard">Go to Dashboard</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/drafts">Browse Drafts</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {collection.posts.map((post) => (
            <Card key={post.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <CardTitle className="text-xl">
                        <Link 
                          href={`/editor/${post.id}`}
                          className="hover:text-primary transition-colors"
                        >
                          {post.title}
                        </Link>
                      </CardTitle>
                      {post.isDraft && (
                        <span className="inline-flex items-center rounded-full border border-transparent bg-secondary text-secondary-foreground px-2.5 py-0.5 text-xs font-semibold">
                          Draft
                        </span>
                      )}
                    </div>
                    <CardDescription className="flex items-center gap-4">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Created {formatDate(post.createdAt)}
                      </span>
                      <span>•</span>
                      <span>Added to collection {formatDate(post.addedAt)}</span>
                      {post.topic && (
                        <>
                          <span>•</span>
                          <span className="inline-flex items-center rounded-full border text-foreground px-2.5 py-0.5 text-xs font-semibold">
                            {post.topic}
                          </span>
                        </>
                      )}
                    </CardDescription>
                  </div>
                  
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={`/editor/${post.id}`}>
                      <Edit className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="prose prose-sm max-w-none">
                  <p className="text-muted-foreground">
                    {truncateContent(post.content.replace(/<[^>]*>/g, ''))}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
