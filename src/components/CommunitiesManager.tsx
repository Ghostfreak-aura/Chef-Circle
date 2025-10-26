import { useState, useEffect } from 'react';
import { Card, CardContent, CardFooter, CardHeader } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './ui/dialog';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Users, Plus, Search, TrendingUp, UserPlus, Check, MoreVertical, Pencil, Trash2 } from 'lucide-react';
import { Community } from '../data/mockCommunities';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { getCommunities, createCommunity as createCommunityAPI, joinCommunity as joinCommunityAPI, leaveCommunity as leaveCommunityAPI, updateCommunity as updateCommunityAPI, deleteCommunity as deleteCommunityAPI, isAuthenticated, getCurrentUser } from '../utils/supabase/client';
import { toast } from 'sonner@2.0.3';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from './ui/alert-dialog';

interface CommunitiesManagerProps {
  onCommunitySelect: (communityId: string | null) => void;
  selectedCommunityId: string | null;
}

export function CommunitiesManager({ onCommunitySelect, selectedCommunityId }: CommunitiesManagerProps) {
  const [communities, setCommunities] = useState<Community[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedCommunity, setSelectedCommunity] = useState<Community | null>(null);
  const [currentUserName, setCurrentUserName] = useState<string | null>(null);
  const [newCommunity, setNewCommunity] = useState({
    name: '',
    description: '',
    category: '',
    tags: '',
  });
  const [editCommunity, setEditCommunity] = useState({
    name: '',
    description: '',
    category: '',
    tags: '',
  });

  useEffect(() => {
    loadCommunities();
    loadCurrentUser();
  }, []);

  const loadCurrentUser = async () => {
    try {
      if (isAuthenticated()) {
        const user = await getCurrentUser();
        setCurrentUserName(user?.name || null);
      }
    } catch (error) {
      console.error('Error loading current user:', error);
    }
  };

  const loadCommunities = async () => {
    try {
      const data = await getCommunities();
      setCommunities(data);
    } catch (error) {
      console.error('Error loading communities:', error);
    }
  };

  const handleJoinToggle = async (communityId: string) => {
    if (!isAuthenticated()) {
      toast.error('Please sign in to join communities');
      return;
    }

    try {
      const community = communities.find(c => c.id === communityId);
      if (!community) return;

      if (community.isJoined) {
        await leaveCommunityAPI(communityId);
        toast.success('Left community');
      } else {
        await joinCommunityAPI(communityId);
        toast.success('Joined community!');
      }

      // Reload communities to get updated state
      await loadCommunities();
    } catch (error: any) {
      console.error('Error toggling community membership:', error);
      toast.error(error.message || 'Failed to update membership');
    }
  };

  const handleCreateCommunity = async () => {
    if (!isAuthenticated()) {
      toast.error('Please sign in to create communities');
      return;
    }

    if (!newCommunity.name || !newCommunity.description) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      await createCommunityAPI({
        name: newCommunity.name,
        description: newCommunity.description,
        category: newCommunity.category || 'General',
        tags: newCommunity.tags.split(',').map(tag => tag.trim()).filter(Boolean),
        image: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=800&q=80',
      });
      
      toast.success('Community created successfully!');
      await loadCommunities();
      setIsCreateDialogOpen(false);
      setNewCommunity({ name: '', description: '', category: '', tags: '' });
    } catch (error: any) {
      console.error('Error creating community:', error);
      toast.error(error.message || 'Failed to create community');
    }
  };

  const handleEditClick = (community: Community) => {
    setSelectedCommunity(community);
    setEditCommunity({
      name: community.name,
      description: community.description,
      category: community.category,
      tags: community.tags.join(', '),
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdateCommunity = async () => {
    if (!selectedCommunity) return;

    if (!editCommunity.name || !editCommunity.description) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      await updateCommunityAPI(selectedCommunity.id, {
        name: editCommunity.name,
        description: editCommunity.description,
        category: editCommunity.category || 'General',
        tags: editCommunity.tags.split(',').map(tag => tag.trim()).filter(Boolean),
      });
      
      toast.success('Community updated successfully!');
      await loadCommunities();
      setIsEditDialogOpen(false);
      setSelectedCommunity(null);
    } catch (error: any) {
      console.error('Error updating community:', error);
      toast.error(error.message || 'Failed to update community');
    }
  };

  const handleDeleteClick = (community: Community) => {
    setSelectedCommunity(community);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteCommunity = async () => {
    if (!selectedCommunity) return;

    try {
      await deleteCommunityAPI(selectedCommunity.id);
      
      toast.success('Community deleted successfully!');
      
      // If the deleted community was selected, deselect it
      if (selectedCommunityId === selectedCommunity.id) {
        onCommunitySelect(null);
      }
      
      await loadCommunities();
      setIsDeleteDialogOpen(false);
      setSelectedCommunity(null);
    } catch (error: any) {
      console.error('Error deleting community:', error);
      toast.error(error.message || 'Failed to delete community');
    }
  };

  const filteredCommunities = communities.filter(community =>
    community.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    community.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    community.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const joinedCommunities = filteredCommunities.filter(c => c.isJoined);
  const suggestedCommunities = filteredCommunities.filter(c => !c.isJoined);
  const myCommunities = filteredCommunities.filter(c => currentUserName && c.createdBy === currentUserName);

  return (
    <div className="space-y-6">
      {/* Header with Create Button */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)} className="gap-2 w-full sm:w-auto">
          <Plus className="w-4 h-4" />
          Create Community
        </Button>
      </div>

      {/* Navigation Section */}
      <div className="bg-white rounded-lg border p-4 space-y-2">
        <div className="text-sm uppercase tracking-wide text-gray-500 mb-3">Navigate Communities</div>
        <button
          className={`w-full text-left px-3 py-2 rounded-md transition-colors ${
            selectedCommunityId === null 
              ? 'bg-primary text-primary-foreground' 
              : 'hover:bg-gray-100'
          }`}
          onClick={() => onCommunitySelect(null)}
        >
          All Communities
        </button>
        {joinedCommunities.map(community => (
          <button
            key={community.id}
            className={`w-full text-left px-3 py-2 rounded-md transition-colors ${
              selectedCommunityId === community.id 
                ? 'bg-primary text-primary-foreground' 
                : 'hover:bg-gray-100'
            }`}
            onClick={() => onCommunitySelect(community.id)}
          >
            {community.name}
          </button>
        ))}
      </div>

      <Tabs defaultValue="joined" className="w-full">
        <TabsList className="grid w-full max-w-2xl grid-cols-3">
          <TabsTrigger value="joined">
            My Communities ({joinedCommunities.length})
          </TabsTrigger>
          <TabsTrigger value="discover">
            Discover
          </TabsTrigger>
          <TabsTrigger value="manage">
            Manage ({myCommunities.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="joined" className="mt-6">
          {joinedCommunities.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {joinedCommunities.map(community => (
                <CommunityCard
                  key={community.id}
                  community={community}
                  onJoinToggle={handleJoinToggle}
                  onEdit={handleEditClick}
                  onDelete={handleDeleteClick}
                  currentUserName={currentUserName}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 border-2 border-dashed rounded-lg">
              <Users className="w-12 h-12 mx-auto text-gray-400 mb-3" />
              <h3 className="mb-2">No Communities Joined Yet</h3>
              <p className="text-gray-600 mb-4">
                Join communities to connect with like-minded food enthusiasts!
              </p>
              <Button onClick={() => document.querySelector('[value="discover"]')?.dispatchEvent(new Event('click'))}>
                Discover Communities
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="discover" className="mt-6">
          {suggestedCommunities.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {suggestedCommunities.map(community => (
                <CommunityCard
                  key={community.id}
                  community={community}
                  onJoinToggle={handleJoinToggle}
                  onEdit={handleEditClick}
                  onDelete={handleDeleteClick}
                  currentUserName={currentUserName}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500">No communities to discover. You've joined them all!</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="manage" className="mt-6">
          {!isAuthenticated() ? (
            <div className="text-center py-12 border-2 border-dashed rounded-lg">
              <Users className="w-12 h-12 mx-auto text-gray-400 mb-3" />
              <h3 className="mb-2">Sign In Required</h3>
              <p className="text-gray-600 mb-4">
                Please sign in to manage your communities
              </p>
            </div>
          ) : myCommunities.length > 0 ? (
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="text-blue-900 mb-1">Manage Your Communities</h3>
                <p className="text-sm text-blue-700">
                  View and edit all communities you've created. Click the menu icon (⋮) on any card to edit or delete.
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {myCommunities.map(community => (
                  <ManageCommunityCard
                    key={community.id}
                    community={community}
                    onEdit={handleEditClick}
                    onDelete={handleDeleteClick}
                  />
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-12 border-2 border-dashed rounded-lg">
              <Users className="w-12 h-12 mx-auto text-gray-400 mb-3" />
              <h3 className="mb-2">No Communities Created Yet</h3>
              <p className="text-gray-600 mb-4">
                Create your first community to bring food enthusiasts together!
              </p>
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create Community
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Edit Community Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Community</DialogTitle>
            <DialogDescription>
              Update your community details
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Community Name *</Label>
              <Input
                id="edit-name"
                value={editCommunity.name}
                onChange={(e) => setEditCommunity({ ...editCommunity, name: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-description">Description *</Label>
              <Textarea
                id="edit-description"
                value={editCommunity.description}
                onChange={(e) => setEditCommunity({ ...editCommunity, description: e.target.value })}
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-category">Category</Label>
              <Select
                value={editCommunity.category}
                onValueChange={(value) => setEditCommunity({ ...editCommunity, category: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Cuisine">Cuisine</SelectItem>
                  <SelectItem value="Diet-Specific">Diet-Specific</SelectItem>
                  <SelectItem value="Technique">Technique</SelectItem>
                  <SelectItem value="Lifestyle">Lifestyle</SelectItem>
                  <SelectItem value="General">General</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-tags">Tags (comma-separated)</Label>
              <Input
                id="edit-tags"
                value={editCommunity.tags}
                onChange={(e) => setEditCommunity({ ...editCommunity, tags: e.target.value })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleUpdateCommunity}
              disabled={!editCommunity.name || !editCommunity.description}
            >
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Community Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the community
              &quot;{selectedCommunity?.name}&quot; and all its posts, comments, and memberships.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteCommunity}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete Community
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Create Community Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create a New Community</DialogTitle>
            <DialogDescription>
              Start your own cooking community and bring food lovers together!
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Community Name *</Label>
              <Input
                id="name"
                value={newCommunity.name}
                onChange={(e) => setNewCommunity({ ...newCommunity, name: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={newCommunity.description}
                onChange={(e) => setNewCommunity({ ...newCommunity, description: e.target.value })}
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select
                value={newCommunity.category}
                onValueChange={(value) => setNewCommunity({ ...newCommunity, category: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Cuisine">Cuisine</SelectItem>
                  <SelectItem value="Diet-Specific">Diet-Specific</SelectItem>
                  <SelectItem value="Technique">Technique</SelectItem>
                  <SelectItem value="Lifestyle">Lifestyle</SelectItem>
                  <SelectItem value="General">General</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tags">Tags (comma-separated)</Label>
              <Input
                id="tags"
                value={newCommunity.tags}
                onChange={(e) => setNewCommunity({ ...newCommunity, tags: e.target.value })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleCreateCommunity}
              disabled={!newCommunity.name || !newCommunity.description}
            >
              Create Community
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function CommunityCard({ 
  community, 
  onJoinToggle, 
  onEdit, 
  onDelete, 
  currentUserName 
}: { 
  community: Community; 
  onJoinToggle: (id: string) => void;
  onEdit: (community: Community) => void;
  onDelete: (community: Community) => void;
  currentUserName: string | null;
}) {
  const isCreator = currentUserName && community.createdBy === currentUserName;

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <div className="relative h-32 overflow-hidden">
        <ImageWithFallback
          src={community.image}
          alt={community.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-2 right-2 flex gap-2">
          <Badge>{community.category}</Badge>
          {isCreator && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm" variant="secondary" className="h-6 w-6 p-0">
                  <MoreVertical className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEdit(community)}>
                  <Pencil className="h-4 w-4 mr-2" />
                  Edit Community
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => onDelete(community)}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Community
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      <CardHeader className="pb-3">
        <h3 className="line-clamp-1">{community.name}</h3>
        <p className="text-sm text-gray-600 line-clamp-2">{community.description}</p>
      </CardHeader>

      <CardContent className="pb-3">
        <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
          <div className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            <span>{community.memberCount.toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-1">
            <TrendingUp className="w-4 h-4" />
            <span>{community.postCount.toLocaleString()} posts</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-1">
          {community.tags.slice(0, 3).map(tag => (
            <Badge key={tag} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>
      </CardContent>

      <CardFooter className="pt-3 border-t">
        <Button
          className="w-full gap-2"
          variant={community.isJoined ? 'outline' : 'default'}
          onClick={() => onJoinToggle(community.id)}
        >
          {community.isJoined ? (
            <>
              <Check className="w-4 h-4" />
              Joined
            </>
          ) : (
            <>
              <UserPlus className="w-4 h-4" />
              Join Community
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}

function ManageCommunityCard({ 
  community, 
  onEdit, 
  onDelete 
}: { 
  community: Community; 
  onEdit: (community: Community) => void;
  onDelete: (community: Community) => void;
}) {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <div className="relative h-32 overflow-hidden">
        <ImageWithFallback
          src={community.image}
          alt={community.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-2 right-2">
          <Badge>{community.category}</Badge>
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-2 left-2 right-2">
          <div className="flex items-center gap-2 text-white text-sm">
            <div className="flex items-center gap-1">
              <Users className="w-3 h-3" />
              <span>{community.memberCount}</span>
            </div>
            <div className="flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              <span>{community.postCount} posts</span>
            </div>
          </div>
        </div>
      </div>

      <CardHeader className="pb-3">
        <h3 className="line-clamp-1">{community.name}</h3>
        <p className="text-sm text-gray-600 line-clamp-2">{community.description}</p>
      </CardHeader>

      <CardContent className="pb-3">
        <div className="flex flex-wrap gap-1">
          {community.tags.slice(0, 3).map(tag => (
            <Badge key={tag} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
          {community.tags.length > 3 && (
            <Badge variant="secondary" className="text-xs">
              +{community.tags.length - 3}
            </Badge>
          )}
        </div>
      </CardContent>

      <CardFooter className="pt-3 border-t flex gap-2">
        <Button
          className="flex-1 gap-2"
          variant="outline"
          onClick={() => onEdit(community)}
        >
          <Pencil className="w-4 h-4" />
          Edit
        </Button>
        <Button
          className="flex-1 gap-2"
          variant="destructive"
          onClick={() => onDelete(community)}
        >
          <Trash2 className="w-4 h-4" />
          Delete
        </Button>
      </CardFooter>
    </Card>
  );
}
