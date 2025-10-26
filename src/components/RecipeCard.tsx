import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Clock, Users, Star } from 'lucide-react';
import { Recipe } from '../data/mockRecipes';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface RecipeCardProps {
  recipe: Recipe;
  onClick: () => void;
}

export function RecipeCard({ recipe, onClick }: RecipeCardProps) {
  // Calculate variable height for Pinterest-style layout
  const imageHeight = recipe.id ? (parseInt(recipe.id) % 3 === 0 ? 'h-80' : parseInt(recipe.id) % 2 === 0 ? 'h-72' : 'h-64') : 'h-64';
  
  return (
    <Card 
      className="cursor-pointer hover:shadow-xl transition-all duration-300 overflow-hidden w-full group relative rounded-3xl gap-0 p-0 mb-0"
      onClick={onClick}
    >
      <div className={`relative ${imageHeight} overflow-hidden`}>
        <ImageWithFallback
          src={recipe.image}
          alt={recipe.title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        
        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
          <h3 className="text-white mb-2 line-clamp-2">{recipe.title}</h3>
          <p className="text-sm text-white/90 line-clamp-2 mb-3">{recipe.description}</p>
          
          <div className="flex flex-wrap gap-1.5 mb-3">
            {recipe.tags.slice(0, 3).map(tag => (
              <Badge key={tag} variant="secondary" className="text-xs capitalize bg-white/90 text-gray-800 rounded-full px-3">
                {tag}
              </Badge>
            ))}
          </div>

          <div className="flex items-center justify-between text-sm text-white/90">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>{recipe.cookTime}</span>
              </div>
              <div className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                <span>{recipe.servings}</span>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              <span>{recipe.rating.toFixed(1)}</span>
            </div>
          </div>
        </div>

        {/* Difficulty Badge - Always Visible */}
        <div className="absolute top-3 right-3 z-10">
          <Badge className="bg-white/90 text-gray-800 backdrop-blur-sm capitalize rounded-full px-3">
            {recipe.difficulty}
          </Badge>
        </div>
      </div>
    </Card>
  );
}