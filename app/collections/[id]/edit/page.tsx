'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Loader2, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

interface Collection {
  id: string;
  name: string;
  description: string;
}

export default function EditCollectionPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [collection, setCollection] = useState<Collection | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });

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
          description: 'The collection you are trying to edit does not exist.',
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
      setFormData({
        name: data.name,
        description: data.description || '',
      });
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

  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Please enter a collection name.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsSaving(true);
      const response = await fetch(`/api/collections/${collectionId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.status === 401) {
        router.push('/login');
        return;
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update collection');
      }

      toast({
        title: 'Success',
        description: 'Collection updated successfully.',
      });

      router.push(`/collections/${collectionId}`);
    } catch (error) {
      console.error('Error updating collection:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update collection. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
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
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Button variant="ghost" asChild className="mb-4">
            <Link href={`/collections/${collectionId}`}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Collection
            </Link>
          </Button>
          
          <h1 className="text-3xl font-bold mb-2">Edit Collection</h1>
          <p className="text-muted-foreground">
            Update your collection details below.
          </p>
        </div>

        {/* Edit Form */}
        <Card>
          <CardHeader>
            <CardTitle>Collection Details</CardTitle>
            <CardDescription>
              Make changes to your collection information.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Collection Name *</Label>
              <Input
                id="name"
                placeholder="Enter collection name..."
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Enter collection description (optional)..."
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                className="w-full"
                rows={3}
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                  </>
                )}
              </Button>
              <Button variant="outline" asChild>
                <Link href={`/collections/${collectionId}`}>Cancel</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
