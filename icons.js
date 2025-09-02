// Icon components using Lucide React
import { Home, Heart, ShoppingBag as ShoppingList, User, Clock, CheckCircle, Leaf, Star, Plus, Minus, X, Search, ChefHat, Coffee, Sandwich, UtensilsCrossed, Cookie, Salad, Beef, Cherry, Wheat } from 'lucide-react';

// Recipe category icons
export const getCategoryIcon = (category) => {
  const iconMap = {
    breakfast: Coffee,
    lunch: Sandwich,
    dinner: UtensilsCrossed,
    dessert: Cookie,
    quick: Clock,
    vegan: Leaf,
    all: ChefHat
  };
  
  const IconComponent = iconMap[category] || ChefHat;
  return IconComponent;
};

// Recipe type icons based on title/ingredients
export const getRecipeIcon = (recipe) => {
  const title = recipe.title.toLowerCase();
  
  if (title.includes('avocado') || title.includes('toast')) return Salad;
  if (title.includes('salad') || title.includes('caesar')) return Salad;
  if (title.includes('cookie') || title.includes('chocolate')) return Cookie;
  if (title.includes('quinoa') || title.includes('bowl')) return Salad;
  if (title.includes('berry') || title.includes('smoothie')) return Cherry;
  if (title.includes('beef') || title.includes('stir')) return Beef;
  
  return ChefHat; // Default
};

// Navigation icons
export const NavIcons = {
  Home,
  Heart,
  ShoppingList,
  User
};

// UI icons
export const UIIcons = {
  Clock,
  CheckCircle,
  Leaf,
  Star,
  Plus,
  Minus,
  X,
  Search,
  ChefHat
};