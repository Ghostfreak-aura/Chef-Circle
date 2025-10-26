import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardFooter } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './ui/dialog';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  User, 
  Edit, 
  Trash2, 
  Calendar, 
  ChefHat, 
  Award,
  Settings,
  Plus,
  X,
  Upload
} from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { getCurrentUser, getUserRecipes, updateUserRecipe, deleteUserRecipe, updateUserProfile, isAuthenticated } from '../utils/supabase/client';
import { toast } from 'sonner@2.0.3';
import { RecipeDetailDialog } from './RecipeDetailDialog';
import { Recipe } from '../data/mockRecipes';
import Masonry from 'react-responsive-masonry';

export function Profile() {
  const [user, setUser] = useState<any>(null);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isEditRecipeOpen, setIsEditRecipeOpen] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [editingRecipe, setEditingRecipe] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [profileForm, setProfileForm] = useState({
    name: '',
    bio: '',
    dietaryPreferences: [] as string[],
    skillLevel: '',
    cuisinePreferences: [] as string[],
  });

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    if (!isAuthenticated()) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const userData = await getCurrentUser();
      
      setUser(userData);
      
      if (userData) {
        setProfileForm({
          name: userData.name || '',
          bio: userData.bio || '',
          dietaryPreferences: userData.dietaryPreferences || [],
          skillLevel: userData.skillLevel || 'beginner',
          cuisinePreferences: userData.cuisinePreferences || [],
        });
      }

      let userRecipes = await getUserRecipes();
      
      // Apply any pending updates from localStorage (in case server updates failed)
      const recipeUpdates = JSON.parse(localStorage.getItem('recipeUpdates') || '{}');
      const recipeDeletions = JSON.parse(localStorage.getItem('recipeDeletions') || '[]');
      
      userRecipes = userRecipes
        .filter((recipe: any) => !recipeDeletions.includes(recipe.id))
        .map((recipe: any) => {
          if (recipeUpdates[recipe.id]) {
            return { ...recipe, ...recipeUpdates[recipe.id] };
          }
          return recipe;
        });
      
      setRecipes(userRecipes);
    } catch (error) {
      console.error('Error loading user data:', error);
      toast.error('Failed to load profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateProfile = async () => {
    try {
      await updateUserProfile(profileForm);
      toast.success('Profile updated successfully!');
      setIsEditProfileOpen(false);
      loadUserData();
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast.error(error.message || 'Failed to update profile');
    }
  };

  const handleEditRecipe = (recipe: Recipe) => {
    setEditingRecipe({
      id: recipe.id,
      title: recipe.title,
      description: recipe.description,
      image: recipe.image,
      cuisine: recipe.cuisine,
      difficulty: recipe.difficulty,
      cookTime: recipe.cookTime,
      servings: recipe.servings,
      tags: Array.isArray(recipe.tags) ? recipe.tags.join(', ') : '',
      ingredients: Array.isArray(recipe.ingredients) ? recipe.ingredients.join('\n') : '',
      instructions: Array.isArray(recipe.instructions) ? recipe.instructions.join('\n') : '',
    });
    setIsEditRecipeOpen(true);
  };

  const handleUpdateRecipe = async () => {
    if (!editingRecipe) return;

    try {
      await updateUserRecipe(editingRecipe.id, {
        title: editingRecipe.title,
        description: editingRecipe.description,
        image: editingRecipe.image,
        cuisine: editingRecipe.cuisine,
        difficulty: editingRecipe.difficulty,
        cookTime: editingRecipe.cookTime,
        servings: editingRecipe.servings,
        tags: editingRecipe.tags.split(',').map((tag: string) => tag.trim().toLowerCase()).filter(Boolean),
        ingredients: editingRecipe.ingredients.split('\n').filter(Boolean),
        instructions: editingRecipe.instructions.split('\n').filter(Boolean),
      });
      
      toast.success('Recipe updated successfully!');
      setIsEditRecipeOpen(false);
      setEditingRecipe(null);
      loadUserData();
    } catch (error: any) {
      console.error('Error updating recipe:', error);
      toast.error(error.message || 'Failed to update recipe');
    }
  };

  const handleDeleteRecipe = async (recipeId: string) => {
    if (!confirm('Are you sure you want to delete this recipe? This action cannot be undone.')) {
      return;
    }

    try {
      await deleteUserRecipe(recipeId);
      toast.success('Recipe deleted successfully!');
      loadUserData();
    } catch (error: any) {
      console.error('Error deleting recipe:', error);
      toast.error(error.message || 'Failed to delete recipe');
    }
  };

  const toggleDietaryPreference = (pref: string) => {
    setProfileForm(prev => ({
      ...prev,
      dietaryPreferences: prev.dietaryPreferences.includes(pref)
        ? prev.dietaryPreferences.filter(p => p !== pref)
        : [...prev.dietaryPreferences, pref]
    }));
  };

  const toggleCuisinePreference = (cuisine: string) => {
    setProfileForm(prev => ({
      ...prev,
      cuisinePreferences: prev.cuisinePreferences.includes(cuisine)
        ? prev.cuisinePreferences.filter(c => c !== cuisine)
        : [...prev.cuisinePreferences, cuisine]
    }));
  };

  if (!isAuthenticated()) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="max-w-md w-full text-center p-8">
          <User className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h2 className="mb-2">Sign in to view your profile</h2>
          <p className="text-muted-foreground mb-4">
            Create an account to share recipes and manage your profile
          </p>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <ChefHat className="w-16 h-16 mx-auto text-primary animate-pulse mb-4" />
          <p className="text-muted-foreground">Loading your profile...</p>
        </div>
      </div>
    );
  }

  const dietaryOptions = ['Vegan', 'Vegetarian', 'Gluten-Free', 'Keto', 'Paleo', 'Dairy-Free'];
  const cuisineOptions = ['Italian', 'Mexican', 'Asian', 'Mediterranean', 'American', 'French', 'Indian', 'Thai', 'Japanese'];

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <Avatar className="w-20 h-20">
                <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                  {user?.name?.charAt(0).toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <div>
                <h2>{user?.name || 'Anonymous'}</h2>
                <p className="text-muted-foreground">{user?.email}</p>
                {user?.bio && (
                  <p className="text-sm mt-2">{user.bio}</p>
                )}
              </div>
            </div>
            <Button onClick={() => setIsEditProfileOpen(true)} variant="outline" className="gap-2">
              <Settings className="w-4 h-4" />
              Edit Profile
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Stats */}
            <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
              <ChefHat className="w-8 h-8 text-primary" />
              <div>
                <p className="text-2xl">{recipes.length}</p>
                <p className="text-sm text-muted-foreground">Recipes Shared</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
              <Award className="w-8 h-8 text-primary" />
              <div>
                <p className="text-2xl capitalize">{user?.skillLevel || 'Beginner'}</p>
                <p className="text-sm text-muted-foreground">Skill Level</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
              <Calendar className="w-8 h-8 text-primary" />
              <div>
                <p className="text-2xl">
                  {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'N/A'}
                </p>
                <p className="text-sm text-muted-foreground">Member Since</p>
              </div>
            </div>
          </div>

          {/* Preferences */}
          {(user?.dietaryPreferences?.length > 0 || user?.cuisinePreferences?.length > 0) && (
            <div className="mt-6 space-y-4">
              {user.dietaryPreferences?.length > 0 && (
                <div>
                  <p className="text-sm mb-2">Dietary Preferences</p>
                  <div className="flex flex-wrap gap-2">
                    {user.dietaryPreferences.map((pref: string) => (
                      <Badge key={pref} variant="secondary">{pref}</Badge>
                    ))}
                  </div>
                </div>
              )}
              
              {user.cuisinePreferences?.length > 0 && (
                <div>
                  <p className="text-sm mb-2">Favorite Cuisines</p>
                  <div className="flex flex-wrap gap-2">
                    {user.cuisinePreferences.map((cuisine: string) => (
                      <Badge key={cuisine} variant="outline">{cuisine}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* My Recipes Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <h3>My Recipes</h3>
              <p className="text-sm text-muted-foreground">
                Recipes you've shared with the community
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {recipes.length > 0 ? (
            <Masonry 
              columnsCount={3}
              gutter="16px"
              columnsCountBreakPoints={{ 350: 1, 750: 2, 1024: 3 }}
            >
              {recipes.map(recipe => (
                <RecipeCardWithActions
                  key={recipe.id}
                  recipe={recipe}
                  onView={() => setSelectedRecipe(recipe)}
                  onEdit={() => handleEditRecipe(recipe)}
                  onDelete={() => handleDeleteRecipe(recipe.id)}
                />
              ))}
            </Masonry>
          ) : (
            <div className="text-center py-12 border-2 border-dashed rounded-lg">
              <ChefHat className="w-12 h-12 mx-auto text-gray-400 mb-3" />
              <h3 className="mb-2">No Recipes Yet</h3>
              <p className="text-gray-600 mb-4">
                Share your first recipe with the community!
              </p>
              <Button onClick={() => window.location.hash = '#discover'}>
                Share a Recipe
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Profile Dialog */}
      <Dialog open={isEditProfileOpen} onOpenChange={setIsEditProfileOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
            <DialogDescription>
              Update your profile information and preferences
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={profileForm.name}
                onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                value={profileForm.bio}
                onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="skillLevel">Skill Level</Label>
              <Select
                value={profileForm.skillLevel}
                onValueChange={(value) => setProfileForm({ ...profileForm, skillLevel: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner">Beginner</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                  <SelectItem value="expert">Expert</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Dietary Preferences</Label>
              <div className="flex flex-wrap gap-2">
                {dietaryOptions.map(option => (
                  <Badge
                    key={option}
                    variant={profileForm.dietaryPreferences.includes(option) ? 'default' : 'outline'}
                    className="cursor-pointer"
                    onClick={() => toggleDietaryPreference(option)}
                  >
                    {option}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Favorite Cuisines</Label>
              <div className="flex flex-wrap gap-2">
                {cuisineOptions.map(option => (
                  <Badge
                    key={option}
                    variant={profileForm.cuisinePreferences.includes(option) ? 'default' : 'outline'}
                    className="cursor-pointer"
                    onClick={() => toggleCuisinePreference(option)}
                  >
                    {option}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditProfileOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateProfile}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Recipe Dialog */}
      {editingRecipe && (
        <Dialog open={isEditRecipeOpen} onOpenChange={setIsEditRecipeOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Recipe</DialogTitle>
              <DialogDescription>
                Update your recipe details
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-title">Recipe Title</Label>
                <Input
                  id="edit-title"
                  value={editingRecipe.title}
                  onChange={(e) => setEditingRecipe({ ...editingRecipe, title: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  value={editingRecipe.description}
                  onChange={(e) => setEditingRecipe({ ...editingRecipe, description: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-cuisine">Cuisine</Label>
                  <Select
                    value={editingRecipe.cuisine}
                    onValueChange={(value) => setEditingRecipe({ ...editingRecipe, cuisine: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {cuisineOptions.map(cuisine => (
                        <SelectItem key={cuisine} value={cuisine}>{cuisine}</SelectItem>
                      ))}
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-difficulty">Difficulty</Label>
                  <Select
                    value={editingRecipe.difficulty}
                    onValueChange={(value) => setEditingRecipe({ ...editingRecipe, difficulty: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">Beginner</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-cookTime">Cook Time</Label>
                  <Input
                    id="edit-cookTime"
                    value={editingRecipe.cookTime}
                    onChange={(e) => setEditingRecipe({ ...editingRecipe, cookTime: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-servings">Servings</Label>
                  <Input
                    id="edit-servings"
                    value={editingRecipe.servings}
                    onChange={(e) => setEditingRecipe({ ...editingRecipe, servings: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-tags">Tags (comma-separated)</Label>
                <Input
                  id="edit-tags"
                  value={editingRecipe.tags}
                  onChange={(e) => setEditingRecipe({ ...editingRecipe, tags: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-ingredients">Ingredients (one per line)</Label>
                <Textarea
                  id="edit-ingredients"
                  value={editingRecipe.ingredients}
                  onChange={(e) => setEditingRecipe({ ...editingRecipe, ingredients: e.target.value })}
                  rows={5}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-instructions">Instructions (one per line)</Label>
                <Textarea
                  id="edit-instructions"
                  value={editingRecipe.instructions}
                  onChange={(e) => setEditingRecipe({ ...editingRecipe, instructions: e.target.value })}
                  rows={5}
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditRecipeOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleUpdateRecipe}>
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Recipe Detail Dialog */}
      {selectedRecipe && (
        <RecipeDetailDialog
          recipe={selectedRecipe}
          open={!!selectedRecipe}
          onClose={() => setSelectedRecipe(null)}
        />
      )}
    </div>
  );
}

function RecipeCardWithActions({ 
  recipe, 
  onView, 
  onEdit, 
  onDelete 
}: { 
  recipe: Recipe; 
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow group">
      <div className="relative cursor-pointer" onClick={onView}>
        <ImageWithFallback
          src={recipe.image}
          alt={recipe.title}
          className="w-full h-48 object-cover"
        />
        <div className="absolute top-2 right-2 flex gap-2">
          <Badge className="bg-white/90 text-black">{recipe.difficulty}</Badge>
        </div>
      </div>
      
      <CardContent className="pt-4">
        <h3 className="line-clamp-2 mb-2 cursor-pointer" onClick={onView}>{recipe.title}</h3>
        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
          {recipe.description}
        </p>
        
        <div className="flex flex-wrap gap-1 mb-3">
          {recipe.tags?.slice(0, 3).map(tag => (
            <Badge key={tag} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>
      </CardContent>

      <CardFooter className="pt-0 flex gap-2">
        <Button
          variant="outline"
          size="sm"
          className="flex-1 gap-2"
          onClick={(e) => {
            e.stopPropagation();
            onEdit();
          }}
        >
          <Edit className="w-4 h-4" />
          Edit
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="flex-1 gap-2 text-destructive hover:bg-destructive hover:text-destructive-foreground"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
        >
          <Trash2 className="w-4 h-4" />
          Delete
        </Button>
      </CardFooter>
    </Card>
  );
}
