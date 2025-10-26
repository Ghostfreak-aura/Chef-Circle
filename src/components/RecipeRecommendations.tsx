import { useState, useEffect, useRef } from 'react';
import { RecipeCard } from './RecipeCard';
import { RecipeDetailDialog } from './RecipeDetailDialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './ui/dialog';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Search, Sparkles, Plus, RefreshCw, Upload, X } from 'lucide-react';
import { Recipe } from '../data/mockRecipes';
import { getRecipes, createRecipe, isAuthenticated } from '../utils/supabase/client';
import { toast } from 'sonner@2.0.3';
import Masonry from 'react-responsive-masonry';

export function RecipeRecommendations() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);
  const [newPost, setNewPost] = useState({
    title: '',
    description: '',
    cuisine: '',
    difficulty: 'beginner',
    cookTime: '',
    servings: '',
    tags: '',
    image: '',
    ingredients: '',
    instructions: '',
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load recipes from backend
  const loadRecipes = async () => {
    setIsGenerating(true);
    try {
      const data = await getRecipes();
      setRecipes(data);
    } catch (error) {
      console.error('Error loading recipes:', error);
      toast.error('Failed to load recipes');
    } finally {
      setIsGenerating(false);
    }
  };

  useEffect(() => {
    loadRecipes();
  }, []);

  // Filter recipes
  const getFilteredRecipes = () => {
    let filtered = [...recipes];

    if (searchQuery) {
      filtered = filtered.filter(recipe =>
        recipe.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        recipe.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        recipe.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    if (activeFilter) {
      filtered = filtered.filter(recipe =>
        recipe.tags.includes(activeFilter.toLowerCase())
      );
    }

    return filtered;
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setImagePreview(result);
        setNewPost({ ...newPost, image: result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImagePreview(null);
    setNewPost({ ...newPost, image: '' });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleCreatePost = async () => {
    if (!isAuthenticated()) {
      toast.error('Please sign in to share recipes');
      return;
    }

    if (!newPost.title || !newPost.description) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const recipeData = {
        title: newPost.title,
        description: newPost.description,
        image: newPost.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=80',
        cuisine: newPost.cuisine || 'Other',
        difficulty: newPost.difficulty,
        cookTime: newPost.cookTime || '30 min',
        servings: newPost.servings || '4',
        tags: newPost.tags.split(',').map(tag => tag.trim().toLowerCase()).filter(Boolean),
        ingredients: newPost.ingredients.split('\n').filter(Boolean),
        instructions: newPost.instructions.split('\n').filter(Boolean),
        rating: 0,
        reviews: 0,
        popularity: 'New',
        comments: [],
      };

      // Use createRecipe instead of shareRecipe to add to main recipe feed
      await createRecipe(recipeData);
      toast.success('Recipe shared successfully!');
      
      // Reload recipes
      await loadRecipes();
      
      setIsCreatePostOpen(false);
      setImagePreview(null);
      setNewPost({
        title: '',
        description: '',
        cuisine: '',
        difficulty: 'beginner',
        cookTime: '',
        servings: '',
        tags: '',
        image: '',
        ingredients: '',
        instructions: '',
      });
    } catch (error: any) {
      console.error('Error sharing recipe:', error);
      toast.error(error.message || 'Failed to share recipe');
    }
  };

  const quickFilters = [
    { label: 'Vegan', value: 'vegan' },
    { label: 'Vegetarian', value: 'vegetarian' },
    { label: 'Gluten-Free', value: 'gluten-free' },
    { label: 'Keto', value: 'keto' },
    { label: 'Quick', value: 'quick' },
    { label: 'Healthy', value: 'healthy' },
    { label: 'Seafood', value: 'seafood' },
    { label: 'Dessert', value: 'dessert' },
  ];

  const filteredRecipes = getFilteredRecipes();

  return (
    <div className="space-y-6">
      {/* Search and Actions */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 rounded-full"
          />
        </div>
        <Button
          onClick={loadRecipes}
          disabled={isGenerating}
          variant="outline"
          className="rounded-full px-4"
          type="button"
        >
          <RefreshCw className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
        </Button>
        <Button onClick={() => setIsCreatePostOpen(true)} className="gap-2 rounded-full">
          <Plus className="w-4 h-4" />
          Share Recipe
        </Button>
      </div>

      {/* Quick Filters */}
      <div className="flex flex-wrap gap-2">
        {quickFilters.map(filter => (
          <Badge
            key={filter.value}
            variant={activeFilter === filter.value ? 'default' : 'outline'}
            className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors rounded-full px-4"
            onClick={() => setActiveFilter(activeFilter === filter.value ? null : filter.value)}
          >
            {filter.label}
          </Badge>
        ))}
        {activeFilter && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setActiveFilter(null)}
            className="h-auto py-1 px-3 text-xs rounded-full"
          >
            Clear Filter
          </Button>
        )}
      </div>

      {/* Recipe Grid */}
      <MasonryGrid
        recipes={filteredRecipes}
        onRecipeClick={setSelectedRecipe}
      />

      {/* Recipe Detail Dialog */}
      {selectedRecipe && (
        <RecipeDetailDialog
          recipe={selectedRecipe}
          open={!!selectedRecipe}
          onClose={() => setSelectedRecipe(null)}
        />
      )}

      {/* Create Post Dialog */}
      <Dialog open={isCreatePostOpen} onOpenChange={setIsCreatePostOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Share Your Recipe</DialogTitle>
            <DialogDescription>
              Share your delicious creation with the community. Add details to help others recreate your dish!
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Image Upload Section */}
            <div className="space-y-2">
              <Label>Recipe Image</Label>
              {imagePreview ? (
                <div className="relative w-full h-64 rounded-2xl overflow-hidden group">
                  <img
                    src={imagePreview}
                    alt="Recipe preview"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={handleRemoveImage}
                      className="gap-2 rounded-full"
                    >
                      <X className="w-4 h-4" />
                      Remove Image
                    </Button>
                  </div>
                </div>
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-gray-300 rounded-2xl p-12 text-center cursor-pointer hover:border-primary hover:bg-accent/50 transition-colors"
                >
                  <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-sm text-gray-600 mb-1">
                    Click to upload a recipe image
                  </p>
                  <p className="text-xs text-gray-400">
                    PNG, JPG, GIF up to 10MB
                  </p>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">Recipe Title *</Label>
              <Input
                id="title"
                value={newPost.title}
                onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={newPost.description}
                onChange={(e) => setNewPost({ ...newPost, description: e.target.value })}
                rows={4}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cuisine">Cuisine</Label>
                <Select
                  value={newPost.cuisine}
                  onValueChange={(value) => setNewPost({ ...newPost, cuisine: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Italian">Italian</SelectItem>
                    <SelectItem value="Mexican">Mexican</SelectItem>
                    <SelectItem value="Asian">Asian</SelectItem>
                    <SelectItem value="Mediterranean">Mediterranean</SelectItem>
                    <SelectItem value="American">American</SelectItem>
                    <SelectItem value="French">French</SelectItem>
                    <SelectItem value="Indian">Indian</SelectItem>
                    <SelectItem value="Thai">Thai</SelectItem>
                    <SelectItem value="Japanese">Japanese</SelectItem>
                    <SelectItem value="Korean">Korean</SelectItem>
                    <SelectItem value="Middle Eastern">Middle Eastern</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="difficulty">Difficulty</Label>
                <Select
                  value={newPost.difficulty}
                  onValueChange={(value) => setNewPost({ ...newPost, difficulty: value })}
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
                <Label htmlFor="cookTime">Cook Time</Label>
                <Input
                  id="cookTime"
                  value={newPost.cookTime}
                  onChange={(e) => setNewPost({ ...newPost, cookTime: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="servings">Servings</Label>
                <Input
                  id="servings"
                  value={newPost.servings}
                  onChange={(e) => setNewPost({ ...newPost, servings: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tags">Tags (comma-separated)</Label>
              <Input
                id="tags"
                value={newPost.tags}
                onChange={(e) => setNewPost({ ...newPost, tags: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">
                Add tags to help others find your recipe
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="ingredients">Ingredients (one per line)</Label>
              <Textarea
                id="ingredients"
                value={newPost.ingredients}
                onChange={(e) => setNewPost({ ...newPost, ingredients: e.target.value })}
                rows={5}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="instructions">Instructions (one per line)</Label>
              <Textarea
                id="instructions"
                value={newPost.instructions}
                onChange={(e) => setNewPost({ ...newPost, instructions: e.target.value })}
                rows={5}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreatePostOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleCreatePost}
              disabled={!newPost.title || !newPost.description}
            >
              Share Recipe
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function MasonryGrid({ recipes, onRecipeClick }: { recipes: Recipe[]; onRecipeClick: (recipe: Recipe) => void }) {
  if (recipes.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No recipes found. Try adjusting your filters or search query.</p>
      </div>
    );
  }

  return (
    <Masonry 
      columnsCount={3}
      gutter="20px"
      columnsCountBreakPoints={{ 350: 1, 750: 2, 1024: 3 }}
    >
      {recipes.map(recipe => (
        <RecipeCard
          key={recipe.id}
          recipe={recipe}
          onClick={() => onRecipeClick(recipe)}
        />
      ))}
    </Masonry>
  );
}
