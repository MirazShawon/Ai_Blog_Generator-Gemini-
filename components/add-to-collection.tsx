// components/add-to-collection-dialog.tsx
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Plus, FolderPlus } from "lucide-react"

interface Collection {
  id: string
  name: string
  description: string | null
}

interface AddToCollectionDialogProps {
  postId: string
  isOpen: boolean
  onClose: () => void
}

export function AddToCollectionDialog({ postId, isOpen, onClose }: AddToCollectionDialogProps) {
  const { toast } = useToast()
  const [collections, setCollections] = useState<Collection[]>([])
  const [selectedCollections, setSelectedCollections] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newCollectionName, setNewCollectionName] = useState("")
  const [newCollectionDescription, setNewCollectionDescription] = useState("")
  const [isCreating, setIsCreating] = useState(false)

  useEffect(() => {
    if (isOpen) {
      fetchCollections()
      // Reset form state when dialog opens
      setShowCreateForm(false)
      setNewCollectionName("")
      setNewCollectionDescription("")
    }
  }, [isOpen])

  const fetchCollections = async () => {
    try {
      const response = await fetch('/api/collections')
      if (!response.ok) throw new Error('Failed to fetch collections')
      const data = await response.json()
      setCollections(data)
      
      // Fetch current collections for this post
      const postCollections = await fetch(`/api/posts/${postId}/collections`)
      if (postCollections.ok) {
        const currentCollections = await postCollections.json()
        setSelectedCollections(currentCollections.map((c: Collection) => c.id))
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load collections",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const response = await fetch(`/api/posts/${postId}/collections`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ collectionIds: selectedCollections }),
      })

      if (!response.ok) throw new Error('Failed to update collections')

      toast({
        title: "Success",
        description: "Post collections updated successfully",
      })
      onClose()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update collections",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleCreateCollection = async () => {
    if (!newCollectionName.trim()) {
      toast({
        title: "Error",
        description: "Collection name is required",
        variant: "destructive",
      })
      return
    }

    setIsCreating(true)
    try {
      const response = await fetch('/api/collections', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newCollectionName.trim(),
          description: newCollectionDescription.trim() || null,
        }),
      })

      if (!response.ok) throw new Error('Failed to create collection')

      const newCollection = await response.json()
      
      // Add to collections list and select it
      setCollections(prev => [...prev, newCollection])
      setSelectedCollections(prev => [...prev, newCollection.id])
      
      // Reset form
      setNewCollectionName("")
      setNewCollectionDescription("")
      setShowCreateForm(false)
      
      toast({
        title: "Success",
        description: `Collection "${newCollection.name}" created successfully`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create collection",
        variant: "destructive",
      })
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add to Collections</DialogTitle>
          <DialogDescription>
            Choose the collections you want to add this post to
          </DialogDescription>
        </DialogHeader>
        
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : (
          <div className="space-y-4 py-4">
            {/* Create New Collection Section */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium">Available Collections</h4>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowCreateForm(!showCreateForm)}
                  className="flex items-center gap-2"
                >
                  <FolderPlus className="h-4 w-4" />
                  {showCreateForm ? "Cancel" : "Create New"}
                </Button>
              </div>

              {showCreateForm && (
                <div className="border rounded-lg p-4 space-y-3 bg-muted/30">
                  <div className="space-y-2">
                    <Label htmlFor="collection-name">Collection Name *</Label>
                    <Input
                      id="collection-name"
                      placeholder="Enter collection name"
                      value={newCollectionName}
                      onChange={(e) => setNewCollectionName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="collection-description">Description (optional)</Label>
                    <Textarea
                      id="collection-description"
                      placeholder="Enter collection description"
                      value={newCollectionDescription}
                      onChange={(e) => setNewCollectionDescription(e.target.value)}
                      rows={2}
                    />
                  </div>
                  <Button
                    onClick={handleCreateCollection}
                    disabled={isCreating || !newCollectionName.trim()}
                    className="w-full"
                  >
                    {isCreating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Create Collection
                  </Button>
                </div>
              )}
            </div>

            {/* Existing Collections */}
            {collections.length === 0 ? (
              <div className="py-6 text-center text-muted-foreground">
                {showCreateForm ? "No collections yet. Create your first one above!" : "No collections found. Create a collection first."}
              </div>
            ) : (
              <div className="space-y-3">
                <div className="text-sm text-muted-foreground">
                  Select collections to add this post to:
                </div>
                {collections.map((collection) => (
                  <div key={collection.id} className="flex items-start space-x-3 p-2 rounded border hover:bg-muted/50">
                    <Checkbox
                      id={collection.id}
                      checked={selectedCollections.includes(collection.id)}
                      onCheckedChange={(checked) => {
                        setSelectedCollections(prev =>
                          checked
                            ? [...prev, collection.id]
                            : prev.filter(id => id !== collection.id)
                        )
                      }}
                    />
                    <div className="grid gap-1.5 leading-none">
                      <Label htmlFor={collection.id} className="font-medium">{collection.name}</Label>
                      {collection.description && (
                        <p className="text-sm text-muted-foreground">
                          {collection.description}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isLoading || isSaving}>
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}