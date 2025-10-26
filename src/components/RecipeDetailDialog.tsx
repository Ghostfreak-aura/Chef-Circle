import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Separator } from './ui/separator';
import { ScrollArea } from './ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Clock, Users, Star, Heart, Share2, MessageCircle } from 'lucide-react';
import { Recipe } from '../data/mockRecipes';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { useState, useEffect } from 'react';
import { toast } from 'sonner@2.0.3';

interface RecipeDetailDialogProps {
  recipe: Recipe;
  open: boolean;
  onClose: () => void;
}

interface Community {
  id: string;
  name: string;
  isJoined: boolean;
}

export function RecipeDetailDialog({ recipe, open, onClose }: RecipeDetailDialogProps) {
  const [isFavorited, setIsFavorited] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [comments, setComments] = useState(recipe.comments || []);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [communities, setCommunities] = useState<Community[]>([]);
  const [selectedCommunity, setSelectedCommunity] = useState<string>('');
  const [isSharing, setIsSharing] = useState(false);

  useEffect(() => {
    if (showShareDialog) {
      fetchCommunities();
    }
  }, [showShareDialog]);

  const fetchCommunities = async () => {
    try {
      const accessToken = localStorage.getItem("accessToken");
      const response = await fetch(
        "https://make-server-7d67a39c.alt.arc.dev/make-server-7d67a39c/communities",
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setCommunities(data.communities.filter((c: Community) => c.isJoined));
      }
    } catch (error) {
      console.error("Error fetching communities:", error);
    }
  };

  const handleShareToCommunity = async () => {
    if (!selectedCommunity) {
      toast.error("Please select a community");
      return;
    }

    setIsSharing(true);
    try {
      const accessToken = localStorage.getItem("accessToken");
      const response = await fetch(
        "https://make-server-7d67a39c.alt.arc.dev/make-server-7d67a39c/posts",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            communityId: selectedCommunity,
            title: `Check out this recipe: ${recipe.title}`,
            content: `${recipe.description}\n\nCook Time: ${recipe.cookTime} | Servings: ${recipe.servings}\n\nIngredients:\n${recipe.ingredients.map(i => `• ${i}`).join('\n')}`,
            image: recipe.image,
          }),
        }
      );

      if (response.ok) {
        toast.success("Recipe shared to community!");
        setShowShareDialog(false);
        setSelectedCommunity('');
      } else {
        toast.error("Failed to share recipe");
      }
    } catch (error) {
      console.error("Error sharing recipe:", error);
      toast.error("Failed to share recipe");
    } finally {
      setIsSharing(false);
    }
  };

  const handleAddComment = () => {
    if (newComment.trim()) {
      const comment = {
        id: Date.now().toString(),
        user: 'You',
        avatar: '',
        comment: newComment,
        date: 'Just now',
        rating: 5,
      };
      setComments([comment, ...comments]);
      setNewComment('');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0">
        <ScrollArea className="max-h-[90vh]">
          <div className="relative h-64 w-full">
            <ImageWithFallback
              src={recipe.image}
              alt={recipe.title}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="p-6">
            <DialogHeader>
              <DialogTitle className="text-2xl mb-2">{recipe.title}</DialogTitle>
              <DialogDescription className="sr-only">
                Recipe details for {recipe.title}
              </DialogDescription>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <span>{recipe.rating.toFixed(1)}</span>
                  <span className="text-gray-500">({recipe.reviews} reviews)</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>{recipe.cookTime}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  <span>{recipe.servings} servings</span>
                </div>
              </div>
            </DialogHeader>

            <div className="flex gap-2 mt-4">
              <Button
                variant={isFavorited ? 'default' : 'outline'}
                size="sm"
                className="gap-2"
                onClick={() => setIsFavorited(!isFavorited)}
              >
                <Heart className={`w-4 h-4 ${isFavorited ? 'fill-current' : ''}`} />
                {isFavorited ? 'Favorited' : 'Favorite'}
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="gap-2"
                onClick={() => setShowShareDialog(!showShareDialog)}
              >
                <Share2 className="w-4 h-4" />
                Share to Community
              </Button>
            </div>

            {/* Share to Community Section */}
            {showShareDialog && (
              <div className="mt-4 p-4 border rounded-lg bg-accent/20 space-y-3">
                <h4 className="text-sm">Share this recipe to a community</h4>
                <Select value={selectedCommunity} onValueChange={setSelectedCommunity}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {communities.length === 0 ? (
                      <div className="p-2 text-sm text-muted-foreground text-center">
                        Join communities to share recipes
                      </div>
                    ) : (
                      communities.map((community) => (
                        <SelectItem key={community.id} value={community.id}>
                          {community.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                <div className="flex gap-2">
                  <Button 
                    onClick={handleShareToCommunity}
                    disabled={!selectedCommunity || isSharing}
                    className="flex-1"
                    size="sm"
                  >
                    {isSharing ? 'Sharing...' : 'Share Recipe'}
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      setShowShareDialog(false);
                      setSelectedCommunity('');
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}

            <p className="mt-4 text-gray-700">{recipe.description}</p>

            <div className="flex flex-wrap gap-2 mt-4">
              {recipe.tags.map(tag => (
                <Badge key={tag} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>

            <Separator className="my-6" />

            {/* Ingredients */}
            <div>
              <h3 className="mb-3">Ingredients</h3>
              <ul className="space-y-2">
                {recipe.ingredients.map((ingredient, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-orange-500 mt-1">•</span>
                    <span className="text-gray-700">{ingredient}</span>
                  </li>
                ))}
              </ul>
            </div>

            <Separator className="my-6" />

            {/* Instructions */}
            <div>
              <h3 className="mb-3">Instructions</h3>
              <ol className="space-y-3">
                {recipe.instructions.map((instruction, index) => (
                  <li key={index} className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-orange-500 text-white flex items-center justify-center text-sm">
                      {index + 1}
                    </span>
                    <span className="text-gray-700 pt-0.5">{instruction}</span>
                  </li>
                ))}
              </ol>
            </div>

            <Separator className="my-6" />

            {/* Comments Section */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <MessageCircle className="w-5 h-5" />
                <h3>Community Comments ({comments.length})</h3>
              </div>

              {/* Add Comment */}
              <div className="space-y-3 mb-6">
                <Textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="resize-none"
                  rows={3}
                />
                <Button onClick={handleAddComment} disabled={!newComment.trim()}>
                  Post Comment
                </Button>
              </div>

              {/* Comments List */}
              <div className="space-y-4">
                {comments.map(comment => (
                  <div key={comment.id} className="flex gap-3">
                    <Avatar>
                      <AvatarImage src={comment.avatar} />
                      <AvatarFallback>{comment.user[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm">{comment.user}</span>
                        <span className="text-xs text-gray-500">{comment.date}</span>
                        <div className="flex items-center gap-1">
                          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                          <span className="text-xs">{comment.rating}</span>
                        </div>
                      </div>
                      <p className="text-sm text-gray-700">{comment.comment}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}