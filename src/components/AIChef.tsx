import { useState, useRef, useEffect } from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Send, Sparkles, ChefHat, Loader2 } from 'lucide-react';
import { RecipeDetailDialog } from './RecipeDetailDialog';
import { getRecipes } from '../utils/supabase/client';

interface Recipe {
  id: string;
  title: string;
  description: string;
  image: string;
  cookTime: string;
  servings: string;
  difficulty: string;
  cuisine: string;
  tags: string[];
  ingredients: string[];
  instructions: string[];
  rating: number;
  reviews: number;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  recipes?: Recipe[];
}

const INITIAL_MESSAGE: Message = {
  id: '0',
  role: 'assistant',
  content: "👋 Hi! I'm your AI Chef assistant. Tell me what ingredients you have, and I'll recommend some delicious recipes!",
};

export function AIChef() {
  const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Load recipes from backend
  useEffect(() => {
    loadRecipes();
  }, []);

  const loadRecipes = async () => {
    try {
      const recipesData = await getRecipes();
      if (recipesData && Array.isArray(recipesData)) {
        setRecipes(recipesData);
      }
    } catch (error) {
      console.error('Error loading recipes:', error);
      setRecipes([]);
    }
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const generateAIResponse = async (userMessage: string): Promise<Message> => {
    const lowerMessage = userMessage.toLowerCase();
    let matchedRecipes: Recipe[] = [];
    let responseText = '';

    // Simple ingredient detection
    const ingredients = lowerMessage.match(/\b(chicken|beef|pasta|rice|tomato|garlic|cheese|fish|vegetables?|shrimp)\b/g) || [];

    if (ingredients.length > 0) {
      matchedRecipes = recipes.filter(recipe => {
        const recipeText = `${recipe.title} ${recipe.description} ${recipe.ingredients.join(' ')}`.toLowerCase();
        return ingredients.some(ing => recipeText.includes(ing));
      }).slice(0, 4);

      if (matchedRecipes.length > 0) {
        responseText = `Great! I found ${matchedRecipes.length} recipe${matchedRecipes.length > 1 ? 's' : ''} that use ${ingredients.join(', ')}. Check them out below!`;
      } else {
        responseText = `I couldn't find recipes with ${ingredients.join(', ')}. Try different ingredients or ask for a specific type of meal!`;
      }
    } else if (lowerMessage.includes('dinner') || lowerMessage.includes('lunch') || lowerMessage.includes('breakfast')) {
      matchedRecipes = recipes.slice(0, 4);
      responseText = "Here are some great recipe ideas for you!";
    } else if (lowerMessage.includes('dessert')) {
      matchedRecipes = recipes.filter(r => r.tags?.includes('dessert')).slice(0, 4);
      responseText = "Here are some delicious dessert options!";
    } else if (lowerMessage.includes('vegan') || lowerMessage.includes('vegetarian')) {
      matchedRecipes = recipes.filter(r => r.tags?.includes('vegan') || r.tags?.includes('vegetarian')).slice(0, 4);
      responseText = "Here are some plant-based recipes for you!";
    } else {
      responseText = "Tell me what ingredients you have, or ask for a specific type of meal (breakfast, lunch, dinner, dessert, etc.)!";
    }

    return {
      id: Date.now().toString(),
      role: 'assistant',
      content: responseText,
      recipes: matchedRecipes.length > 0 ? matchedRecipes : undefined,
    };
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = input;
    setInput('');
    setIsLoading(true);

    setTimeout(async () => {
      const aiResponse = await generateAIResponse(currentInput);
      setMessages(prev => [...prev, aiResponse]);
      setIsLoading(false);
    }, 800);
  };

  return (
    <div className="w-full h-full flex items-center justify-center p-6 bg-gradient-to-br from-amber-50/30 to-orange-50/30">
      <div className="max-w-4xl w-full space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="flex items-center justify-center gap-2">
          <ChefHat className="w-6 h-6" />
          Get personalized recipe recommendations
        </h1>
        <p className="text-muted-foreground">Tell your AI Chef what ingredients you have and get delicious recipe ideas</p>
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-2">
        <Badge 
          variant="outline" 
          className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors rounded-full px-4 py-2"
          onClick={() => setInput("I have chicken and garlic")}
        >
          <Sparkles className="w-3.5 h-3.5 mr-1.5" />
          Chicken recipes
        </Badge>
        <Badge 
          variant="outline"
          className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors rounded-full px-4 py-2"
          onClick={() => setInput("Quick dinner ideas")}
        >
          <Sparkles className="w-3.5 h-3.5 mr-1.5" />
          Quick dinner
        </Badge>
        <Badge 
          variant="outline"
          className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors rounded-full px-4 py-2"
          onClick={() => setInput("Vegan recipes")}
        >
          <Sparkles className="w-3.5 h-3.5 mr-1.5" />
          Vegan options
        </Badge>
      </div>

      {/* Chat Container */}
      <Card className="h-[600px] flex flex-col rounded-3xl shadow-lg overflow-hidden">
        <div 
          ref={scrollRef}
          className="flex-1 p-6 overflow-y-auto scrollbar-custom"
          style={{ 
            scrollbarWidth: 'thin',
            scrollbarColor: '#d4c4b0 #f5f1ed'
          }}
        >
          <div className="space-y-6">{messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 ${
                message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
              }`}
            >
              <Avatar className="w-10 h-10">
                <AvatarFallback className={message.role === 'assistant' ? 'bg-primary text-primary-foreground' : 'bg-primary text-primary-foreground'}>
                  {message.role === 'assistant' ? <ChefHat className="w-5 h-5" /> : 'U'}
                </AvatarFallback>
              </Avatar>
              
              <div className={`flex-1 space-y-3 ${message.role === 'user' ? 'flex flex-col items-end' : ''}`}>
                <div
                  className={`rounded-3xl p-4 ${
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground max-w-[80%]'
                      : 'bg-muted max-w-[90%]'
                  }`}
                >
                  <p className="text-sm whitespace-pre-line">{message.content}</p>
                </div>
                
                {message.recipes && message.recipes.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full">
                    {message.recipes.map((recipe) => (
                      <Card 
                        key={recipe.id}
                        className="hover:shadow-lg transition-all cursor-pointer rounded-2xl overflow-hidden"
                        onClick={() => setSelectedRecipe(recipe)}
                      >
                        <img
                          src={recipe.image}
                          alt={recipe.title}
                          className="w-full h-32 object-cover"
                        />
                        <CardContent className="p-3">
                          <h4 className="line-clamp-1 mb-1">{recipe.title}</h4>
                          <p className="text-xs text-muted-foreground line-clamp-2">
                            {recipe.description}
                          </p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex gap-3">
              <Avatar className="w-10 h-10">
                <AvatarFallback className="bg-primary text-primary-foreground">
                  <ChefHat className="w-5 h-5" />
                </AvatarFallback>
              </Avatar>
              <div className="bg-muted rounded-3xl p-4 flex items-center gap-3">
                <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Thinking...</span>
              </div>
            </div>
          )}
          </div>
        </div>

        {/* Input Area */}
        <CardContent className="border-t p-4 bg-muted/30">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex gap-2"
          >
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 rounded-full border-2 focus:border-primary"
              disabled={isLoading}
            />
            <Button 
              type="submit" 
              disabled={!input.trim() || isLoading} 
              className="rounded-full px-6"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {selectedRecipe && (
        <RecipeDetailDialog
          recipe={selectedRecipe}
          open={!!selectedRecipe}
          onClose={() => setSelectedRecipe(null)}
        />
      )}
      </div>
    </div>
  );
}